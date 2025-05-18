const amqp = require("amqplib")
const notificationService = require("./notificationService")

let connection = null
let channel = null

// Connect to RabbitMQ
async function connect() {
  try {
    // In a real app, the connection URL would come from environment variables
    const url = process.env.RABBITMQ_URL || "amqp://localhost"
    connection = await amqp.connect(url)
    channel = await connection.createChannel()

    // Create the notifications queue
    await channel.assertQueue("notifications", { durable: true })

    // Start consuming messages
    await consumeMessages()

    return { connection, channel }
  } catch (error) {
    console.error("Error connecting to RabbitMQ:", error)
    throw error
  }
}

// Close RabbitMQ connection
async function close() {
  if (channel) await channel.close()
  if (connection) await connection.close()
}

// Send message to queue
async function sendToQueue(queue, message) {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized")
  }

  return channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true })
}

// Consume messages from the queue
async function consumeMessages() {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized")
  }

  // Get notifications object from the router module
  const { notifications } = require("../routes/notifications")

  channel.consume("notifications", async (msg) => {
    if (msg) {
      try {
        const notification = JSON.parse(msg.content.toString())
        console.log(`Processing notification: ${notification.id}`)

        // Update notification status
        const userNotifications = notifications[notification.userId] || []
        const notificationIndex = userNotifications.findIndex((n) => n.id === notification.id)

        if (notificationIndex !== -1) {
          notifications[notification.userId][notificationIndex].status = "processing"
          notifications[notification.userId][notificationIndex].attempts += 1
        }

        // Process the notification based on type
        let success = false

        try {
          switch (notification.type) {
            case "email":
              success = await notificationService.sendEmail(notification)
              break
            case "sms":
              success = await notificationService.sendSMS(notification)
              break
            case "in-app":
              success = await notificationService.sendInApp(notification)
              break
            default:
              console.error(`Unknown notification type: ${notification.type}`)
          }

          // Update notification status
          if (notificationIndex !== -1) {
            notifications[notification.userId][notificationIndex].status = success ? "delivered" : "failed"
          }

          // If successful, acknowledge the message
          if (success) {
            channel.ack(msg)
          } else {
            // Implement retry logic
            const MAX_RETRIES = 3

            if (notification.attempts < MAX_RETRIES) {
              // Requeue with a delay (using setTimeout as a simple approach)
              setTimeout(() => {
                sendToQueue("notifications", notification)
                channel.ack(msg)
              }, 5000 * notification.attempts) // Exponential backoff
            } else {
              // Max retries reached, acknowledge and mark as permanently failed
              if (notificationIndex !== -1) {
                notifications[notification.userId][notificationIndex].status = "failed_permanent"
              }
              channel.ack(msg)
            }
          }
        } catch (error) {
          console.error(`Error processing notification ${notification.id}:`, error)

          // Handle error similar to failure case
          if (notificationIndex !== -1) {
            notifications[notification.userId][notificationIndex].status = "error"
          }

          // Implement retry logic
          const MAX_RETRIES = 3

          if (notification.attempts < MAX_RETRIES) {
            setTimeout(() => {
              sendToQueue("notifications", notification)
              channel.ack(msg)
            }, 5000 * notification.attempts)
          } else {
            if (notificationIndex !== -1) {
              notifications[notification.userId][notificationIndex].status = "failed_permanent"
            }
            channel.ack(msg)
          }
        }
      } catch (error) {
        console.error("Error parsing message:", error)
        channel.ack(msg) // Acknowledge to avoid blocking the queue
      }
    }
  })
}

module.exports = {
  connect,
  close,
  sendToQueue,
}

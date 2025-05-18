const express = require("express")
const router = express.Router()
const notificationService = require("../services/notificationService")
const queueService = require("../services/queue")

// In-memory storage for notifications (in a real app, this would be a database)
const notifications = {}

// Send a notification
router.post("/notifications", async (req, res) => {
  try {
    const { userId, type, message, title } = req.body

    if (!userId || !type || !message) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    if (!["email", "sms", "in-app"].includes(type)) {
      return res.status(400).json({ error: "Invalid notification type" })
    }

    const notification = {
      id: Date.now().toString(),
      userId,
      type,
      message,
      title: title || "Notification",
      status: "queued",
      createdAt: new Date(),
      attempts: 0,
    }

    // Store notification
    if (!notifications[userId]) {
      notifications[userId] = []
    }
    notifications[userId].push(notification)

    // Send to queue for processing
    await queueService.sendToQueue("notifications", notification)

    res.status(201).json({
      message: "Notification queued successfully",
      notificationId: notification.id,
    })
  } catch (error) {
    console.error("Error sending notification:", error)
    res.status(500).json({ error: "Failed to send notification" })
  }
})

// Get user notifications
router.get("/users/:id/notifications", (req, res) => {
  const userId = req.params.id
  const userNotifications = notifications[userId] || []

  res.json(userNotifications)
})

// UI route to view notifications for a user
router.get("/dashboard/:userId", (req, res) => {
  const userId = req.params.userId
  const userNotifications = notifications[userId] || []

  res.render("dashboard", {
    userId,
    notifications: userNotifications,
  })
})

// UI route to send a new notification
router.get("/send", (req, res) => {
  res.render("send")
})

// Export the notifications object for the worker to access
module.exports = { router, notifications }

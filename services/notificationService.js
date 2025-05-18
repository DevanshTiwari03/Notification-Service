// Mock notification services
// In a real application, these would connect to actual email/SMS providers

// Mock email service
async function sendEmail(notification) {
  console.log(`Sending EMAIL to user ${notification.userId}: ${notification.message}`)

  // Simulate random success/failure for demo purposes
  const success = Math.random() > 0.3 // 70% success rate

  if (success) {
    console.log(`Email sent successfully to user ${notification.userId}`)
  } else {
    console.log(`Failed to send email to user ${notification.userId}`)
  }

  return success
}

// Mock SMS service
async function sendSMS(notification) {
  console.log(`Sending SMS to user ${notification.userId}: ${notification.message}`)

  // Simulate random success/failure for demo purposes
  const success = Math.random() > 0.2 // 80% success rate

  if (success) {
    console.log(`SMS sent successfully to user ${notification.userId}`)
  } else {
    console.log(`Failed to send SMS to user ${notification.userId}`)
  }

  return success
}

// In-app notification (always succeeds in this demo)
async function sendInApp(notification) {
  console.log(`Sending IN-APP notification to user ${notification.userId}: ${notification.message}`)
  console.log(`In-app notification sent successfully to user ${notification.userId}`)

  return true
}

module.exports = {
  sendEmail,
  sendSMS,
  sendInApp,
}

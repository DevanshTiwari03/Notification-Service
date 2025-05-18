const express = require("express")
const bodyParser = require("body-parser")
const path = require("path")
const { router: notificationRoutes } = require("./routes/notifications")
const queueService = require("./services/queue")

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))

// View engine setup
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

// Routes
app.use("/", notificationRoutes)

// Home page
app.get("/", (req, res) => {
  res.render("index")
})

// Initialize queue and start server
async function startServer() {
  try {
    await queueService.connect()
    console.log("Connected to RabbitMQ")

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

startServer()

// Handle graceful shutdown
process.on("SIGINT", async () => {
  try {
    await queueService.close()
    console.log("Closed RabbitMQ connection")
    process.exit(0)
  } catch (error) {
    console.error("Error during shutdown:", error)
    process.exit(1)
  }
})

module.exports = app

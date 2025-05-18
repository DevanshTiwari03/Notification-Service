# Notification Service

A simple notification service that supports email, SMS, and in-app notifications with a queuing system for reliable delivery.

## Features

- Send notifications via API
- View user notifications
- Support for multiple notification types (Email, SMS, In-app)
- Queue-based processing with RabbitMQ
- Automatic retries for failed notifications
- Simple web interface for testing

## Tech Stack

- Node.js & Express
- EJS templates for views
- RabbitMQ for message queuing
- HTML & CSS for the frontend

## API Endpoints

- `POST /notifications` - Send a notification
- `GET /users/{id}/notifications` - Get all notifications for a user

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- RabbitMQ server

### Installation

1. Clone the repository:
   \`\`\`
   git clone <repository-url>
   cd notification-service
   \`\`\`

2. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

3. Make sure RabbitMQ is running:
   - For local development, you can run RabbitMQ using Docker:
     \`\`\`
     docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management
     \`\`\`
   - Or install it directly on your system: https://www.rabbitmq.com/download.html

4. Start the application:
   \`\`\`
   npm start
   \`\`\`

5. Access the application:
   - Open your browser and navigate to `http://localhost:3000`

## Usage

### Web Interface

1. Home page: `http://localhost:3000`
   - Links to send notifications and view user dashboards

2. Send notification: `http://localhost:3000/send`
   - Fill out the form to send a notification

3. View user notifications: `http://localhost:3000/dashboard/{userId}`
   - View all notifications for a specific user

### API Usage

Send a notification:
\`\`\`
POST /notifications
Content-Type: application/json

{
  "userId": "123",
  "type": "email",
  "title": "Welcome",
  "message": "Welcome to our platform!"
}
\`\`\`

Get user notifications:
\`\`\`
GET /users/123/notifications
\`\`\`

## Assumptions

1. **Storage**: For simplicity, this demo uses in-memory storage. In a production environment, you would use a database like MongoDB, PostgreSQL, etc.

2. **Authentication**: This demo doesn't include authentication. In a real application, you would implement proper authentication and authorization.

3. **Email/SMS Services**: The notification sending is mocked. In a production environment, you would integrate with actual email services (like SendGrid, Mailgun) and SMS providers (like Twilio).

4. **Scalability**: For a production system, you would need to consider horizontal scaling, load balancing, and possibly sharding for high-volume notification systems.

5. **Monitoring**: In production, you would add monitoring, logging, and alerting systems.

## Potential Improvements

1. Add a database for persistent storage
2. Implement user authentication
3. Add real email and SMS service integrations
4. Add notification templates
5. Implement notification preferences for users
6. Add more comprehensive error handling and logging
7. Add unit and integration tests

## CloudAMQP Setup

This application uses CloudAMQP for message queueing. To set it up:

1. Sign up for a CloudAMQP account at [cloudamqp.com](https://www.cloudamqp.com/)
2. Create a new instance (the free tier "Lemur" plan works for development)
3. Once your instance is created, copy the AMQP URL from your instance details
4. Create a `.env` file in the project root with the following content:
   ```
   RABBITMQ_URL=amqps://your-cloudamqp-url-here
   PORT=3000
   ```
5. Replace `your-cloudamqp-url-here` with the actual URL from CloudAMQP

The application will automatically use this URL to connect to CloudAMQP instead of a local RabbitMQ server.

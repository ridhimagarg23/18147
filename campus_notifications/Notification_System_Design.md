# Campus Notifications Microservice: System Design

## Stage 1: API Request Payload (JSON)

We need an endpoint to send notifications. It should accept the student identifier, type, title, and body.

**Endpoint:** `POST /api/v1/notifications/send`

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <token>`

**Request Payload:**
```json
{
  "studentId": "string (UUID)",
  "type": "string (Placement | Result | Event | Others)",
  "title": "string (Max 100 chars)",
  "body": "string",
  "priority": "integer (Optional - overridden by type if needed)",
  "scheduledFor": "timestamp (Optional - for delayed delivery)"
}
```

## Stage 2: Database Schema Mapping

A relational database (like PostgreSQL) is suitable for strong consistency, while a NoSQL database (like MongoDB) could be used if unstructured metadata is heavily required. We'll use a standard relational model.

**Table: Notifications**
- `id` (UUID, Primary Key)
- `student_id` (UUID, Indexed)
- `type` (Enum: 'Placement', 'Result', 'Event', 'Others', Indexed)
- `title` (VARCHAR 100)
- `body` (TEXT)
- `status` (Enum: 'Pending', 'Sent', 'Failed', 'Read', Default: 'Pending')
- `created_at` (TIMESTAMP, Indexed)
- `updated_at` (TIMESTAMP)

## Stage 3: Microservice Communication Pattern

For high throughput and reliability, asynchronous communication using a Message Queue (e.g., RabbitMQ, Kafka, or AWS SQS) is strongly recommended over synchronous API calls.

**Architecture:**
1. **Producer:** The core system (e.g., placement portal) publishes a message to a `notifications_queue` when an event occurs.
2. **Message Broker:** RabbitMQ/Kafka holds the message reliably.
3. **Consumer (Notifications Service):** Listens to the queue, persists the notification to the database, and pushes it to the student (via WebSockets/FCM for mobile/web push, or email/SMS integrations).

*Why a Queue?* 
- **Decoupling:** The main system isn't blocked by notification processing.
- **Scalability:** We can scale consumers horizontally during peak placement season.
- **Reliability:** If the notification service crashes, messages remain in the queue and won't be lost.

## Stage 4: API Response Payload (JSON)

When a notification is retrieved by the frontend (for an inbox view), the response should be structured as follows.

**Endpoint:** `GET /api/v1/notifications/inbox?studentId=<id>`

**Response Payload:**
```json
{
  "status": "success",
  "data": {
    "totalUnread": 5,
    "notifications": [
      {
        "id": "uuid",
        "type": "Placement",
        "title": "Interview Scheduled",
        "body": "Your interview with TechCorp is scheduled for tomorrow at 10 AM.",
        "status": "Unread",
        "createdAt": "2024-05-20T10:00:00Z"
      }
    ]
  }
}
```
*(Note: The list of notifications here will be sorted according to the Priority Inbox logic implemented in Stage 6).*

## Stage 5: Dead Letter Queue (DLQ) Logic

A Dead Letter Queue is essential for handling messages that fail to process.

**Logic Flow:**
1. When a message is pulled from the primary queue, the service attempts to deliver it (e.g., via Email API or Push Notification service).
2. If the delivery fails due to a transient error (e.g., rate limit, network timeout), the message is retried (up to 3 times) with exponential backoff.
3. If delivery fails permanently (e.g., invalid email address, student opted out) OR the maximum retry count is reached, the message is routed to the **Dead Letter Queue (DLQ)**.
4. Alerts are set up on the DLQ length. Engineering/Support teams can inspect DLQ messages to find the root cause (e.g., malformed payload or third-party service outage).
5. The system can provide a mechanism to manually or automatically replay messages from the DLQ back to the main queue once the issue is resolved.

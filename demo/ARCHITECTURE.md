# Demo Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         HTTP Request                            │
│                    POST /click (ad data)                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Click Ingestion API │  (Publisher)
              │    (Port 3000)       │
              └──────────┬───────────┘
                         │ publishes
                         ▼
              ┌──────────────────────┐
              │     Event Bus        │  (Message Broker)
              │   (In-Memory)        │
              └──────────┬───────────┘
                         │
                         │ Topic: click-events
                         │
                         ▼
              ┌──────────────────────┐
              │  Fraud Detection     │  (Subscriber 1)
              │     Service          │
              └──────────┬───────────┘
                         │
                         ├─ if fraud → Topic: fraud-alerts
                         │
                         └─ if valid → Topic: validated-clicks
                                       │
                                       ▼
                            ┌──────────────────────┐
                            │  Billing Service     │  (Subscriber 2)
                            │                      │
                            └──────────┬───────────┘
                                       │
                                       │ Topic: billing-events
                                       │
                                       ▼
                            ┌──────────────────────┐
                            │  Analytics Service   │  (Subscriber 3)
                            │                      │
                            └──────────────────────┘
```

## Message Flow

### 1. Click Received
```
HTTP POST → Click Ingestion API
```

### 2. Event Published
```
Click Ingestion → Event Bus → Topic: "click-events"
```

### 3. Fraud Detection
```
Event Bus → Fraud Detection Service
  ├─ Analyze click
  ├─ Calculate fraud score
  └─ Publish result
      ├─ If valid → Topic: "validated-clicks"
      └─ If fraud → Topic: "fraud-alerts"
```

### 4. Billing Processing
```
Event Bus → Billing Service (subscribes to "validated-clicks")
  ├─ Calculate cost
  ├─ Check budget
  ├─ Create transaction
  └─ Publish → Topic: "billing-events"
```

### 5. Analytics Update
```
Event Bus → Analytics Service (subscribes to "billing-events")
  ├─ Update metrics
  ├─ Aggregate by campaign
  └─ Store statistics
```

## Pub-Sub Principles Demonstrated

### Decoupling
- Services don't know about each other
- Changes to one service don't affect others
- Services can be developed independently

### Scalability
- Can run multiple instances of any service
- Each instance receives the same events
- Load is distributed automatically

### Flexibility
- Easy to add new subscribers
- No changes needed to publishers
- New topics can be created on-the-fly

### Asynchronous Processing
- Non-blocking operations
- Services process at their own pace
- System remains responsive

## Event Payload Examples

### Click Event
```json
{
  "event_id": "click_1699...",
  "timestamp": "2024-11-07T10:30:00.000Z",
  "ad_id": "ad-001",
  "campaign_id": "campaign-101",
  "advertiser_id": "advertiser-501",
  "click_data": {
    "ip_address": "203.0.113.42",
    "user_agent": "Mozilla/5.0...",
    "referrer": "https://example.com"
  },
  "cost_data": {
    "bid_amount": 0.75,
    "currency": "USD"
  }
}
```

### Validated Click Event
```json
{
  ...click_event,
  "fraud_analysis": {
    "is_fraud": false,
    "fraud_score": 0.15,
    "decision": "valid",
    "indicators": []
  }
}
```

### Billing Event
```json
{
  "transaction_id": "txn_1699...",
  "click_event_id": "click_1699...",
  "advertiser_id": "advertiser-501",
  "campaign_id": "campaign-101",
  "amount": 0.72,
  "currency": "USD",
  "timestamp": "2024-11-07T10:30:01.000Z"
}
```

## Topics and Subscribers

| Topic | Publisher | Subscribers |
|-------|-----------|-------------|
| click-events | Click Ingestion | Fraud Detection |
| validated-clicks | Fraud Detection | Billing Service |
| billing-events | Billing Service | Analytics Service |
| fraud-alerts | Fraud Detection | (None in demo) |

## Extending the Architecture

### Add a Reporting Service
```javascript
// Subscribe to billing-events
eventBus.subscribe('billing-events', (event) => {
  // Generate reports
});
```

### Add a Notification Service
```javascript
// Subscribe to fraud-alerts
eventBus.subscribe('fraud-alerts', (event) => {
  // Send alerts
});
```

### Add Multiple Topics
```javascript
// Publisher can publish to multiple topics
eventBus.publish('click-events', data);
eventBus.publish('audit-log', data);
```

## Performance Characteristics

- **Latency**: ~300ms end-to-end (with simulated delays)
- **Throughput**: Limited only by Node.js event loop
- **Scalability**: Horizontal scaling of subscribers
- **Reliability**: In-memory (no persistence in demo)

## Production Considerations

In a real system, you would use:
- **Apache Kafka** or **RabbitMQ** for message broker
- **Persistent storage** for message durability
- **Message partitioning** for parallel processing
- **Dead letter queues** for failed messages
- **Monitoring and alerting** for system health

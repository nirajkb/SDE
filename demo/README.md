# Ad Click Charging System - Pub-Sub Demo

This demo illustrates the publish-subscribe architecture pattern for processing ad clicks in real-time.

## Architecture Overview

The system demonstrates key pub-sub principles:

- **Decoupling**: Services don't directly communicate with each other
- **Scalability**: Multiple subscribers can process the same events independently
- **Asynchronous Processing**: Non-blocking event-driven architecture
- **Flexibility**: Easy to add new subscribers without modifying existing services

## Components

### Publisher
- **Click Ingestion Service**: HTTP API that receives ad clicks and publishes events

### Message Broker
- **Event Bus**: In-memory pub-sub implementation using Node.js EventEmitter

### Subscribers
- **Fraud Detection Service**: Analyzes clicks for fraud patterns
- **Billing Service**: Processes charges for valid clicks
- **Analytics Service**: Aggregates metrics and statistics

### Topics
- `click-events`: Raw clicks from the API
- `validated-clicks`: Clicks that passed fraud detection
- `billing-events`: Successfully charged clicks
- `fraud-alerts`: Detected fraudulent clicks

## Prerequisites

- Node.js 14 or higher
- npm or yarn

## Installation

```bash
cd demo
npm install
```

## Running the Demo

### Option 1: Manual Testing (Recommended)

**Terminal 1 - Start the services:**
```bash
npm start
```

**Terminal 2 - Send test clicks:**
```bash
# Send a single click
npm test

# Send multiple clicks
npm run test:multiple
```

### Option 2: Automated Demo

Run with automatic test clicks:
```bash
npm run start:auto
```

## What to Observe

When you send a click, watch the console output to see:

1. **Click Ingestion** receives the HTTP request
2. **Event Bus** publishes to `click-events` topic
3. **Fraud Detection** processes the click
   - If valid: publishes to `validated-clicks`
   - If fraud: publishes to `fraud-alerts`
4. **Billing Service** processes validated clicks
   - Calculates cost
   - Creates transaction
   - Publishes to `billing-events`
5. **Analytics Service** updates metrics from billing events

## Example Output

```
[Click Ingestion] Received click for ad: ad-001
[Event Bus] Publishing to topic: click-events
[Event Bus] 1 subscriber(s) notified

[Fraud Detection] Processing click: click_1699...
[Fraud Detection] ✓ Click validated (fraud_score: 0.15)
[Event Bus] Publishing to topic: validated-clicks
[Event Bus] 1 subscriber(s) notified

[Billing Service] Processing validated click: click_1699...
[Billing Service] ✓ Charged $0.72 to advertiser: advertiser-501
[Event Bus] Publishing to topic: billing-events
[Event Bus] 1 subscriber(s) notified

[Analytics Service] Processing billing event: txn_1699...
[Analytics Service] ✓ Updated metrics for campaign: campaign-101
```

## API Endpoints

### POST /click
Send a click event:
```bash
curl -X POST http://localhost:3000/click \
  -H "Content-Type: application/json" \
  -d '{
    "ad_id": "ad-001",
    "campaign_id": "campaign-101",
    "advertiser_id": "advertiser-501",
    "bid_amount": 0.75
  }'
```

### GET /stats
View system statistics:
```bash
curl http://localhost:3000/stats
```

### GET /health
Check service health:
```bash
curl http://localhost:3000/health
```

## Key Pub-Sub Concepts Demonstrated

### 1. Loose Coupling
Services communicate through events, not direct calls. Each service can be developed, deployed, and scaled independently.

### 2. Multiple Subscribers
The same `click-events` message is consumed by Fraud Detection, while `validated-clicks` is consumed by Billing, and `billing-events` by Analytics.

### 3. Event-Driven Flow
```
Click → Fraud Check → Billing → Analytics
```
Each stage publishes events that trigger the next stage, creating a processing pipeline.

### 4. Asynchronous Processing
All services process events asynchronously without blocking each other. If one service is slow, others continue working.

### 5. Scalability
You can run multiple instances of any subscriber service, and they'll all receive the same events (in a real system with proper message queuing).

## Extending the Demo

### Add a New Subscriber

Create a new file in `subscribers/`:

```javascript
const eventBus = require('../message-broker/event-bus');

class MyNewService {
  start() {
    eventBus.subscribe('click-events', (eventData) => {
      console.log('[My Service] Processing:', eventData.message);
    });
  }
}

module.exports = MyNewService;
```

Add it to `demo-runner.js`:

```javascript
const MyNewService = require('./subscribers/my-new-service');
// ...
this.services.myService = new MyNewService();
// ...
this.services.myService.start();
```

### Add a New Topic

Simply publish to a new topic name:

```javascript
eventBus.publish('my-new-topic', { data: 'value' });
```

Any service can subscribe to it:

```javascript
eventBus.subscribe('my-new-topic', callback);
```

## Stopping the Demo

Press `Ctrl+C` in the terminal running the demo. The system will display final statistics before shutting down.

## Troubleshooting

**Port 3000 already in use:**
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9
```

**Module not found:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

## Learning Objectives

After running this demo, you should understand:

- How pub-sub architecture enables loose coupling
- How events flow through a distributed system
- How multiple services can process the same events
- How to build scalable, event-driven systems
- The benefits and trade-offs of pub-sub patterns

## Next Steps

- Review the code in each service to understand the implementation
- Modify the fraud detection logic to see how it affects the flow
- Add your own subscriber service
- Experiment with different event payloads
- Consider how this would scale with real message queues (Kafka, RabbitMQ)

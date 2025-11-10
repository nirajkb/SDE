# Ad Click Charging System - Source Code

This is the main implementation of the pub-sub architecture for our academic project.

## What's Inside

- `config/event-bus.js` - The pub-sub message broker (like a message board)
- `services/click-ingestion.js` - Publisher that receives clicks
- `services/fraud-detection.js` - Subscriber that checks for fraud
- `services/billing-service.js` - Subscriber that charges advertisers
- `services/analytics-service.js` - Subscriber that tracks statistics
- `utils/logger.js` - Simple logging helper
- `app.js` - Main file that starts everything

## How to Run

1. Install dependencies:
```bash
cd src
npm install
```

2. Start the system:
```bash
npm start
```

3. Send a test click (in another terminal):
```bash
curl -X POST http://localhost:3000/click \
  -H "Content-Type: application/json" \
  -d '{"ad_id":"ad-001","campaign_id":"camp-101","advertiser_id":"adv-501","bid_amount":0.75}'
```

## How It Works

1. **Click Ingestion** receives a click via HTTP POST
2. It publishes the click to the "click-events" topic
3. **Fraud Detection** is subscribed to "click-events" and checks the click
4. If valid, it publishes to "validated-clicks" topic
5. **Billing Service** is subscribed to "validated-clicks" and charges the advertiser
6. It publishes to "billing-events" topic
7. **Analytics Service** is subscribed to "billing-events" and updates stats

This is the **pub-sub pattern** - services don't talk directly to each other, they communicate through topics!

## Key Concepts

- **Publisher**: Sends messages to topics (Click Ingestion)
- **Subscriber**: Listens to topics and processes messages (Fraud, Billing, Analytics)
- **Topic**: A category of messages (like "click-events", "validated-clicks")
- **Event Bus**: The message broker that connects publishers and subscribers

## Notes

This is a simplified implementation for learning purposes. A real production system would use:
- Apache Kafka instead of in-memory event bus
- MySQL database for storing data
- Redis for caching
- Docker for deployment
- Much more error handling and logging

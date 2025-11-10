# Ad Click Charging System
## Pub-Sub Architecture Implementation

**Software Design and Engineering**  
**Academic Project - November 2024**

---

## Slide 1: Title

# Ad Click Charging System
### Using Publish-Subscribe Architecture

**Student Project**  
Software Design and Engineering Course

---

## Slide 2: Problem Statement

### The Challenge

Online advertising platforms need to:
- Process millions of ad clicks daily
- Detect fraudulent clicks
- Charge advertisers accurately
- Track analytics in real-time
- Scale as traffic grows

**Question**: How do we build a system that can handle all this?

---

## Slide 3: Solution - Pub-Sub Architecture

### What is Pub-Sub?

**Publish-Subscribe Pattern**:
- Publishers send messages to topics
- Subscribers listen to topics they care about
- Publishers and subscribers don't know about each other

**Benefits**:
- Loose coupling
- Easy to scale
- Easy to add new features

---

## Slide 4: System Architecture

```
        Client
          │
          ▼
    ┌──────────────┐
    │   Click      │ ◄── Publisher
    │  Ingestion   │
    └──────┬───────┘
           │ publishes
           ▼
    ┌──────────────┐
    │  Event Bus   │ ◄── Message Broker
    └──────┬───────┘
           │
    ┌──────┴───────┬──────────┬──────────┐
    ▼              ▼          ▼          ▼
┌──────-──┐   ┌────────┐ ┌────-────┐ ┌────────┐
│ Fraud   │   │Billing │ │Analytics│ │ Future │
│Detection│   │Service │ │Service  │ │Services│
└────────-┘   └────────┘ └─────-───┘ └────────┘
    Subscribers
```

---

## Slide 5: Event Flow

### How a Click is Processed

1. **Client** → Sends click via HTTP
2. **Click Ingestion** → Publishes to `click-events`
3. **Fraud Detection** → Checks click, publishes to `validated-clicks`
4. **Billing Service** → Charges advertiser, publishes to `billing-events`
5. **Analytics Service** → Updates metrics

**Key Point**: Each service works independently!

---

## Slide 6: Components

### Publisher
**Click Ingestion Service**
- Receives HTTP requests
- Validates input
- Publishes events

### Subscribers
**Fraud Detection**
- Analyzes clicks
- Calculates fraud score
- Blocks suspicious clicks

**Billing Service**
- Checks budget
- Charges advertiser
- Tracks spending

**Analytics Service**
- Updates metrics
- Tracks campaigns
- Generates reports

---

## Slide 7: Technology Stack

### What We Used

- **Language**: JavaScript (Node.js)
- **Web Framework**: Express.js
- **Event System**: Node.js EventEmitter
- **Package Manager**: npm

### Why Node.js?
- Good for I/O operations
- Built-in event system
- Easy to learn
- Large community

---

## Slide 8: Fraud Detection

### How We Detect Fraud

**Scoring System**:
- Missing user agent: +0.3
- Bot in user agent: +0.5
- Private IP address: +0.2
- Random factor: +0.0-0.2

**Decision**:
- Score >= 0.7 → Fraud (blocked)
- Score < 0.7 → Valid (processed)

**Result**: Protects advertisers from fake clicks

---

## Slide 9: Billing Logic

### How We Calculate Cost

```
Final Cost = Bid Amount × Quality Score × Time Adjustment
```

**Quality Score** = 1 - fraud_score  
(Lower fraud = higher quality = charge more)

**Time Adjustment**:
- Peak hours (9am-5pm): ×1.2
- Off-peak hours: ×0.8

**Budget Tracking**:
- Each advertiser has budget
- Budget decreases with each charge
- Clicks rejected when budget exhausted

---

## Slide 10: Demo - Budget Tracking

### Real-Time Budget Updates

```
BILLING TRANSACTION
--------------------------------------------------
Advertiser: adv-501
Campaign: camp-101
Amount Charged: $0.60
Budget Before: $100.00
Budget After: $99.40
Total Spent: $0.60 / $100.00
Campaign Total: $0.60
--------------------------------------------------
```

**Shows**:
- Amount charged
- Budget before/after
- Total spending
- Campaign totals

---

## Slide 11: Quality Attribute #1 - Performance

### Target: Fast Response Times

**Goal**: API response < 100ms

**How We Achieved It**:
- Asynchronous event processing
- In-memory event bus
- Minimal work per service

**Results**:
- Average response: ~50ms
- End-to-end processing: ~300ms

**Proof**: API returns immediately after publishing event

---

## Slide 12: Quality Attribute #2 - Scalability

### Target: Handle Growing Traffic

**Goal**: Support horizontal scaling

**How We Achieved It**:
- Stateless services
- Pub-sub decoupling
- Multiple subscribers per topic

**Scaling Strategy**:
```
Current: 1 publisher, 3 subscribers
Future:  3 publishers, 15 subscribers
         (5 fraud, 5 billing, 5 analytics)
```

**Proof**: Can run multiple instances of any service

---

## Slide 13: Quality Attribute #3 - Reliability

### Target: Handle Errors Gracefully

**Goal**: 99.9% uptime, no data loss

**How We Achieved It**:
- Budget validation (prevents overspending)
- Fraud detection (blocks bad clicks)
- Input validation (rejects bad data)
- Error handling (try-catch blocks)

**Test Results**:
- Budget exhaustion: Handled correctly
- Fraud detection: Working as expected
- Invalid input: Rejected appropriately

---

## Slide 14: Live Demo

### Let's See It In Action!

**Demo Steps**:
1. Start the system
2. Send test clicks
3. Watch the pub-sub flow
4. See budget tracking
5. View final statistics

**What to Watch For**:
- Events flowing through topics
- Fraud scores calculated
- Budgets decreasing
- Analytics updating

---

## Slide 15: Code Walkthrough

### Key Code Snippets

**Publishing an Event**:
```javascript
eventBus.publish('click-events', clickEvent);
```

**Subscribing to an Event**:
```javascript
eventBus.subscribe('click-events', (clickEvent) => {
  this.checkForFraud(clickEvent);
});
```

**Event Bus**:
```javascript
class EventBus extends EventEmitter {
  publish(topic, data) {
    this.emit(topic, data);
  }
}
```

---

## Slide 16: Testing Results

### What We Tested

**Test 1: Single Click**
- Processed successfully
- All services triggered
- Budget updated

**Test 2: Multiple Clicks (20)**
- All processed correctly
- Budgets tracked accurately
- Campaign spending calculated

**Test 3: Budget Exhaustion**
- System prevents overspending
- Clicks rejected when budget gone

---

## Slide 17: Challenges Faced

### Problems and Solutions

**Challenge 1: Event Ordering**
- Problem: Events might process out of order
- Solution: Single-threaded event loop

**Challenge 2: Budget Consistency**
- Problem: Simultaneous charges
- Solution: Synchronous budget checks

**Challenge 3: Fraud Accuracy**
- Problem: Simple rules not accurate
- Solution: Basic scoring (ML for production)

---

## Slide 18: Production vs Our System

### What's Different?

| Aspect | Our System | Production |
|--------|------------|------------|
| Message Broker | EventEmitter | Apache Kafka |
| Database | In-memory | MySQL |
| Fraud Detection | Rules | ML models |
| Scale | 10s/sec | 10,000s/sec |
| Deployment | 1 machine | Cluster |

**Key Point**: Same architecture, different scale!

---

## Slide 19: What We Learned

### Key Takeaways

1. **Pub-Sub is Powerful**
   - Decouples services
   - Enables scaling
   - Easy to extend

2. **Event-Driven Design**
   - Natural for async workflows
   - Good for high-volume systems

3. **Quality Attributes**
   - Must design them in
   - Can't add later

4. **Start Simple**
   - Build working system first
   - Add complexity as needed

---

## Slide 20: Future Enhancements

### What's Next?

**Short Term**:
- Add MySQL database
- Implement Redis caching
- More fraud detection rules
- Web dashboard

**Long Term**:
- Apache Kafka integration
- Machine learning for fraud
- A/B testing
- Cloud deployment (AWS)

---

## Slide 21: Project Structure

### Code Organization

```
src/
├── config/
│   └── event-bus.js          # Message broker
├── services/
│   ├── click-ingestion.js    # Publisher
│   ├── fraud-detection.js    # Subscriber
│   ├── billing-service.js    # Subscriber
│   └── analytics-service.js  # Subscriber
├── utils/
│   └── logger.js             # Logging
└── app.js                    # Main entry
```

**Clean and Simple!**

---

## Slide 22: Documentation

### What We Delivered

- **Architecture Diagrams**  
- **Source Code** (GitHub)  
- **README Files**  
- **Technical Report**  
- **Quality Attributes Analysis**  
- **This Presentation**  
- **Working Demo**

**Everything documented and explained!**

---

## Slide 23: How to Run

### Try It Yourself!

```bash
# Install dependencies
cd src
npm install

# Start the system
npm start

# Send a test click (in another terminal)
curl -X POST http://localhost:3000/click \
  -H "Content-Type: application/json" \
  -d '{"ad_id":"ad-001","campaign_id":"camp-101",
       "advertiser_id":"adv-501","bid_amount":0.75}'
```

**GitHub**: https://github.com/nirajkb/SDE

---

## Slide 24: Conclusion

### Project Summary

**What We Built**:
- Working pub-sub system
- 4 services (1 publisher, 3 subscribers)
- Real-time budget tracking
- Fraud detection
- Complete documentation

**What We Demonstrated**:
- Performance (fast response)
- Scalability (horizontal scaling)
- Reliability (error handling)

**Academic Value**:
- Learned architecture patterns
- Practiced system design
- Analyzed quality attributes

---

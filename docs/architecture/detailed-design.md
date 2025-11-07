# Detailed System Design

## Overview

This document provides detailed design specifications for the ad click charging system. The system follows a pub-sub architecture using Apache Kafka as the central message broker, with three main processing services handling fraud detection, billing, and analytics.

## Message Flow Design

### Click Event Lifecycle

The system processes clicks through the following stages:

1. **Click Capture**: HTTP request received by Node.js API
2. **Initial Validation**: Basic structure and rate limit checks  
3. **Event Publishing**: Click event published to Kafka `click-events` topic
4. **Fraud Analysis**: ML-based evaluation of click legitimacy
5. **Billing Processing**: Valid clicks processed for charges
6. **Analytics Update**: Metrics updated in real-time

### Event Schema Design

All click events follow a standardized JSON schema:

```json
{
  "event_id": "uuid-v4-string",
  "timestamp": "2024-11-06T10:30:00.000Z",
  "user_id": "string-optional",
  "session_id": "uuid-v4-string", 
  "ad_id": "string-required",
  "campaign_id": "string-required",
  "advertiser_id": "string-required",
  "publisher_id": "string-optional",
  "click_data": {
    "ip_address": "192.168.1.100",
    "user_agent": "Mozilla/5.0...",
    "referrer": "https://example.com",
    "geo_location": {
      "country": "US",
      "region": "CA", 
      "city": "San Francisco"
    }
  },
  "cost_data": {
    "bid_amount": 0.50,
    "currency": "USD"
  }
}
```

## Service Design Patterns

### Click Ingestion Service

**Responsibilities:**
- Receive HTTP click requests
- Validate required fields (ad_id, campaign_id, advertiser_id)
- Enrich events with metadata (timestamp, IP, geo-location)
- Apply rate limiting (1000 clicks/minute per IP)
- Publish to Kafka `click-events` topic

**Design Decisions:**
- Using plain Node.js HTTP server for minimal overhead
- Synchronous validation for immediate error response
- Asynchronous Kafka publishing for performance
- Redis-based rate limiting for scalability

### Fraud Detection Service

**Processing Pipeline:**
1. Subscribe to `click-events` topic
2. Extract features for analysis
3. Apply fraud detection algorithms
4. Calculate fraud score (0-1 scale)
5. Make decision (valid/suspicious/fraud)
6. Publish to appropriate topic

**Fraud Detection Algorithms:**

#### IP Analysis
- Track click frequency per IP address
- Detect datacenter/VPN IP ranges
- Monitor geographic consistency
- Flag suspicious velocity patterns

#### Behavioral Analysis  
- User agent validation and bot detection
- Referrer header analysis
- Session-based click patterns
- Device fingerprinting techniques

#### Scoring Logic
```javascript
fraudScore = (ipScore + velocityScore + behaviorScore + deviceScore) / 4

if (fraudScore >= 0.8) decision = 'fraud'
else if (fraudScore >= 0.5) decision = 'suspicious'  
else decision = 'valid'
```

### Billing Service

**Transaction Processing:**
1. Subscribe to `validated-clicks` topic
2. Retrieve campaign and advertiser details
3. Calculate click cost using pricing algorithm
4. Validate budget constraints
5. Create billing transaction
6. Update spend tracking
7. Publish billing event

**Cost Calculation Algorithm:**
```
Final Cost = Base CPC × Quality Score × Time Adjustment × Geo Adjustment

Where:
- Base CPC: Campaign bid amount
- Quality Score: 1 - fraud_score (higher quality = lower fraud risk)
- Time Adjustment: 1.2 (peak hours 9-17) or 0.8 (off-peak)
- Geo Adjustment: 1.5 (premium countries) or 1.0 (standard)
```

**Budget Management:**
- Real-time spend tracking with MySQL transactions
- Multi-level budget validation (daily, campaign, advertiser)
- Overspend prevention with pre-transaction checks
- Concurrent processing safety with database locks

### Analytics Service

**Real-time Processing:**
1. Subscribe to `billing-events` topic
2. Update real-time metrics counters
3. Perform time-based aggregations
4. Store results in MySQL analytics tables

**Aggregation Strategy:**
- **Minute-level**: Real-time dashboard metrics
- **Hourly**: Trend analysis and reporting
- **Daily**: Campaign performance summaries
- **Monthly**: Long-term analytics and forecasting

## Error Handling and Recovery

### Retry Mechanisms

**Kafka Consumer Retries:**
- Exponential backoff starting at 100ms
- Maximum 8 retry attempts
- Dead letter queue for failed messages

**Database Transaction Retries:**
- Automatic retry for connection timeouts
- Rollback and retry for deadlock scenarios
- Circuit breaker pattern for database failures

### Failure Scenarios

**Service Failures:**
- Graceful degradation when fraud detection unavailable
- Billing continues with reduced fraud protection
- Analytics tolerates temporary data loss

**Message Processing Failures:**
- Idempotency checks prevent duplicate processing
- Event IDs ensure exactly-once semantics
- Failed messages routed to dead letter queues

## Performance Optimization

### Kafka Configuration

**Producer Settings:**
- Batch size: 16KB for throughput optimization
- Linger time: 5ms for latency balance
- Compression: gzip for network efficiency
- Idempotent producer for reliability

**Consumer Settings:**
- Fetch size: 1MB for batch processing
- Session timeout: 30 seconds
- Heartbeat interval: 3 seconds
- Auto-commit disabled for manual control

### Database Optimization

**Connection Management:**
- Connection pooling with 20 max connections
- Connection timeout: 2 seconds
- Idle timeout: 30 seconds
- Prepared statements for query optimization

**Indexing Strategy:**
- Primary keys on all tables
- Composite indexes on (campaign_id, timestamp)
- Covering indexes for frequent queries
- Partitioning by date for large tables

### Caching Strategy

**Redis Usage:**
- Session data: 30-minute TTL
- Rate limiting counters: 60-second TTL  
- Campaign budgets: 5-minute TTL
- Fraud detection cache: 15-minute TTL

## Security Considerations

### Input Validation

**API Level:**
- Required field validation
- Data type and format checks
- SQL injection prevention
- XSS protection for string fields

**Message Level:**
- Schema validation for Kafka messages
- Sanitization of user-provided data
- Encryption of sensitive fields

### Access Control

**Network Security:**
- Internal service communication only
- API rate limiting and throttling
- IP whitelisting for admin access

**Data Protection:**
- PII anonymization in logs
- Encrypted database connections
- Secure credential management

## Monitoring and Observability

### Key Metrics

**Business Metrics:**
- Clicks per second throughput
- Revenue per hour tracking
- Fraud detection accuracy
- Campaign performance indicators

**Technical Metrics:**
- API response times (p95, p99)
- Kafka message lag
- Database query performance
- Error rates by service

**Operational Metrics:**
- CPU and memory utilization
- Network bandwidth usage
- Disk I/O patterns
- Service health status

### Alerting Strategy

**Critical Alerts:**
- Service downtime detection
- Database connection failures
- Kafka consumer lag spikes
- Fraud rate anomalies

**Warning Alerts:**
- High response time trends
- Budget threshold breaches
- Unusual traffic patterns
- Resource utilization spikes

## Deployment Considerations

### Container Configuration

**Resource Allocation:**
- Click Ingestion: 2 CPU, 4GB RAM
- Fraud Detection: 4 CPU, 8GB RAM
- Billing Service: 2 CPU, 4GB RAM
- Analytics Service: 2 CPU, 6GB RAM

**Scaling Strategy:**
- Horizontal pod autoscaling based on CPU
- Kafka partition count matches max replicas
- Database read replicas for analytics queries

### Environment Management

**Configuration:**
- Environment-specific config files
- Secret management for credentials
- Feature flags for gradual rollouts
- Health check endpoints for monitoring

This detailed design provides the foundation for implementing a production-ready ad click charging system with proper error handling, performance optimization, and operational monitoring.
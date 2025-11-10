// Fraud Detection Service - SUBSCRIBER #1
// Listens for click events and checks if they look suspicious

const eventBus = require('../config/event-bus');

class FraudDetectionService {
  constructor() {
    this.clicksChecked = 0;
    this.fraudFound = 0;
  }

  start() {
    console.log('[FraudDetection] Starting service...');
    
    // Subscribe to click-events topic
    // Whenever a click is published, our checkForFraud function will run
    eventBus.subscribe('click-events', (clickEvent) => {
      this.checkForFraud(clickEvent);
    });
    
    console.log('[FraudDetection] Subscribed to click-events\n');
  }

  checkForFraud(clickEvent) {
    console.log('-'.repeat(60));
    console.log('FRAUD DETECTION');
    console.log('-'.repeat(60));
    console.log(`Click ID: ${clickEvent.event_id}`);
    console.log(`Advertiser: ${clickEvent.advertiser_id}`);
    
    this.clicksChecked++;
    
    // Simple fraud detection logic
    // In a production-grade deployment, it would be far more complex
    let fraudScore = 0;
    
    // Get user agent and IP from nested structure
    const userAgent = clickEvent.click_data?.user_agent || clickEvent.user_agent || '';
    const ipAddress = clickEvent.click_data?.ip_address || clickEvent.ip_address || '';
    
    // Check 1: Is user agent missing?
    if (!userAgent || userAgent === 'unknown') {
      fraudScore += 0.3;
    }
    
    // Check 2: Does user agent contain 'bot'?
    if (userAgent.toLowerCase().includes('bot')) {
      fraudScore += 0.5;
    }
    
    // Check 3: Is IP address suspicious?
    if (ipAddress.startsWith('10.') || ipAddress.startsWith('192.168.')) {
      fraudScore += 0.2;
    }
    
    // Add some randomness to simulate ML model
    fraudScore += Math.random() * 0.2;
    
    // Decide if it's fraud
    if (fraudScore >= 0.7) {
      // This is fraud!
      this.fraudFound++;
      console.log(`Fraud Score: ${fraudScore.toFixed(2)} - FRAUD DETECTED!`);
      console.log(`Decision: BLOCKED`);
      console.log('-'.repeat(60) + '\n');
      
      // Publish fraud alert
      eventBus.publish('fraud-alerts', {
        click_id: clickEvent.event_id,
        fraud_score: fraudScore,
        reason: 'High fraud score'
      });
      
    } else {
      // Click looks good, pass it along
      console.log(`Fraud Score: ${fraudScore.toFixed(2)} - VALID`);
      console.log(`Decision: APPROVED - Forwarding to billing`);
      console.log('-'.repeat(60) + '\n');
      
      // Publish to validated-clicks topic
      eventBus.publish('validated-clicks', {
        ...clickEvent,
        fraud_score: fraudScore
      });
    }
  }

  getStats() {
    return {
      clicksChecked: this.clicksChecked,
      fraudFound: this.fraudFound
    };
  }
}

module.exports = FraudDetectionService;

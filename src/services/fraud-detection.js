// Fraud Detection Service - SUBSCRIBER #1
// Listens for click events and checks if they look suspicious

const eventBus = require('../config/event-bus');
const logger = require('../utils/logger');

class FraudDetectionService {
  constructor() {
    this.clicksChecked = 0;
    this.fraudFound = 0;
  }

  start() {
    logger.log('FraudDetection', 'Starting service...');
    
    // Subscribe to click-events topic
    // Whenever a click is published, our checkForFraud function will run
    eventBus.subscribe('click-events', (clickEvent) => {
      this.checkForFraud(clickEvent);
    });
    
    logger.log('FraudDetection', 'Subscribed to click-events');
  }

  checkForFraud(clickEvent) {
    logger.log('FraudDetection', `Checking click: ${clickEvent.event_id}`);
    
    this.clicksChecked++;
    
    // Simple fraud detection logic
    // In a production-grade deployment, it would be far more complex
    let fraudScore = 0;
    
    // Check 1: Is user agent missing?
    if (!clickEvent.user_agent || clickEvent.user_agent === 'unknown') {
      fraudScore += 0.3;
    }
    
    // Check 2: Does user agent contain 'bot'?
    if (clickEvent.user_agent.toLowerCase().includes('bot')) {
      fraudScore += 0.5;
    }
    
    // Check 3: Is IP address suspicious?
    if (clickEvent.ip_address.startsWith('10.') || clickEvent.ip_address.startsWith('192.168.')) {
      fraudScore += 0.2;
    }
    
    // Add some randomness to simulate ML model
    fraudScore += Math.random() * 0.2;
    
    // Decide if it's fraud
    if (fraudScore >= 0.7) {
      // This is fraud!
      this.fraudFound++;
      logger.log('FraudDetection', `FRAUD DETECTED! Score: ${fraudScore.toFixed(2)}`);
      
      // Publish fraud alert
      eventBus.publish('fraud-alerts', {
        click_id: clickEvent.event_id,
        fraud_score: fraudScore,
        reason: 'High fraud score'
      });
      
    } else {
      // Click looks good, pass it along
      logger.log('FraudDetection', `Click is valid. Score: ${fraudScore.toFixed(2)}`);
      
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

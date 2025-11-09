// Billing Service - SUBSCRIBER #2
// Listens for validated clicks and charges the advertiser

const eventBus = require('../config/event-bus');
const logger = require('../utils/logger');

class BillingService {
  constructor() {
    this.clicksBilled = 0;
    this.totalRevenue = 0;
  }

  start() {
    logger.log('BillingService', 'Starting service...');
    
    // Subscribe to validated-clicks topic
    // Only process clicks that passed fraud detection
    eventBus.subscribe('validated-clicks', (clickEvent) => {
      this.processPayment(clickEvent);
    });
    
    logger.log('BillingService', 'Subscribed to validated-clicks');
  }

  processPayment(clickEvent) {
    logger.log('BillingService', `Processing payment for click: ${clickEvent.event_id}`);
    
    // Calculate how much to charge
    // Start with the bid amount
    let cost = clickEvent.bid_amount;
    
    // Apply quality adjustment based on fraud score
    // Lower fraud score = higher quality = charge more
    // this is probably an exaggregation, neverthless added for some randomness
    const qualityMultiplier = 1 - clickEvent.fraud_score;
    cost = cost * qualityMultiplier;
    
    // Check if it's peak hours (9am-5pm)
    const hour = new Date().getHours();
    if (hour >= 9 && hour <= 17) {
      cost = cost * 1.2; // Charge 20% more during peak hours
    } else {
      cost = cost * 0.8; // Charge 20% less during off-peak
    }
    
    // Round to 2 decimal places
    cost = Math.round(cost * 100) / 100;
    
    // In real system, we would:
    // 1. Check advertiser budget
    // 2. Create database transaction
    // 3. Update advertiser balance
    // For now, just simulate it
    
    this.clicksBilled++;
    this.totalRevenue += cost;
    
    logger.log('BillingService', `Charged $${cost.toFixed(2)} to advertiser ${clickEvent.advertiser_id}`);
    
    // Publish billing event for analytics
    eventBus.publish('billing-events', {
      transaction_id: `txn_${Date.now()}`,
      click_id: clickEvent.event_id,
      advertiser_id: clickEvent.advertiser_id,
      campaign_id: clickEvent.campaign_id,
      amount: cost,
      timestamp: new Date().toISOString()
    });
  }

  getStats() {
    return {
      clicksBilled: this.clicksBilled,
      totalRevenue: this.totalRevenue.toFixed(2)
    };
  }
}

module.exports = BillingService;

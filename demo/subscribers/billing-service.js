/**
 * Billing Service (Stub)
 * Subscribes to validated clicks and simulates billing
 */

const eventBus = require('../message-broker/event-bus');

class BillingService {
  constructor() {
    this.processedClicks = 0;
    this.totalRevenue = 0;
    this.transactions = [];
  }

  start() {
    console.log('[Billing Service] Service starting...');
    
    // Subscribe to validated clicks
    eventBus.subscribe('validated-clicks', this.processValidatedClick.bind(this));
    
    console.log('[Billing Service] Subscribed to validated-clicks topic');
    console.log('[Billing Service] Ready to process billing\n');
  }

  async processValidatedClick(eventData) {
    const click = eventData.message;
    
    console.log(`[Billing Service] Processing validated click: ${click.event_id}`);
    
    // Simulate processing delay
    await this.sleep(150);
    
    // Calculate cost
    const cost = this.calculateCost(click);
    
    // Check budget (simulated)
    const budgetCheck = this.checkBudget(click.advertiser_id, cost);
    
    if (!budgetCheck.canCharge) {
      console.log(`[Billing Service] ⚠️  Budget exceeded for advertiser: ${click.advertiser_id}`);
      console.log(`[Billing Service] Reason: ${budgetCheck.reason}\n`);
      return;
    }
    
    // Create transaction
    const transaction = {
      transaction_id: this.generateTransactionId(),
      click_event_id: click.event_id,
      advertiser_id: click.advertiser_id,
      campaign_id: click.campaign_id,
      amount: cost,
      currency: click.cost_data.currency,
      timestamp: new Date().toISOString()
    };
    
    this.transactions.push(transaction);
    this.processedClicks++;
    this.totalRevenue += cost;
    
    console.log(`[Billing Service] ✓ Charged $${cost.toFixed(2)} to advertiser: ${click.advertiser_id}`);
    console.log(`[Billing Service] Transaction ID: ${transaction.transaction_id}\n`);
    
    // Publish billing event
    eventBus.publish('billing-events', transaction);
  }

  calculateCost(click) {
    let baseCost = click.cost_data.bid_amount;
    
    // Apply quality score adjustment
    const qualityScore = click.fraud_analysis 
      ? (1 - click.fraud_analysis.fraud_score) 
      : 1.0;
    
    // Apply time-of-day adjustment
    const hour = new Date().getHours();
    const timeAdjustment = (hour >= 9 && hour <= 17) ? 1.2 : 0.8;
    
    // Calculate final cost
    let finalCost = baseCost * qualityScore * timeAdjustment;
    
    // Round to 2 decimal places
    return Math.round(finalCost * 100) / 100;
  }

  checkBudget(advertiserId, cost) {
    // Simulate budget check
    // In real system, this would query database
    
    // Random budget check for demo purposes
    const hasEnoughBudget = Math.random() > 0.05; // 95% success rate
    
    if (!hasEnoughBudget) {
      return {
        canCharge: false,
        reason: 'Daily budget limit reached'
      };
    }
    
    return {
      canCharge: true
    };
  }

  generateTransactionId() {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStats() {
    return {
      processedClicks: this.processedClicks,
      totalRevenue: `$${this.totalRevenue.toFixed(2)}`,
      averageRevenue: this.processedClicks > 0
        ? `$${(this.totalRevenue / this.processedClicks).toFixed(2)}`
        : '$0.00',
      transactionCount: this.transactions.length
    };
  }
}

module.exports = BillingService;

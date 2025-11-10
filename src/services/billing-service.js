// Billing Service - SUBSCRIBER #2
// Listens for validated clicks and charges the advertiser

const eventBus = require('../config/event-bus');
const logger = require('../utils/logger');

class BillingService {
  constructor() {
    this.clicksBilled = 0;
    this.totalRevenue = 0;
    
    // Track advertiser budgets (simulated)
    // In real system, this would be in database
    this.advertiserBudgets = {
      'adv-501': { initial: 100.00, remaining: 100.00, spent: 0.00 },
      'adv-502': { initial: 150.00, remaining: 150.00, spent: 0.00 },
      'adv-503': { initial: 200.00, remaining: 200.00, spent: 0.00 },
      'adv-504': { initial: 120.00, remaining: 120.00, spent: 0.00 }
    };
    
    // Track campaign spending
    this.campaignSpending = {};
  }

  start() {
    console.log('[BillingService] Starting service...');
    
    // Subscribe to validated-clicks topic
    // Only process clicks that passed fraud detection
    eventBus.subscribe('validated-clicks', (clickEvent) => {
      this.processPayment(clickEvent);
    });
    
    console.log('[BillingService] Subscribed to validated-clicks\n');
  }

  processPayment(clickEvent) {
    // Calculate how much to charge
    // Start with the bid amount
    let cost = clickEvent.cost_data?.bid_amount || clickEvent.bid_amount || 0.50;
    
    // Apply quality adjustment based on fraud score
    // Lower fraud score = higher quality = charge more
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
    
    // Check advertiser budget
    const advertiserId = clickEvent.advertiser_id;
    if (!this.advertiserBudgets[advertiserId]) {
      // New advertiser, create budget
      this.advertiserBudgets[advertiserId] = {
        initial: 100.00,
        remaining: 100.00,
        spent: 0.00
      };
    }
    
    const budget = this.advertiserBudgets[advertiserId];
    
    // Check if advertiser has enough budget
    if (budget.remaining < cost) {
      logger.log('BillingService', `BUDGET EXCEEDED for ${advertiserId}! Remaining: $${budget.remaining.toFixed(2)}, Needed: $${cost.toFixed(2)}`);
      return; // Don't process this click
    }
    
    // Update advertiser budget
    budget.remaining -= cost;
    budget.spent += cost;
    
    // Update campaign spending
    if (!this.campaignSpending[clickEvent.campaign_id]) {
      this.campaignSpending[clickEvent.campaign_id] = 0;
    }
    this.campaignSpending[clickEvent.campaign_id] += cost;
    
    this.clicksBilled++;
    this.totalRevenue += cost;
    
    // Show detailed billing info
    console.log('');
    console.log('  BILLING TRANSACTION');
    console.log('  ' + '-'.repeat(50));
    console.log(`  Advertiser: ${advertiserId}`);
    console.log(`  Campaign: ${clickEvent.campaign_id}`);
    console.log(`  Amount Charged: $${cost.toFixed(2)}`);
    console.log(`  Budget Before: $${(budget.remaining + cost).toFixed(2)}`);
    console.log(`  Budget After: $${budget.remaining.toFixed(2)}`);
    console.log(`  Total Spent: $${budget.spent.toFixed(2)} / $${budget.initial.toFixed(2)}`);
    console.log(`  Campaign Total: $${this.campaignSpending[clickEvent.campaign_id].toFixed(2)}`);
    console.log('  ' + '-'.repeat(50));
    console.log('');
    
    // Publish billing event for analytics
    eventBus.publish('billing-events', {
      transaction_id: `txn_${Date.now()}`,
      click_id: clickEvent.event_id,
      advertiser_id: clickEvent.advertiser_id,
      campaign_id: clickEvent.campaign_id,
      amount: cost,
      budget_remaining: budget.remaining,
      timestamp: new Date().toISOString()
    });
  }

  getStats() {
    return {
      clicksBilled: this.clicksBilled,
      totalRevenue: this.totalRevenue.toFixed(2),
      advertiserBudgets: this.advertiserBudgets,
      campaignSpending: this.campaignSpending
    };
  }
  
  // Get budget summary for display
  getBudgetSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('  ADVERTISER BUDGET SUMMARY');
    console.log('='.repeat(60));
    
    for (const [advId, budget] of Object.entries(this.advertiserBudgets)) {
      const percentUsed = ((budget.spent / budget.initial) * 100).toFixed(1);
      console.log(`\n  ${advId}:`);
      console.log(`    Initial Budget: $${budget.initial.toFixed(2)}`);
      console.log(`    Spent: $${budget.spent.toFixed(2)} (${percentUsed}%)`);
      console.log(`    Remaining: $${budget.remaining.toFixed(2)}`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('  CAMPAIGN SPENDING');
    console.log('='.repeat(60));
    
    for (const [campId, spent] of Object.entries(this.campaignSpending)) {
      console.log(`  ${campId}: $${spent.toFixed(2)}`);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
  }
}

module.exports = BillingService;

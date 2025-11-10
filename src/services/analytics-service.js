// Analytics Service - SUBSCRIBER #3
// Listens for billing events and tracks statistics

const eventBus = require('../config/event-bus');
const logger = require('../utils/logger');

class AnalyticsService {
  constructor() {
    this.totalClicks = 0;
    this.totalRevenue = 0;
    this.campaignStats = {}; // Store stats per campaign
  }

  start() {
    console.log('[AnalyticsService] Starting service...');
    
    // Subscribe to billing-events topic
    // Track all successful billing transactions
    eventBus.subscribe('billing-events', (billingEvent) => {
      this.updateStats(billingEvent);
    });
    
    console.log('[AnalyticsService] Subscribed to billing-events\n');
  }

  updateStats(billingEvent) {
    // Update overall stats
    this.totalClicks++;
    this.totalRevenue += billingEvent.amount;
    
    // Update per-campaign stats
    const campaignId = billingEvent.campaign_id;
    
    if (!this.campaignStats[campaignId]) {
      // First time seeing this campaign
      this.campaignStats[campaignId] = {
        clicks: 0,
        revenue: 0
      };
    }
    
    this.campaignStats[campaignId].clicks++;
    this.campaignStats[campaignId].revenue += billingEvent.amount;
    
    console.log('ANALYTICS UPDATED');
    console.log(`   Total Clicks Processed: ${this.totalClicks}`);
    console.log(`   Total Revenue: $${this.totalRevenue.toFixed(2)}`);
    console.log(`   Campaign ${campaignId}: ${this.campaignStats[campaignId].clicks} clicks, $${this.campaignStats[campaignId].revenue.toFixed(2)}`);
    console.log('');
  }

  getStats() {
    return {
      totalClicks: this.totalClicks,
      totalRevenue: this.totalRevenue.toFixed(2),
      averageRevenuePerClick: this.totalClicks > 0 
        ? (this.totalRevenue / this.totalClicks).toFixed(2)
        : '0.00',
      campaignCount: Object.keys(this.campaignStats).length
    };
  }

  // Get detailed stats for all campaigns
  getCampaignStats() {
    return this.campaignStats;
  }
}

module.exports = AnalyticsService;

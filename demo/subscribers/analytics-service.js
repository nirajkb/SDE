/**
 * Analytics Service (Stub)
 * Subscribes to billing events and simulates analytics aggregation
 */

const eventBus = require('../message-broker/event-bus');

class AnalyticsService {
  constructor() {
    this.metrics = {
      totalClicks: 0,
      totalRevenue: 0,
      byCampaign: new Map(),
      byAdvertiser: new Map(),
      byHour: new Map()
    };
  }

  start() {
    console.log('[Analytics Service] Service starting...');
    
    // Subscribe to billing events
    eventBus.subscribe('billing-events', this.processBillingEvent.bind(this));
    
    console.log('[Analytics Service] Subscribed to billing-events topic');
    console.log('[Analytics Service] Ready to collect metrics\n');
  }

  async processBillingEvent(eventData) {
    const billing = eventData.message;
    
    console.log(`[Analytics Service] Processing billing event: ${billing.transaction_id}`);
    
    // Simulate processing delay
    await this.sleep(80);
    
    // Update metrics
    this.updateMetrics(billing);
    
    console.log(`[Analytics Service] ✓ Updated metrics for campaign: ${billing.campaign_id}`);
    console.log(`[Analytics Service] Total revenue: $${this.metrics.totalRevenue.toFixed(2)}\n`);
  }

  updateMetrics(billing) {
    // Update total metrics
    this.metrics.totalClicks++;
    this.metrics.totalRevenue += billing.amount;
    
    // Update campaign metrics
    if (!this.metrics.byCampaign.has(billing.campaign_id)) {
      this.metrics.byCampaign.set(billing.campaign_id, {
        clicks: 0,
        revenue: 0
      });
    }
    const campaignMetrics = this.metrics.byCampaign.get(billing.campaign_id);
    campaignMetrics.clicks++;
    campaignMetrics.revenue += billing.amount;
    
    // Update advertiser metrics
    if (!this.metrics.byAdvertiser.has(billing.advertiser_id)) {
      this.metrics.byAdvertiser.set(billing.advertiser_id, {
        clicks: 0,
        revenue: 0
      });
    }
    const advertiserMetrics = this.metrics.byAdvertiser.get(billing.advertiser_id);
    advertiserMetrics.clicks++;
    advertiserMetrics.revenue += billing.amount;
    
    // Update hourly metrics
    const hour = new Date().getHours();
    if (!this.metrics.byHour.has(hour)) {
      this.metrics.byHour.set(hour, {
        clicks: 0,
        revenue: 0
      });
    }
    const hourMetrics = this.metrics.byHour.get(hour);
    hourMetrics.clicks++;
    hourMetrics.revenue += billing.amount;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStats() {
    return {
      totalClicks: this.metrics.totalClicks,
      totalRevenue: `$${this.metrics.totalRevenue.toFixed(2)}`,
      averageRevenuePerClick: this.metrics.totalClicks > 0
        ? `$${(this.metrics.totalRevenue / this.metrics.totalClicks).toFixed(2)}`
        : '$0.00',
      campaignCount: this.metrics.byCampaign.size,
      advertiserCount: this.metrics.byAdvertiser.size
    };
  }

  getDetailedMetrics() {
    return {
      summary: this.getStats(),
      byCampaign: Array.from(this.metrics.byCampaign.entries()).map(([id, data]) => ({
        campaign_id: id,
        clicks: data.clicks,
        revenue: `$${data.revenue.toFixed(2)}`,
        avgCPC: `$${(data.revenue / data.clicks).toFixed(2)}`
      })),
      byAdvertiser: Array.from(this.metrics.byAdvertiser.entries()).map(([id, data]) => ({
        advertiser_id: id,
        clicks: data.clicks,
        revenue: `$${data.revenue.toFixed(2)}`,
        avgCPC: `$${(data.revenue / data.clicks).toFixed(2)}`
      })),
      byHour: Array.from(this.metrics.byHour.entries()).map(([hour, data]) => ({
        hour: `${hour}:00`,
        clicks: data.clicks,
        revenue: `$${data.revenue.toFixed(2)}`
      }))
    };
  }
}

module.exports = AnalyticsService;

/**
 * Demo Runner
 * Starts all services and demonstrates the pub-sub architecture
 */

const ClickIngestionService = require('./publisher/click-ingestion');
const FraudDetectionService = require('./subscribers/fraud-detection');
const BillingService = require('./subscribers/billing-service');
const AnalyticsService = require('./subscribers/analytics-service');
const eventBus = require('./message-broker/event-bus');

class DemoRunner {
  constructor() {
    this.services = {
      clickIngestion: new ClickIngestionService(3000),
      fraudDetection: new FraudDetectionService(),
      billing: new BillingService(),
      analytics: new AnalyticsService()
    };
  }

  async start() {
    console.log('='.repeat(70));
    console.log('  Ad Click Charging System - Pub-Sub Architecture Demo');
    console.log('='.repeat(70));
    console.log('\nStarting all services...\n');

    // Start subscriber services first
    this.services.fraudDetection.start();
    this.services.billing.start();
    this.services.analytics.start();

    // Small delay to ensure subscribers are ready
    await this.sleep(500);

    // Start publisher service
    this.services.clickIngestion.start();

    console.log('='.repeat(70));
    console.log('  All services started successfully!');
    console.log('='.repeat(70));
    console.log('\nPub-Sub Architecture Active:');
    console.log('  Publisher: Click Ingestion API (port 3000)');
    console.log('  Subscribers: Fraud Detection, Billing, Analytics');
    console.log('  Message Broker: Event Bus (in-memory)');
    console.log('\nTopics:');
    console.log('  - click-events: Raw clicks from ingestion');
    console.log('  - validated-clicks: Clicks that passed fraud detection');
    console.log('  - billing-events: Successfully charged clicks');
    console.log('  - fraud-alerts: Detected fraudulent clicks');
    console.log('\n' + '='.repeat(70));
    console.log('\nDemo is ready! Try these commands:');
    console.log('\n1. Send a test click:');
    console.log('   node demo/test-client.js');
    console.log('\n2. Send multiple clicks:');
    console.log('   node demo/test-client.js --count 5');
    console.log('\n3. View statistics:');
    console.log('   curl http://localhost:3000/stats');
    console.log('\n4. Press Ctrl+C to stop the demo');
    console.log('='.repeat(70) + '\n');

    // Setup graceful shutdown
    this.setupShutdown();

    // Optional: Auto-run test clicks after 2 seconds
    if (process.argv.includes('--auto-test')) {
      setTimeout(() => {
        console.log('\n[Demo] Running automated test clicks...\n');
        this.runAutoTest();
      }, 2000);
    }
  }

  async runAutoTest() {
    const testClicks = [
      {
        ad_id: 'ad-001',
        campaign_id: 'campaign-101',
        advertiser_id: 'advertiser-501',
        bid_amount: 0.75
      },
      {
        ad_id: 'ad-002',
        campaign_id: 'campaign-102',
        advertiser_id: 'advertiser-502',
        bid_amount: 0.50
      },
      {
        ad_id: 'ad-003',
        campaign_id: 'campaign-101',
        advertiser_id: 'advertiser-501',
        bid_amount: 0.60
      }
    ];

    for (const click of testClicks) {
      await this.sleep(1000);
      console.log(`\n${'='.repeat(70)}`);
      console.log(`  Simulating click for ${click.ad_id}`);
      console.log('='.repeat(70) + '\n');
      
      // Simulate HTTP request
      const clickEvent = {
        event_id: `click_${Date.now()}`,
        timestamp: new Date().toISOString(),
        ...click,
        click_data: {
          ip_address: '203.0.113.42',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          referrer: 'https://example.com'
        },
        cost_data: {
          bid_amount: click.bid_amount,
          currency: 'USD'
        }
      };

      eventBus.publish('click-events', clickEvent);
      await this.sleep(1000);
    }

    // Show final statistics
    setTimeout(() => {
      this.showStatistics();
    }, 2000);
  }

  showStatistics() {
    console.log('\n' + '='.repeat(70));
    console.log('  DEMO STATISTICS');
    console.log('='.repeat(70));
    
    console.log('\n[Fraud Detection]');
    console.log(JSON.stringify(this.services.fraudDetection.getStats(), null, 2));
    
    console.log('\n[Billing Service]');
    console.log(JSON.stringify(this.services.billing.getStats(), null, 2));
    
    console.log('\n[Analytics Service]');
    console.log(JSON.stringify(this.services.analytics.getStats(), null, 2));
    
    console.log('\n[Event Bus]');
    console.log(JSON.stringify(eventBus.getStats(), null, 2));
    
    console.log('\n' + '='.repeat(70) + '\n');
  }

  setupShutdown() {
    const shutdown = async () => {
      console.log('\n\nShutting down services...');
      
      this.showStatistics();
      
      this.services.clickIngestion.stop();
      
      console.log('\nAll services stopped. Goodbye!\n');
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the demo
if (require.main === module) {
  const demo = new DemoRunner();
  demo.start().catch(error => {
    console.error('Failed to start demo:', error);
    process.exit(1);
  });
}

module.exports = DemoRunner;

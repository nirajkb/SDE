// Main Application File
// This starts all the services and demonstrates the pub-sub architecture

const ClickIngestionService = require('./services/click-ingestion');
const FraudDetectionService = require('./services/fraud-detection');
const BillingService = require('./services/billing-service');
const AnalyticsService = require('./services/analytics-service');

console.log('\n' + '='.repeat(60));
console.log('  Ad Click Charging System - Pub-Sub Architecture');
console.log('  Academic Learning Project');
console.log('='.repeat(60));
console.log();

// Create instances of all services
const clickIngestion = new ClickIngestionService(3000);
const fraudDetection = new FraudDetectionService();
const billing = new BillingService();
const analytics = new AnalyticsService();

// Start subscriber services first
// They need to be listening before we start receiving clicks
console.log('Starting subscriber services...\n');
fraudDetection.start();
billing.start();
analytics.start();

// Small delay to make sure subscribers are ready
setTimeout(() => {
  // Now start the publisher service
  console.log('Starting publisher service...');
  clickIngestion.start();
  
  console.log('='.repeat(60));
  console.log('  ALL SERVICES RUNNING');
  console.log('='.repeat(60));
  console.log('\nPub-Sub Flow:');
  console.log('  1. Click Ingestion receives HTTP request');
  console.log('  2. Publishes to "click-events" topic');
  console.log('  3. Fraud Detection checks the click');
  console.log('  4. If valid, publishes to "validated-clicks" topic');
  console.log('  5. Billing Service processes payment');
  console.log('  6. Publishes to "billing-events" topic');
  console.log('  7. Analytics Service updates statistics');
  console.log('\nReady to receive clicks!');
  console.log('   Send clicks using curl or test client');
  console.log('   Press Ctrl+C to stop and see final statistics\n');
  console.log('='.repeat(60) + '\n');
  
}, 500);

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('\n\nShutting down...\n');
  
  // Show final statistics
  console.log('='.repeat(60));
  console.log('  FINAL STATISTICS');
  console.log('='.repeat(60));
  console.log('\nFraud Detection:', JSON.stringify(fraudDetection.getStats(), null, 2));
  console.log('\nAnalytics:', JSON.stringify(analytics.getStats(), null, 2));
  
  // Show detailed budget summary
  billing.getBudgetSummary();
  
  clickIngestion.stop();
  process.exit(0);
});

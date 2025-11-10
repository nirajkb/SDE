/**
 * Fraud Detection Service (Stub)
 * Subscribes to click events and simulates fraud detection
 */

const eventBus = require('../message-broker/event-bus');

class FraudDetectionService {
  constructor() {
    this.processedClicks = 0;
    this.fraudDetected = 0;
  }

  start() {
    console.log('[Fraud Detection] Service starting...');
    
    // Subscribe to click events
    eventBus.subscribe('click-events', this.processClick.bind(this));
    
    console.log('[Fraud Detection] Subscribed to click-events topic');
    console.log('[Fraud Detection] Ready to detect fraud\n');
  }

  async processClick(eventData) {
    const click = eventData.message;
    
    console.log(`[Fraud Detection] Processing click: ${click.event_id}`);
    
    // Simulate processing delay
    await this.sleep(100);
    
    // Simulate fraud detection logic
    const fraudAnalysis = this.analyzeFraud(click);
    
    this.processedClicks++;
    
    if (fraudAnalysis.is_fraud) {
      this.fraudDetected++;
      console.log(`[Fraud Detection] ⚠️  FRAUD DETECTED! Score: ${fraudAnalysis.fraud_score}`);
      console.log(`[Fraud Detection] Reason: ${fraudAnalysis.reason}\n`);
      
      // Publish fraud alert
      eventBus.publish('fraud-alerts', {
        click_event_id: click.event_id,
        fraud_analysis: fraudAnalysis
      });
    } else {
      console.log(`[Fraud Detection] ✓ Click validated (fraud_score: ${fraudAnalysis.fraud_score})`);
      console.log(`[Fraud Detection] Publishing to validated-clicks topic\n`);
      
      // Publish validated click
      eventBus.publish('validated-clicks', {
        ...click,
        fraud_analysis: fraudAnalysis
      });
    }
  }

  analyzeFraud(click) {
    let fraudScore = 0;
    const indicators = [];
    
    // Simulate IP analysis
    if (click.click_data.ip_address.startsWith('10.') || 
        click.click_data.ip_address.startsWith('192.168.')) {
      fraudScore += 0.3;
      indicators.push('private_ip_range');
    }
    
    // Simulate user agent analysis
    if (!click.click_data.user_agent || click.click_data.user_agent === 'unknown') {
      fraudScore += 0.2;
      indicators.push('missing_user_agent');
    }
    
    if (click.click_data.user_agent.toLowerCase().includes('bot')) {
      fraudScore += 0.5;
      indicators.push('bot_user_agent');
    }
    
    // Simulate referrer analysis
    if (!click.click_data.referrer) {
      fraudScore += 0.1;
      indicators.push('missing_referrer');
    }
    
    // Random factor to simulate ML model
    const randomFactor = Math.random() * 0.2;
    fraudScore += randomFactor;
    
    // Determine decision
    let decision = 'valid';
    let reason = 'Normal click pattern';
    
    if (fraudScore >= 0.7) {
      decision = 'fraud';
      reason = indicators.join(', ');
    } else if (fraudScore >= 0.4) {
      decision = 'suspicious';
      reason = 'Elevated fraud indicators';
    }
    
    return {
      is_fraud: decision === 'fraud',
      fraud_score: Math.round(fraudScore * 100) / 100,
      decision,
      reason,
      indicators,
      analyzed_at: new Date().toISOString()
    };
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStats() {
    return {
      processedClicks: this.processedClicks,
      fraudDetected: this.fraudDetected,
      fraudRate: this.processedClicks > 0 
        ? ((this.fraudDetected / this.processedClicks) * 100).toFixed(2) + '%'
        : '0%'
    };
  }
}

module.exports = FraudDetectionService;

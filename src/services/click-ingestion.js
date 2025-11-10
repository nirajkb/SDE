// Click Ingestion Service - This is the PUBLISHER
// It receives ad clicks from users and publishes them to the event bus

const express = require('express');
const eventBus = require('../config/event-bus');

class ClickIngestionService {
  constructor(port = 3000) {
    this.app = express();
    this.port = port;
    this.clicksReceived = 0;
    
    // Setup Express to handle JSON data
    this.app.use(express.json());
    
    this.setupRoutes();
  }

  setupRoutes() {
    // Main endpoint to receive clicks
    this.app.post('/click', (req, res) => {
      try {
        // Get click data from request
        const clickData = req.body;
        
        // Basic validation - make sure we have required fields
        if (!clickData.ad_id || !clickData.campaign_id || !clickData.advertiser_id) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Create a click event with all the info we need
        const clickEvent = {
          event_id: `click_${Date.now()}`,
          timestamp: new Date().toISOString(),
          ad_id: clickData.ad_id,
          campaign_id: clickData.campaign_id,
          advertiser_id: clickData.advertiser_id,
          cost_data: {
            bid_amount: clickData.bid_amount || 0.50,
            currency: 'USD'
          },
          click_data: {
            ip_address: req.ip || '127.0.0.1',
            user_agent: req.headers['user-agent'] || 'unknown'
          }
        };
        
        this.clicksReceived++;
        
        console.log('\n' + '='.repeat(60));
        console.log(`CLICK RECEIVED #${this.clicksReceived}`);
        console.log('='.repeat(60));
        console.log(`Ad ID: ${clickEvent.ad_id}`);
        console.log(`Campaign: ${clickEvent.campaign_id}`);
        console.log(`Advertiser: ${clickEvent.advertiser_id}`);
        console.log(`Bid Amount: $${clickEvent.cost_data.bid_amount.toFixed(2)}`);
        console.log(`Event ID: ${clickEvent.event_id}`);
        console.log('─'.repeat(60));
        console.log('Publishing to event bus...');
        console.log('='.repeat(60) + '\n');
        
        // Publish to event bus - this is the pub-sub part!
        eventBus.publish('click-events', clickEvent);
        
        res.json({ 
          success: true, 
          message: 'Click received',
          event_id: clickEvent.event_id
        });
        
      } catch (err) {
        console.error('[ClickIngestion] Error:', err.message);
        res.status(500).json({ error: 'Internal error' });
      }
    });

    // Simple health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok',
        clicksReceived: this.clicksReceived 
      });
    });

    // Stats endpoint
    this.app.get('/stats', (req, res) => {
      res.json({
        clicksReceived: this.clicksReceived
      });
    });
  }

  start() {
    this.server = this.app.listen(this.port, () => {
      console.log(`\n[ClickIngestion] Started on port ${this.port}\n`);
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
      console.log('[ClickIngestion] Stopped');
    }
  }
}

module.exports = ClickIngestionService;

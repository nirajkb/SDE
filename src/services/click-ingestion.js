// Click Ingestion Service - This is the PUBLISHER
// It receives ad clicks from users and publishes them to the event bus

const express = require('express');
const eventBus = require('../config/event-bus');
const logger = require('../utils/logger');

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
          bid_amount: clickData.bid_amount || 0.50,
          ip_address: req.ip || '127.0.0.1',
          user_agent: req.headers['user-agent'] || 'unknown'
        };
        
        logger.log('ClickIngestion', `Received click for ad: ${clickEvent.ad_id}`);
        
        // Publish to event bus - this is the pub-sub part!
        eventBus.publish('click-events', clickEvent);
        
        this.clicksReceived++;
        
        res.json({ 
          success: true, 
          message: 'Click received',
          event_id: clickEvent.event_id
        });
        
      } catch (err) {
        logger.error('ClickIngestion', err.message);
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
  }

  start() {
    this.server = this.app.listen(this.port, () => {
      logger.log('ClickIngestion', `Started on port ${this.port}`);
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
      logger.log('ClickIngestion', 'Stopped');
    }
  }
}

module.exports = ClickIngestionService;

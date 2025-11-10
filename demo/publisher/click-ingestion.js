/**
 * Click Ingestion Service
 * Receives ad click requests and publishes them to the event bus
 */

const express = require('express');
const eventBus = require('../message-broker/event-bus');

class ClickIngestionService {
  constructor(port = 3000) {
    this.app = express();
    this.port = port;
    this.clickCount = 0;
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging
    this.app.use((req, res, next) => {
      if (req.path !== '/health') {
        console.log(`[Click Ingestion] ${req.method} ${req.path}`);
      }
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy',
        service: 'click-ingestion',
        clicksProcessed: this.clickCount,
        timestamp: new Date().toISOString()
      });
    });

    // Click tracking endpoint
    this.app.post('/click', async (req, res) => {
      try {
        const clickEvent = this.createClickEvent(req);
        
        console.log(`[Click Ingestion] Received click for ad: ${clickEvent.ad_id}`);
        
        // Publish to event bus
        const eventId = eventBus.publish('click-events', clickEvent);
        
        this.clickCount++;
        
        res.status(200).json({
          success: true,
          event_id: eventId,
          message: 'Click received and published'
        });
      } catch (error) {
        console.error('[Click Ingestion] Error:', error.message);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Pixel tracking (GET request)
    this.app.get('/pixel', async (req, res) => {
      try {
        const clickEvent = this.createClickEvent({ 
          body: req.query,
          ip: req.ip,
          headers: req.headers
        });
        
        console.log(`[Click Ingestion] Pixel click for ad: ${clickEvent.ad_id}`);
        
        eventBus.publish('click-events', clickEvent);
        this.clickCount++;
        
        // Return 1x1 transparent pixel
        const pixel = Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          'base64'
        );
        
        res.writeHead(200, {
          'Content-Type': 'image/png',
          'Content-Length': pixel.length
        });
        res.end(pixel);
      } catch (error) {
        console.error('[Click Ingestion] Pixel error:', error.message);
        res.status(500).end();
      }
    });

    // Stats endpoint
    this.app.get('/stats', (req, res) => {
      res.json({
        clicksProcessed: this.clickCount,
        eventBusStats: eventBus.getStats()
      });
    });
  }

  createClickEvent(req) {
    const data = req.body || req.query || {};
    
    // Validate required fields
    if (!data.ad_id || !data.campaign_id || !data.advertiser_id) {
      throw new Error('Missing required fields: ad_id, campaign_id, advertiser_id');
    }

    return {
      event_id: this.generateEventId(),
      timestamp: new Date().toISOString(),
      ad_id: data.ad_id,
      campaign_id: data.campaign_id,
      advertiser_id: data.advertiser_id,
      publisher_id: data.publisher_id || 'unknown',
      user_id: data.user_id || null,
      session_id: data.session_id || this.generateSessionId(),
      click_data: {
        ip_address: req.ip || '127.0.0.1',
        user_agent: req.headers?.['user-agent'] || 'unknown',
        referrer: req.headers?.referer || null
      },
      cost_data: {
        bid_amount: parseFloat(data.bid_amount) || 0.50,
        currency: data.currency || 'USD'
      }
    };
  }

  generateEventId() {
    return `click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  start() {
    this.server = this.app.listen(this.port, () => {
      console.log(`\n[Click Ingestion] Service started on port ${this.port}`);
      console.log(`[Click Ingestion] Ready to receive clicks\n`);
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
      console.log('[Click Ingestion] Service stopped');
    }
  }
}

module.exports = ClickIngestionService;

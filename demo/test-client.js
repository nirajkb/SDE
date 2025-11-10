/**
 * Test Client
 * Sends test clicks to the Click Ingestion API
 */

const http = require('http');

class TestClient {
  constructor() {
    this.host = 'localhost';
    this.port = 3000;
  }

  async sendClick(clickData) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(clickData);
      
      const options = {
        hostname: this.host,
        port: this.port,
        path: '/click',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };

      const req = http.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(responseData);
            resolve(response);
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(data);
      req.end();
    });
  }

  async runTest(count = 1) {
    console.log('\n' + '='.repeat(70));
    console.log(`  Sending ${count} test click(s) to the system`);
    console.log('='.repeat(70) + '\n');

    const testData = [
      {
        ad_id: 'ad-001',
        campaign_id: 'campaign-101',
        advertiser_id: 'advertiser-501',
        publisher_id: 'publisher-201',
        bid_amount: 0.75,
        currency: 'USD'
      },
      {
        ad_id: 'ad-002',
        campaign_id: 'campaign-102',
        advertiser_id: 'advertiser-502',
        publisher_id: 'publisher-202',
        bid_amount: 0.50,
        currency: 'USD'
      },
      {
        ad_id: 'ad-003',
        campaign_id: 'campaign-103',
        advertiser_id: 'advertiser-503',
        publisher_id: 'publisher-201',
        bid_amount: 1.00,
        currency: 'USD'
      },
      {
        ad_id: 'ad-004',
        campaign_id: 'campaign-101',
        advertiser_id: 'advertiser-501',
        publisher_id: 'publisher-203',
        bid_amount: 0.60,
        currency: 'USD'
      },
      {
        ad_id: 'ad-005',
        campaign_id: 'campaign-104',
        advertiser_id: 'advertiser-504',
        publisher_id: 'publisher-202',
        bid_amount: 0.85,
        currency: 'USD'
      }
    ];

    for (let i = 0; i < count; i++) {
      const clickData = testData[i % testData.length];
      
      console.log(`\nSending click ${i + 1}/${count}:`);
      console.log(`  Ad: ${clickData.ad_id}`);
      console.log(`  Campaign: ${clickData.campaign_id}`);
      console.log(`  Bid: $${clickData.bid_amount}`);

      try {
        const response = await this.sendClick(clickData);
        console.log(`  ✓ Response: ${response.message}`);
        console.log(`  Event ID: ${response.event_id}`);
      } catch (error) {
        console.error(`  ✗ Error: ${error.message}`);
      }

      // Wait between clicks
      if (i < count - 1) {
        await this.sleep(1500);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('  Test completed!');
    console.log('  Check the demo-runner console to see the pub-sub flow');
    console.log('='.repeat(70) + '\n');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
let count = 1;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--count' && args[i + 1]) {
    count = parseInt(args[i + 1]);
  }
}

// Run the test
if (require.main === module) {
  const client = new TestClient();
  client.runTest(count).catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}

module.exports = TestClient;

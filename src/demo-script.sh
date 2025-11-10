#!/bin/bash
# Demo Script for Screen Recording
# This sends a sequence of clicks to demonstrate the pub-sub system

echo "Waiting for system to start..."
sleep 3

echo ""
echo "Sending 20 test clicks..."
echo ""

# Send 20 clicks
for i in {1..20}; do
  curl -s -X POST http://localhost:3000/click \
    -H "Content-Type: application/json" \
    -d '{"ad_id":"ad-00'"$((i%5+1))"'","campaign_id":"camp-10'"$((i%3+1))"'","advertiser_id":"adv-50'"$((i%4+1))"'","bid_amount":0.'"$((60+i%50))"'}' > /dev/null
  sleep 0.5
done

echo ""
echo "All clicks processed. Hit Ctrl+C to view the final statistics"
echo ""

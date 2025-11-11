#!/bin/bash

echo "=== Testing bellabayrealty.com Specifically ==="

# Get token
TOKEN_RESPONSE=$(curl -s -X POST "https://api.snov.io/v1/oauth/access_token" \
  -H "Content-Type: application/json" \
  -d '{"grant_type":"client_credentials","client_id":"44b02c5cf250c6fd30fcccd14ae33a1a","client_secret":"1eb69bb8fedebfdb690bcf4b1833f3c6"}')

TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

# Start search
START_RESPONSE=$(curl -s "https://api.snov.io/v2/domain-search/prospects/start?domain=bellabayrealty.com&limit=50" \
  -X POST \
  -H "Authorization: Bearer $TOKEN")

echo "Start response:"
echo "$START_RESPONSE"

TASK_HASH=$(echo "$START_RESPONSE" | grep -o '"task_hash":"[^"]*"' | cut -d'"' -f4)
echo -e "\nTask hash: $TASK_HASH"

# Wait
echo "Waiting 5 seconds..."
sleep 5

# Get results
echo -e "\nFetching results..."
RESULTS=$(curl -s "https://api.snov.io/v2/domain-search/prospects/result/$TASK_HASH" \
  -H "Authorization: Bearer $TOKEN")

echo "$RESULTS" | python3 -m json.tool 2>/dev/null || echo "$RESULTS"

# Count
COUNT=$(echo "$RESULTS" | grep -o '"first_name"' | wc -l)
echo -e "\n=== Total prospects found: $COUNT ==="

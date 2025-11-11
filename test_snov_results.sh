#!/bin/bash

echo "=== Testing Snov.io Full Flow ==="

# Get token
TOKEN_RESPONSE=$(curl -s -X POST "https://api.snov.io/v1/oauth/access_token" \
  -H "Content-Type: application/json" \
  -d '{"grant_type":"client_credentials","client_id":"44b02c5cf250c6fd30fcccd14ae33a1a","client_secret":"1eb69bb8fedebfdb690bcf4b1833f3c6"}')

TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
echo "Token: ${TOKEN:0:20}..."

# Start search for meta.com
echo -e "\n=== Step 1: Starting search for meta.com ==="
START_RESPONSE=$(curl -s "https://api.snov.io/v2/domain-search/prospects/start?domain=meta.com&limit=10" \
  -X POST \
  -H "Authorization: Bearer $TOKEN")

echo "$START_RESPONSE"

TASK_HASH=$(echo "$START_RESPONSE" | grep -o '"task_hash":"[^"]*"' | cut -d'"' -f4)
echo -e "\nTask hash: $TASK_HASH"

# Wait 5 seconds
echo -e "\n=== Step 2: Waiting 5 seconds for processing ==="
sleep 5

# Get results
echo -e "\n=== Step 3: Fetching results ==="
RESULT_URL="https://api.snov.io/v2/domain-search/prospects/result/$TASK_HASH"
echo "Fetching from: $RESULT_URL"

RESULTS=$(curl -s "$RESULT_URL" \
  -H "Authorization: Bearer $TOKEN")

echo "$RESULTS" | head -100

# Count prospects found
PROSPECT_COUNT=$(echo "$RESULTS" | grep -o '"first_name"' | wc -l)
echo -e "\n=== Prospects found: $PROSPECT_COUNT ==="

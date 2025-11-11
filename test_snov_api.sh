#!/bin/bash

# Test Snov.io API

echo "=== Testing Snov.io API ==="

# Step 1: Get access token
echo "Step 1: Getting access token..."
TOKEN_RESPONSE=$(curl -s -X POST "https://api.snov.io/v1/oauth/access_token" \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "client_credentials",
    "client_id": "44b02c5cf250c6fd30fcccd14ae33a1a",
    "client_secret": "1eb69bb8fedebfdb690bcf4b1833f3c6"
  }')

echo "Token response: $TOKEN_RESPONSE"

TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "ERROR: Failed to get access token"
  exit 1
fi

echo "Token obtained: ${TOKEN:0:20}..."

# Step 2: Test domain search with bellabayrealty.com
echo -e "\n=== Testing bellabayrealty.com ==="
curl -s "https://api.snov.io/v2/domain-search/prospects/start?domain=bellabayrealty.com&limit=10" \
  -X POST \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n"

# Step 3: Test with a known large company (meta.com)
echo "=== Testing meta.com ==="
curl -s "https://api.snov.io/v2/domain-search/prospects/start?domain=meta.com&limit=10" \
  -X POST \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n"

# Step 4: Test with stripe.com
echo "=== Testing stripe.com ==="
curl -s "https://api.snov.io/v2/domain-search/prospects/start?domain=stripe.com&limit=10" \
  -X POST \
  -H "Authorization: Bearer $TOKEN"

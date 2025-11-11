#!/bin/bash

echo "=== Testing Production Contact Search ==="
echo ""

curl -X POST https://sivio.vercel.app/api/contacts/search \
  -H "Content-Type: application/json" \
  -d '{"company":"Bellabay Realty","domain":"bellabayrealty.com","jobTitle":"Real Estate Agent"}' \
  2>&1

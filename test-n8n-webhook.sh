#!/bin/bash

# Test n8n Webhook - Contact Finder
# This tests if your n8n webhook is working

echo "🧪 Testing n8n Contact Finder Webhook..."
echo ""

WEBHOOK_URL="https://ebailine.app.n8n.cloud/webhook-test/148eaa2e-ca0f-46be-b4f2-647e48c28da7"

echo "📍 Webhook URL: $WEBHOOK_URL"
echo ""
echo "📤 Sending test payload..."
echo ""

# Test payload
PAYLOAD='{
  "userId": "test-user-123",
  "userEmail": "test@example.com",
  "contactsPerJob": 3,
  "jobs": [
    {
      "applicationId": "app-123",
      "jobId": "job-456",
      "company": "Google",
      "position": "Software Engineer",
      "location": "Mountain View, CA",
      "description": "Build amazing products...",
      "url": "https://www.linkedin.com/jobs/view/123456",
      "applyUrl": "https://careers.google.com/apply",
      "domain": "google.com"
    }
  ]
}'

# Make the request
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

# Extract status code (last line)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
# Extract body (everything except last line)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "📥 Response:"
echo "Status Code: $HTTP_CODE"
echo ""
echo "Body:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  echo "✅ SUCCESS! n8n webhook is working!"
  echo ""
  echo "Next steps:"
  echo "1. Check n8n executions: https://ebailine.app.n8n.cloud/executions"
  echo "2. You should see a workflow run with the test data"
  echo "3. If you see the execution, your webhook is ready!"
else
  echo "❌ FAILED! n8n webhook is not responding correctly."
  echo ""
  echo "Possible issues:"
  echo "1. Workflow not imported yet"
  echo "2. Workflow not activated in n8n"
  echo "3. Webhook URL is incorrect"
  echo "4. n8n service is down"
  echo ""
  echo "To fix:"
  echo "1. Go to: https://ebailine.app.n8n.cloud"
  echo "2. Import workflow from: n8n-workflows/contact-finder-workflow.json"
  echo "3. Click 'Active' toggle to activate it"
  echo "4. Run this test script again"
fi

echo ""
echo "🔗 Useful links:"
echo "- n8n Dashboard: https://ebailine.app.n8n.cloud"
echo "- n8n Executions: https://ebailine.app.n8n.cloud/executions"
echo "- Workflow JSON: n8n-workflows/contact-finder-workflow.json"

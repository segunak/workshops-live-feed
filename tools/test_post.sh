#!/bin/bash
# Live Feed Test - Bash
# Tests posting to the Vercel serverless endpoint.

URL="${LIVE_FEED_URL:-https://live.segunakinyemi.com/api/post}"
WORKSHOP_KEY="${WORKSHOP_KEY:-cinnamon-rolls-are-the-best-pastry-hands-down}"

TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
NAME="Test Script (Bash)"
MESSAGE="Pre-workshop test at $TIMESTAMP"
WORKSHOP="Test Workshop"
TAGS="test, bash, pre-workshop"

echo "Posting to live feed..."
echo "  URL: $URL"
echo "  Name: $NAME"
echo "  Message: $MESSAGE"
echo "  Workshop: $WORKSHOP"
echo "  Tags: $TAGS"
echo ""

RESPONSE=$(curl -s -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"Name\": \"$NAME\",
    \"Message\": \"$MESSAGE\",
    \"Workshop\": \"$WORKSHOP\",
    \"Tags\": \"$TAGS\",
    \"WorkshopKey\": \"$WORKSHOP_KEY\"
  }")

echo "Response: $RESPONSE"
echo ""

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "SUCCESS: Post submitted!"
    echo "Check https://live.segunakinyemi.com to verify."
else
    echo "FAILED: Check the response above for details."
fi

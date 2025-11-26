#!/bin/bash

# Start ngrok and get the public URL
# This script starts ngrok and outputs the public URL for use in your .env.local

echo "🚀 Starting ngrok tunnel..."
echo ""

# Kill any existing ngrok processes
pkill -f "ngrok http 3000" 2>/dev/null

# Start ngrok in the background
ngrok http 3000 > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

echo "⏳ Waiting for ngrok to start..."
sleep 3

# Get the public URL
NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | grep -o 'https://[a-z0-9-]*\.ngrok-free\.app' | head -1)

if [ -z "$NGROK_URL" ]; then
  echo "❌ Failed to get ngrok URL. Check if ngrok is running:"
  echo "   curl http://127.0.0.1:4040/api/tunnels"
  echo ""
  echo "You can also check the ngrok web interface at: http://127.0.0.1:4040"
  exit 1
fi

echo "✅ ngrok is running!"
echo ""
echo "📋 Public URL: $NGROK_URL"
echo ""
echo "📝 Add this to your .env.local file:"
echo "   BASE_URL=$NGROK_URL"
echo ""
echo "   Or set it temporarily:"
echo "   export BASE_URL=$NGROK_URL"
echo ""
echo "🔄 Restart your Next.js dev server after updating BASE_URL"
echo ""
echo "📊 ngrok web interface: http://127.0.0.1:4040"
echo "🛑 To stop ngrok, run: pkill ngrok"
echo ""
echo "⚠️  Keep this terminal open - ngrok needs to stay running!"


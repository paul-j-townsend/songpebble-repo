# Manual Webhook Testing Guide

Since API.box can't reach `http://localhost:3000`, you need to manually trigger the webhook when a song is ready.

## Option 1: Use the Manual Webhook Endpoint

1. **Get the download URL from API.box:**
   - Go to API.box logs: https://api.box/logs
   - Find your completed song (status: "success")
   - Click on the "Result" column to get the download URL
   - Copy the download URL

2. **Get the orderId from your test:**
   - Check the browser console or server logs for the orderId that was created
   - Or check your Supabase `orders` table

3. **Trigger the webhook manually:**
   ```bash
   curl -X POST http://localhost:3000/api/test-webhook-manual \
     -H "Content-Type: application/json" \
     -d '{
       "taskId": "YOUR_TASK_ID",
       "status": "completed",
       "downloadUrl": "YOUR_DOWNLOAD_URL_FROM_API_BOX",
       "orderId": "YOUR_ORDER_ID"
     }'
   ```

## Option 2: Use ngrok for Local Development

1. **Install ngrok:**
   ```bash
   brew install ngrok  # macOS
   # or download from https://ngrok.com
   ```

2. **Start ngrok tunnel:**
   ```bash
   ngrok http 3000
   ```

3. **Copy the ngrok URL** (e.g., `https://abc123.ngrok.io`)

4. **Update your test to use ngrok URL:**
   - Set `BASE_URL=https://abc123.ngrok.io` in `.env.local`
   - Or update the callback URL in the test API route

5. **Restart your dev server** and test again

## Option 3: Check API.box Webhook Payload

API.box might be calling the webhook but with a different payload structure. Check your server logs to see if any webhook requests are coming through.

## Quick Test Script

Save this as `test-webhook.sh`:

```bash
#!/bin/bash

# Replace these with actual values from API.box logs
TASK_ID="your-task-id"
DOWNLOAD_URL="your-download-url"
ORDER_ID="your-order-id"

curl -X POST http://localhost:3000/api/test-webhook-manual \
  -H "Content-Type: application/json" \
  -d "{
    \"taskId\": \"$TASK_ID\",
    \"status\": \"completed\",
    \"downloadUrl\": \"$DOWNLOAD_URL\",
    \"orderId\": \"$ORDER_ID\"
  }"
```

Make it executable:
```bash
chmod +x test-webhook.sh
./test-webhook.sh
```


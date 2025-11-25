# ngrok Setup for API.box Webhooks

This guide helps you set up ngrok so API.box can call your webhook endpoints during local development.

## Quick Start

1. **Start ngrok:**
   ```bash
   ./start-ngrok.sh
   ```

2. **Copy the ngrok URL** that's displayed (e.g., `https://abc123.ngrok-free.app`)

3. **Add to `.env.local`:**
   ```bash
   NGROK_URL=https://abc123.ngrok-free.app
   ```

4. **Restart your Next.js dev server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

5. **Test the API button** - webhooks should now work automatically!

## Manual Setup

If the script doesn't work, you can set up ngrok manually:

1. **Start ngrok in a separate terminal:**
   ```bash
   ngrok http 3000
   ```

2. **Copy the HTTPS URL** from the ngrok output (looks like `https://abc123.ngrok-free.app`)

3. **Add to `.env.local`:**
   ```bash
   NGROK_URL=https://abc123.ngrok-free.app
   ```

4. **Restart your dev server**

## Verify It's Working

1. Click the "Test API.box" button
2. Check the server console - you should see the callback URL uses ngrok
3. Wait for the song to generate (20+ seconds)
4. Watch the server console for webhook logs
5. Check Supabase Storage - files should appear automatically!

## ngrok Web Interface

While ngrok is running, you can view requests in real-time:
- Open: http://127.0.0.1:4040
- This shows all incoming requests to your local server

## Troubleshooting

### ngrok URL changes every time
- **Solution:** The free ngrok plan gives you a new URL each time
- **Workaround:** Update `NGROK_URL` in `.env.local` each time you restart ngrok
- **Alternative:** Use ngrok's paid plan for a static URL

### "ngrok: command not found"
- **Solution:** Install ngrok: `brew install ngrok`

### Webhook still not working
- Check that ngrok is running: `ps aux | grep ngrok`
- Verify the URL in server logs matches your ngrok URL
- Check ngrok web interface: http://127.0.0.1:4040
- Make sure you restarted the dev server after setting `NGROK_URL`

### Port 4040 already in use
- Another ngrok instance might be running
- Kill it: `pkill ngrok`
- Then start again: `./start-ngrok.sh`

## Environment Variable Priority

The code checks for the base URL in this order:
1. `NGROK_URL` (highest priority - for ngrok)
2. `BASE_URL` (for production or other setups)
3. `NEXT_PUBLIC_BASE_URL` (fallback)
4. `http://localhost:3000` (last resort - won't work for webhooks)

## Stopping ngrok

When you're done developing:
```bash
pkill ngrok
```

Or press `Ctrl+C` in the terminal where ngrok is running.


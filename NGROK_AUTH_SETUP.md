# ngrok Authentication Setup

ngrok requires a free account to use. Follow these steps:

## Step 1: Sign Up for ngrok (Free)

1. Go to: https://dashboard.ngrok.com/signup
2. Sign up with your email (it's free)
3. Verify your email

## Step 2: Get Your Authtoken

1. After signing up, go to: https://dashboard.ngrok.com/get-started/your-authtoken
2. Copy your authtoken (looks like: `2abc123def456ghi789jkl012mno345pq_6r7s8t9u0v1w2x3y4z5a6b7c8d9e0f`)

## Step 3: Configure ngrok

Run this command with your authtoken:

```bash
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

Replace `YOUR_AUTHTOKEN_HERE` with the token you copied.

## Step 4: Verify Setup

Test that ngrok works:

```bash
ngrok http 3000
```

You should see output like:
```
Session Status                online
Account                       your-email@example.com
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:3000
```

Press `Ctrl+C` to stop it.

## Step 5: Start ngrok for Development

Once authenticated, you can use the setup script:

```bash
./start-ngrok.sh
```

Or start manually:

```bash
ngrok http 3000
```

Then copy the HTTPS URL and add it to `.env.local`:
```bash
NGROK_URL=https://abc123.ngrok-free.app
```

## Quick Command Reference

```bash
# Authenticate ngrok (one-time setup)
ngrok config add-authtoken YOUR_AUTHTOKEN

# Start ngrok tunnel
ngrok http 3000

# Check ngrok status
curl http://127.0.0.1:4040/api/tunnels

# View ngrok web interface
open http://127.0.0.1:4040
```


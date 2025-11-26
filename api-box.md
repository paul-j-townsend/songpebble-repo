# API.box Documentation Findings

**Source:** <https://docs.api.box/>

## Overview

API.box is an AI music service platform that provides APIs for music generation, lyrics creation, audio processing, and video production. The platform is designed for developers and businesses seeking to integrate AI music capabilities into their applications.

## Key Features

### Platform Capabilities

- **High Reliability**: 99.9% uptime ensuring stable API performance
- **Cost-Effectiveness**: Transparent, usage-based pricing
- **Rapid Output**: Streaming responses delivering results in as little as 20 seconds
- **Scalability**: High concurrency support to accommodate growing needs
- **Continuous Support**: 24/7 professional technical assistance
- **Commercial Readiness**: Watermark-free outputs suitable for commercial use

### AI Model Versions

- **V3_5**: Improved song structure with clear verse/chorus patterns, up to 4 minutes duration
- **V4**: Enhanced vocal quality with refined audio processing, up to 4 minutes duration
- **V4_5**: Superior prompt understanding with faster generation speed, up to 8 minutes duration
- **V4_5PLUS**: Enhanced tonal variety and new creative approaches, up to 8 minutes duration
- **V5**: Cutting-edge model with enhanced quality and capabilities

## API Categories

### 1. Music Generation APIs

- Create high-quality music from text descriptions
- Extend existing tracks
- Transform audio styles
- Generate music with customizable parameters

### 2. Lyrics Creation APIs

- Generate lyrics with customizable themes
- Retrieve timestamped lyrics for synchronization
- Support for various musical styles and moods

### 3. Audio Processing APIs

- Separate vocals from music
- Convert audio formats
- Enhance music styles
- Audio transformation capabilities

### 4. Music Video APIs

- Generate visual music videos from audio tracks
- Create synchronized video content

### 5. Utility APIs

- Monitor tasks and processing status
- Check credit balances
- Manage various processing details
- Webhook integration for real-time notifications

## Technical Details

### Base URL

```
https://api.api.box
```

### Music Generation Endpoint

```
POST https://api.api.box/api/v1/generate
```

**Request Parameters:**

- `customMode` (boolean, required): Set to `true` for advanced audio generation settings
- `instrumental` (boolean, required): Set to `true` for instrumental music (no lyrics)
- `model` (string, required): AI model version (`V3_5`, `V4`, `V4_5`, `V4_5PLUS`, `V5`)
- `callBackUrl` (string, required): URL to receive task completion notifications
- `prompt` (string, required if `instrumental` is `false`): Description of desired audio content
- `style` (string, required in Custom Mode): Music style or genre (e.g., "Jazz", "Classical", "Indie Pop")
- `title` (string, required in Custom Mode): Title of the generated music track

**Response:**

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "40f6f4e1bc64881f61ed3de1e5daa835"
  }
}
```

The `taskId` can be used to check the status of the music generation task.

## Webhook Callback

When the music generation is complete, API.box will send a POST request to your `callBackUrl` with the following payload:

```json
{
  "taskId": "40f6f4e1bc64881f61ed3de1e5daa835",
  "status": "completed",
  "downloadUrl": "https://api.api.box/download/...",
  "lyricsUrl": "https://api.api.box/download/lyrics/...",
  "orderId": "optional-order-id-if-passed-in-callback-url"
}
```

**Important:** Include the `orderId` in your callback URL as a query parameter so the webhook handler can update the correct order:

```
https://yourdomain.com/api/box-webhook?orderId={orderId}
```

## Storage Integration

Generated songs are automatically:

1. Downloaded from API.box when the webhook is received
2. Uploaded to Supabase Storage in the `tracks` bucket
3. Organized by order ID: `tracks/{orderId}/song.mp3`
4. Lyrics (if available) stored in `lyrics/{orderId}/lyrics.txt`
5. Order updated with file paths and status set to 'delivered'

### Authentication

All API requests require Bearer token authentication:

```
Authorization: Bearer YOUR_API_KEY
```

API keys can be obtained from the API Key Management Page after signing up.

### Webhook Support

All major endpoints support webhook callbacks for real-time notifications:

- Music generation callbacks
- Lyrics generation callbacks
- Music extension callbacks
- Audio processing callbacks
- Music video callbacks
- WAV conversion callbacks
- Upload & cover callbacks
- Upload & extend callbacks
- Add vocals callbacks
- Add instrumental callbacks

## Getting Started

1. **Sign Up**: Create a free account at [API.box](https://api.box/)
2. **Get API Key**: Obtain authentication credentials from the API key management page
3. **Choose Your API**: Select from the comprehensive API collection
4. **Follow Quick Start**: Use the Quick Start Guide for rapid integration
5. **Test & Deploy**: Verify your integration and go live

## Documentation Features

- Interactive examples
- Code samples in multiple programming languages
- Comprehensive guides
- Detailed API references
- Best practices
- Webhook integration guides for all endpoints

## Use Cases

- **Game Developers**: Generate dynamic background music and sound effects
- **Content Creators**: Create royalty-free music for videos, podcasts, and social media
- **Businesses**: Integrate AI music generation into apps, websites, and services
- **Music Producers**: Prototype songs and create full compositions
- **Karaoke & Entertainment**: Utilize timestamped lyrics and vocal separation features

## Support & Community

- 24/7 technical support
- Email assistance
- Regular documentation updates
- Real-time service status monitoring
- Comprehensive developer resources

## Key Advantages

- **Latest AI Music Models**: Access to models like Suno V4.5, V4, and V3.5
- **Watermark-Free Commercial Use**: Generated music is free from watermarks, ready for commercial projects
- **20-Second Streaming Output**: Rapid delivery with streaming responses suitable for real-time applications
- **High-Concurrency Architecture**: Handles multiple simultaneous requests, ensuring reliable performance under heavy traffic
- **Transparent and Affordable Pricing**: Cost-effective, usage-based pricing plans
- **Comprehensive Developer Support**: Detailed, developer-friendly documentation and an experienced technical support team

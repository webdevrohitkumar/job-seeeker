# Setup Guide: AI Chatbot with Groq/Gemini API

## Overview
Your chatbot now integrates with **Groq API** (fast and free) or **Google Gemini** for real AI responses instead of mock data.

---

## Step 1: Get Groq API Key (Recommended)

### Why Groq?
- ✅ **Free** - No credit card required
- ✅ **Fast** - 500+ requests/min
- ✅ **Powerful** - Uses Mixtral-8x7b-32768 model

### How to Get It:
1. Go to: https://console.groq.com/
2. Sign up with email or Google
3. Click "API Keys" in the sidebar
4. Click "Create API Key"
5. Copy the key

---

## Step 2: Setup Environment Variables

Edit `server/.env`:

```env
# AI Provider Configuration
GROQ_API_KEY=gsk_your_api_key_here
AI_PROVIDER=groq
```

---

## Step 3: Alternative - Google Gemini API

If you prefer Gemini:

1. Go to: https://ai.google.dev/
2. Click "Get API Key"
3. Create a new project
4. Copy your API key
5. Update `server/.env`:

```env
GEMINI_API_KEY=your_gemini_key_here
AI_PROVIDER=gemini
```

---

## Step 4: Install Dependencies

The `axios` package should already be installed. If not:

```bash
cd server
npm install axios
```

---

## Step 5: Test the Chatbot

1. Start the server:
```bash
cd server
npm start
```

2. Start the client:
```bash
cd client
npm run dev
```

3. Go to **Dashboard → Career Chatbot**
4. Ask any question like:
   - "What skills should I learn for web development?"
   - "How do I prepare for a technical interview?"
   - "What's the average salary for a Python developer?"
   - "Tell me about career growth in tech"

---

## How It Works

### Architecture Flow:
```
User Types Question
    ↓
Chatbot Component Sends Message
    ↓
Server API Endpoint (POST /api/ai/chatbot)
    ↓
Groq/Gemini API (Real AI)
    ↓
Response Returned to User
    ↓
Displayed in Chat
```

### Conversation History:
- Last 10 messages are sent to the AI
- This gives context for natural conversations
- Each message includes role (user/assistant) and content

---

## Features

✅ **Real-time AI Responses** - Using Groq or Gemini
✅ **Conversation History** - Context-aware replies
✅ **Easy Switching** - Change providers with one env variable
✅ **Fallback Support** - If API fails, graceful error handling
✅ **Fast Processing** - Groq handles 500+ requests/min

---

## Troubleshooting

### "Failed to get response from AI"
- Check API key in `.env` is correct
- Verify API provider is set correctly
- Check internet connection

### API Rate Limiting
- Groq: 500 requests/minute (generous limit)
- Gemini: 60 requests/minute

### Empty Response
- Check `AI_PROVIDER` matches your key type
- Ensure `.env` file is saved
- Restart server after changing `.env`

---

## Example Questions for Testing

```
1. "What are the top 5 in-demand skills in 2024?"
2. "How should I structure my resume?"
3. "Tell me about DevOps careers"
4. "What questions will I face in a technical interview?"
5. "How do I transition from frontend to backend development?"
6. "What's a good salary expectation for my experience?"
7. "How do I prepare for system design interviews?"
8. "Tell me about different career paths in AI/ML"
```

---

## API Details

### Groq Integration
- **Model**: mixtral-8x7b-32768 (70B parameter model)
- **Endpoint**: https://api.groq.com/openai/v1/chat/completions
- **Temperature**: 0.7 (balanced - creative but coherent)
- **Max Tokens**: 1000 per response

### Gemini Integration
- **Model**: gemini-pro
- **Endpoint**: https://generativelanguage.googleapis.com/v1beta/models
- **Temperature**: Based on provider defaults

---

## Environment Variables Reference

```env
# Required
GROQ_API_KEY=               # Groq API key from console.groq.com
AI_PROVIDER=groq            # 'groq' or 'gemini'

# Optional
GEMINI_API_KEY=             # Only if using Gemini
```

---

## Support

If you face any issues:
1. Check API key is correct
2. Verify internet connection
3. Check server logs for detailed errors
4. Try with the other AI provider
5. Ensure `.env` file is in `server/` folder

Enjoy your AI-powered career chatbot! 🚀

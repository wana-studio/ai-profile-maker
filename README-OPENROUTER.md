# OpenRouter AI Analysis Integration

This project now uses OpenRouter for real AI-powered analysis of generated profile photos.

## Setup

1. Get your OpenRouter API key from [https://openrouter.ai/keys](https://openrouter.ai/keys)

2. Add it to your `.env` file:
   ```env
   OPENROUTER_API_KEY=your_api_key_here
   ```

## How It Works

The `analyzeGeneratedPhoto` function in `/src/lib/ai-analysis.ts` uses:
- **Model**: `google/gemini-2.0-flash-exp:free` (free tier)
- **Vision capabilities**: Analyzes the actual generated image
- **Structured output**: Returns JSON with stats and insights

### Response Format

```typescript
{
  stats: {
    formal: number,      // 0-100: How formal/professional
    spicy: number,       // 0-100: How attractive/alluring
    cool: number,        // 0-100: How trendy/stylish
    trustworthy: number, // 0-100: How trustworthy
    mysterious: number   // 0-100: How mysterious/enigmatic
  },
  insights: string[]     // 3-4 AI-generated observations
}
```

### Fallback Behavior

If AI analysis fails (network issues, API errors, etc.), the system falls back to basic rule-based stats to ensure the app continues working.

## Cost

Using the free tier model (`gemini-2.0-flash-exp:free`), there's no cost for API calls.

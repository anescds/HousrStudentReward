# ElevenLabs API Key Setup

## Quick Setup

To enable the AI voice feature for the financial roast, you need to add your ElevenLabs API key to your environment variables.

## Steps

1. **Get your ElevenLabs API key:**
   - Go to [https://elevenlabs.io/](https://elevenlabs.io/)
   - Sign up or log in to your account
   - Navigate to your profile/settings
   - Copy your API key (it should start with `sk_`)

2. **Create a `.env` file in the root directory** (same level as `package.json`)

3. **Add the following to your `.env` file:**

```env
# Backend API URL
VITE_API_URL=http://localhost:3001

# ElevenLabs API Key (required for voice features)
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

Replace `your_elevenlabs_api_key_here` with your actual API key from ElevenLabs.

4. **Restart your development server** after adding the API key

## Example `.env` file

```env
VITE_API_URL=http://localhost:3001
VITE_ELEVENLABS_API_KEY=sk_803b28ae5c9f13a5b227d33896445a36c3fd0c6022fa74c3
```

## Important Notes

- ⚠️ **Never commit your `.env` file to version control** - it contains sensitive information
- The API key is required for the "Listen" button on AI roasts to work
- Without the API key, you'll see an error message when trying to use the voice feature
- The `.env` file should be in the **root directory** of the project (where `package.json` is located)

## Location

Your `.env` file should be located at:
```
/rent-rewards-nest-2aa7d631/.env
```

Same directory as:
- `package.json`
- `vite.config.ts`
- `src/` folder


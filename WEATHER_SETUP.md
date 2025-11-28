# Weather API Setup Guide

## OpenWeatherMap API - Free Tier

The weather feature uses **OpenWeatherMap API**, which offers a generous free tier perfect for development and small applications.

### Free Tier Features:
- ✅ 60 API calls per minute
- ✅ 1,000,000 API calls per month
- ✅ Current weather data
- ✅ 5-day/3-hour forecast
- ✅ Historical weather data
- ✅ Weather alerts

## Step-by-Step Setup:

### 1. Create an Account

1. Go to https://openweathermap.org/api
2. Click **"Sign Up"** button (top right)
3. Fill in your details:
   - Username
   - Email
   - Password
   - Confirm password
4. Check the terms and conditions
5. Click **"Create Account"**

### 2. Verify Your Email

1. Check your email inbox
2. Open the verification email from OpenWeatherMap
3. Click the verification link

### 3. Get Your API Key

1. After logging in, go to: https://home.openweathermap.org/api_keys
2. You'll see a default API key (or create a new one)
3. **Important**: It may take 10-60 minutes for the API key to activate after registration
4. Copy your API key

### 4. Add to Environment Variables

1. Open your `.env.local` file (create it if it doesn't exist)
2. Add your OpenWeatherMap API key:

```env
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_api_key_here
```

### 5. Complete `.env.local` Example

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenWeatherMap
NEXT_PUBLIC_OPENWEATHER_API_KEY=1234567890abcdef1234567890abcdef
```

### 6. Restart Your Development Server

After adding the API key, restart your Next.js development server:

```bash
# Stop the server (Ctrl+C)
npm run dev
```

## How It Works:

1. **Location Permission**: When the weather component loads, it asks for your location permission
2. **Geolocation**: Gets your current latitude and longitude
3. **Weather API**: Fetches weather data based on your coordinates
4. **Display**: Shows temperature, humidity, and rain probability for your location

## Troubleshooting:

### API Key Not Working
- Wait 10-60 minutes after registration for activation
- Make sure the key is copied correctly (no extra spaces)
- Check your API key status at: https://home.openweathermap.org/api_keys

### Location Permission Denied
- Click the "Location" button to retry
- Make sure location services are enabled in your browser
- For Chrome: Settings → Privacy and security → Site settings → Location

### Weather Not Loading
- Check browser console for errors
- Verify your API key is in `.env.local`
- Ensure you've restarted the dev server after adding the key
- Check if you've exceeded the free tier limits

## Alternative Weather APIs (if needed):

If OpenWeatherMap doesn't work for you, here are alternatives:

1. **WeatherAPI.com** - 1 million calls/month free
2. **weatherapi.com** - Free tier available
3. **Open-Meteo** - Completely free, no API key needed

## Security Note:

⚠️ **Important**: Since this is a `NEXT_PUBLIC_` variable, it will be exposed in the client-side bundle. This is normal for weather APIs, but:
- Never share your API key publicly
- Monitor your API usage
- Use rate limiting if you plan to scale

The free tier is perfect for development and small-scale production use!


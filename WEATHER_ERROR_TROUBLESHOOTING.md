# Weather API Error Troubleshooting Guide

## Common Errors and Solutions

### 1. "Invalid API key" or 401 Error

**Symptoms:**
- Error message: "Invalid API key. Please check your OpenWeatherMap API key."
- Status code: 401

**Solutions:**

1. **Check API Key in .env.local:**
   ```env
   NEXT_PUBLIC_OPENWEATHER_API_KEY=your_actual_api_key_here
   ```
   - Make sure there are no extra spaces
   - Make sure the key is on one line
   - Don't use quotes around the value

2. **Verify API Key is Active:**
   - Go to https://home.openweathermap.org/api_keys
   - Check if your API key shows as "Active"
   - New API keys take 10-60 minutes to activate after registration

3. **Restart Development Server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```
   Environment variables only load when the server starts.

4. **Check for Typos:**
   - Make sure it's `NEXT_PUBLIC_OPENWEATHER_API_KEY` (not `OPENWEATHER_API_KEY`)
   - The `NEXT_PUBLIC_` prefix is required for client-side access

### 2. "API rate limit exceeded" or 429 Error

**Symptoms:**
- Error message: "API rate limit exceeded. Please try again later."
- Status code: 429

**Solutions:**

1. **Wait a Few Minutes:**
   - Free tier allows 60 calls/minute
   - Wait 1-2 minutes and try again

2. **Check Your Usage:**
   - Go to https://home.openweathermap.org/usage
   - See if you've exceeded monthly limits (1,000,000 calls/month)

3. **Avoid Multiple Rapid Requests:**
   - Don't refresh the page multiple times quickly
   - The app caches weather data, so wait before retrying

### 3. "Weather data not found" or 404 Error

**Symptoms:**
- Error message: "Weather data not found for this location."
- Status code: 404

**Solutions:**

1. **Check Location Coordinates:**
   - Make sure location permission was granted
   - Try clicking the "Location" button to retry

2. **Invalid Coordinates:**
   - Sometimes GPS can give invalid coordinates
   - Wait a moment and try again

### 4. Missing API Key

**Symptoms:**
- Weather shows fallback data (Dhaka, BD)
- Console warning: "Missing OPENWEATHER_API_KEY"

**Solutions:**

1. **Add API Key to .env.local:**
   ```
   NEXT_PUBLIC_OPENWEATHER_API_KEY=your_api_key
   ```

2. **Restart Server:**
   - Environment variables don't update without restart

3. **Check File Location:**
   - `.env.local` must be in the project root directory
   - Same folder as `package.json`

### 5. Browser Location Permission Denied

**Symptoms:**
- Error: "Location permission denied"
- No weather data loads

**Solutions:**

1. **Grant Permission:**
   - Click the "Location" button in the weather widget
   - Or check browser settings:
     - Chrome: Settings → Privacy → Site Settings → Location
     - Firefox: Settings → Privacy → Permissions → Location

2. **Check Browser Support:**
   - Some browsers don't support geolocation
   - Try a different browser (Chrome, Firefox, Edge)

3. **Check HTTPS:**
   - Geolocation requires HTTPS (or localhost)
   - Make sure you're using `https://` or `http://localhost`

## Quick Diagnostic Steps

1. **Check Console:**
   - Open browser Developer Tools (F12)
   - Look at Console tab for detailed error messages

2. **Verify API Key:**
   ```bash
   # Check if .env.local exists
   cat .env.local
   
   # Or on Windows:
   type .env.local
   ```

3. **Test API Key Manually:**
   ```bash
   # Replace YOUR_API_KEY with your actual key
   curl "https://api.openweathermap.org/data/2.5/forecast?lat=23.81&lon=90.41&units=metric&appid=YOUR_API_KEY"
   ```

4. **Check Network Tab:**
   - Open Developer Tools → Network tab
   - Look for the weather API request
   - Check the response status and body

## Still Having Issues?

1. **Check API Key Status:**
   - Visit: https://home.openweathermap.org/api_keys
   - Make sure key is "Active"

2. **Wait for Activation:**
   - New keys take 10-60 minutes to activate
   - Be patient after creating a new key

3. **Verify Account:**
   - Make sure your OpenWeatherMap account is verified
   - Check your email for verification links

4. **Contact Support:**
   - OpenWeatherMap support: https://openweathermap.org/faq
   - Check their status page: https://status.openweathermap.org/

## Testing Without Location

If location isn't working, the app will show fallback weather data. This is normal behavior when:
- Location permission is denied
- API key is missing
- API request fails

The fallback shows sample data for Dhaka, Bangladesh.


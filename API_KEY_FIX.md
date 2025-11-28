# Fix OpenWeatherMap API Key "Invalid" Error

## Common Causes and Solutions

### 1. API Key Not Set or Placeholder Value

**Check your `.env.local` file:**

```env
# ❌ WRONG - Still has placeholder
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweathermap_api_key

# ✅ CORRECT - Actual API key
NEXT_PUBLIC_OPENWEATHER_API_KEY=abc123def456ghi789jkl012mno345pq
```

### 2. API Key Not Activated Yet

**New API keys take 10-60 minutes to activate after registration.**

1. Go to https://home.openweathermap.org/api_keys
2. Check if your key shows as "Active"
3. If it says "Pending", wait and try again later

### 3. Extra Spaces or Quotes

**Make sure there are NO spaces or quotes:**

```env
# ❌ WRONG
NEXT_PUBLIC_OPENWEATHER_API_KEY = "your_key_here"
NEXT_PUBLIC_OPENWEATHER_API_KEY= your_key_here

# ✅ CORRECT
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_key_here
```

### 4. Server Not Restarted

**After adding/updating `.env.local`, you MUST restart the dev server:**

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### 5. Wrong File Location

**`.env.local` must be in the project root** (same folder as `package.json`)

```
your-project/
├── .env.local          ← Must be here
├── package.json
├── src/
└── ...
```

### 6. API Key Copied Incorrectly

**Double-check:**
- No extra characters at the beginning or end
- No line breaks in the middle
- Full key is copied (usually 32 characters)

## Step-by-Step Fix

1. **Get Your API Key:**
   - Go to https://home.openweathermap.org/api_keys
   - Copy your API key (or create a new one)

2. **Update `.env.local`:**
   ```env
   NEXT_PUBLIC_OPENWEATHER_API_KEY=paste_your_actual_key_here
   ```
   - Remove any quotes
   - Remove any spaces around the `=`
   - Make sure it's all on one line

3. **Restart Server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

4. **Clear Browser Cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or open in incognito/private window

5. **Test:**
   - Open browser console (F12)
   - Check for any error messages
   - Weather should load for your location

## Verify API Key Works

Test your API key manually:

```bash
# Replace YOUR_API_KEY with your actual key
# Replace LAT and LON with your coordinates (e.g., Dhaka: 23.81, 90.41)

curl "https://api.openweathermap.org/data/2.5/weather?lat=23.81&lon=90.41&units=metric&appid=YOUR_API_KEY"
```

If you get JSON weather data back, the key works! If you get `{"cod":401,"message":"Invalid API key"}`:
- Key is wrong or not activated yet
- Wait 10-60 minutes if you just created it
- Double-check you copied it correctly

## Still Not Working?

1. **Check API Key Status:**
   - Visit: https://home.openweathermap.org/api_keys
   - Make sure it shows "Active" status

2. **Create a New Key:**
   - Sometimes creating a new key helps
   - Delete the old one and create fresh
   - Wait for activation (10-60 minutes)

3. **Check Account Status:**
   - Make sure your email is verified
   - Check for any account issues

4. **Contact OpenWeatherMap:**
   - FAQ: https://openweathermap.org/faq
   - Support: Check their status page

## Quick Checklist

- [ ] API key copied correctly (no spaces, no quotes)
- [ ] `.env.local` file in project root
- [ ] Variable name: `NEXT_PUBLIC_OPENWEATHER_API_KEY`
- [ ] Server restarted after adding key
- [ ] API key shows "Active" in OpenWeatherMap dashboard
- [ ] Waited 10-60 minutes if key is new
- [ ] Browser cache cleared

If all checked, the API key should work!


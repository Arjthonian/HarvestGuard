# Environment Variables Setup

## Create .env.local file

Create a file named `.env.local` in the root directory with the following content:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweathermap_api_key
```

## How to get your Supabase credentials:

1. Go to https://app.supabase.com
2. Sign in or create an account
3. Create a new project or select an existing one
4. Go to **Settings** → **API**
5. Copy the following:
   - **Project URL** → Use this for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → Use this for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Example:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## OpenWeatherMap API Key (for Weather Features)

1. Go to https://openweathermap.org/api
2. Click **Sign Up** (or **Sign In** if you already have an account)
3. Complete the free registration
4. Once logged in, go to **API keys** section (https://home.openweathermap.org/api_keys)
5. You'll see a default API key, or create a new one
6. Copy the API key
7. Add it to your `.env.local` file:
   ```
   NEXT_PUBLIC_OPENWEATHER_API_KEY=your_api_key_here
   ```

**Note:** The free tier allows:
- 60 calls/minute
- 1,000,000 calls/month
- Current weather and 5-day forecasts

## Complete Example:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_OPENWEATHER_API_KEY=1234567890abcdef1234567890abcdef
```

**Important:** 
- Never commit `.env.local` to version control
- Restart your development server after creating/updating `.env.local`


# Setup Instructions for HarvestGuard

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure Supabase

1. Create a `.env.local` file in the root directory (copy from `.env.example`)
2. Get your Supabase credentials:
   - Go to https://app.supabase.com
   - Select your project
   - Go to Settings > API
   - Copy the Project URL and anon/public key
3. Update `.env.local` with your credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

## 3. Setup Supabase Database

1. Open your Supabase project SQL Editor
2. Run the SQL queries from `supabase_setup.sql`
3. This will create:
   - `profiles` table for user information
   - `batches` table for crop batch management
   - Row Level Security (RLS) policies
   - Automatic triggers for profile creation

## 4. Add Images for DramaticIntro

1. Add three images to `public/images/` folder:
   - `slide1.jpg` - First slide (theme: crop loss struggle)
   - `slide2.jpg` - Second slide (theme: food waste)
   - `slide3.jpg` - Third slide (theme: harvest protection)

2. Recommended image specifications:
   - Format: JPG or PNG
   - Size: 1920x1080 or larger
   - High quality images related to agriculture/farming

## 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Fixed Issues

✅ **Login Page**: Now redirects to dashboard after successful login  
✅ **Register Page**: Now redirects to login after successful registration with better error handling  
✅ **DramaticIntro**: Image paths fixed to use public folder  
✅ **Environment Variables**: `.env.example` file created  
✅ **Supabase Setup**: Complete SQL schema provided in `supabase_setup.sql`


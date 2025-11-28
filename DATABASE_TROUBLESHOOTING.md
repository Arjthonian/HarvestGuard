# Database Error Troubleshooting

## "Database error saving new user" - Common Causes

### 1. **Profiles Table Not Created**
If you see this error, the most common cause is that the `profiles` table doesn't exist yet.

**Solution:**
1. Go to your Supabase project: https://app.supabase.com
2. Open the SQL Editor
3. Run the SQL queries from `supabase_setup.sql`
4. Make sure all queries execute successfully

### 2. **RLS (Row Level Security) Policy Issues**
The RLS policies might be blocking the insert operation.

**Check:**
1. In Supabase, go to **Table Editor** → **profiles**
2. Check if RLS is enabled
3. Verify the policies exist:
   - "Users can insert own profile"
   - "Users can view own profile"
   - "Users can update own profile"

**Fix:**
Run the policies section of `supabase_setup.sql` again if they're missing.

### 3. **Trigger Conflict**
The automatic trigger might be conflicting with manual profile creation.

**Solution:**
The updated `supabase_setup.sql` now handles this with:
- Trigger includes `name` field (required)
- Uses `ON CONFLICT DO NOTHING` to prevent conflicts
- Application code uses `upsert` with conflict handling

### 4. **Email Confirmation Required**
Some Supabase projects require email confirmation before users can be fully authenticated.

**Check:**
1. Go to **Authentication** → **Providers** → **Email**
2. Check if "Confirm email" is enabled

**Options:**
- Disable email confirmation for development
- Or wait for email confirmation before profile creation

### 5. **Missing Required Fields**
The `name` field is required (NOT NULL) in the profiles table.

**Ensure:**
- Form always submits a name
- Trigger handles default name if missing

## Quick Fix Steps

1. **Verify Table Exists:**
   ```sql
   SELECT * FROM public.profiles LIMIT 1;
   ```

2. **Check RLS Policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```

3. **Verify Trigger:**
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

4. **Test Profile Insert Manually:**
   ```sql
   -- Replace with actual user ID from auth.users
   INSERT INTO public.profiles (id, name, preferred_lang)
   VALUES ('user-id-here', 'Test User', 'bn');
   ```

## Updated SQL
Make sure you run the **updated** `supabase_setup.sql` which includes:
- Fixed trigger with `name` field
- Conflict handling (`ON CONFLICT DO NOTHING`)
- Proper error handling

## Still Having Issues?

Check the browser console for the full error message. The updated code now shows more detailed error information that will help identify the specific issue.


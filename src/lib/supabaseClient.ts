import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please create a .env.local file with:\n" +
    "NEXT_PUBLIC_SUPABASE_URL=your_project_url\n" +
    "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key\n\n" +
    "See ENV_SETUP.md for instructions."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


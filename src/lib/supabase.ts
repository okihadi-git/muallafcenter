import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Null means local-first mode. Never expose a service-role key in the browser.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
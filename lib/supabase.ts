import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ofpzgjczqdejnwgayepg.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mcHpnamN6cWRlam53Z2F5ZXBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4MjM3NzcsImV4cCI6MjEwNjM5OTc3N30.Wj-7_lPOi-suapB3E5cBab_iPhM_MRndouB0XWToHQQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

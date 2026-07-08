import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://orxyjsqtbjygatxkjrql.supabase.co';
// We use the anon key for browser-safe client initialization
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yeHlqc3F0Ymp5Z2F0eGtqcnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMjU4NzgsImV4cCI6MjA5NDgwMTg3OH0.1su1oVJ5SfcZAapvHuldbkyfPEdiq3fGleZvET0_bU8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

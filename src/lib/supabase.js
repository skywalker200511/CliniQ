import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://khshfijvzvtqklywoppv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtoc2hmaWp2enZ0cWtseXdvcHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NzkwMjQsImV4cCI6MjEwNDM1NTAyNH0.DCVn6CEZhF893b62F0YPamINxjqvuQAu6Z_05MMUXLU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

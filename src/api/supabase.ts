import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://leqcmbvpugjvyzlxxmgs.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlcWNtYnZwdWdqdnl6bHh4bWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxMzE0NjMsImV4cCI6MjA1NzcwNzQ2M30.6SBHE2Hxto_qW4-PY6wbxlzY37H-0ekxz3Aj6_GxrJg"
export const supabase = createClient(supabaseUrl, supabaseKey)
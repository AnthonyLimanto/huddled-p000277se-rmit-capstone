import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://leqcmbvpugjvyzlxxmgs.supabase.co'
const supabaseKey = "Ask Anthony :)"
export const supabase = createClient(supabaseUrl, supabaseKey)
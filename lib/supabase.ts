
import { createClient } from '@supabase/supabase-js';

// Credenciales reales del proyecto de Manuel Caro
const supabaseUrl = 'https://qwkouiopjvopibbvvskb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3a291aW9wanZvcGliYnZ2c2tiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyOTgyNTAsImV4cCI6MjA4NDg3NDI1MH0.wwJudYj0E5wcKbME2VhIA4bOopGJ-nAVap-0iq17Ik8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

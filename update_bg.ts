import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qwkouiopjvopibbvvskb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3a291aW9wanZvcGliYnZ2c2tiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyOTgyNTAsImV4cCI6MjA4NDg3NDI1MH0.wwJudYj0E5wcKbME2VhIA4bOopGJ-nAVap-0iq17Ik8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase.from('site_settings').update({
    home_bg: 'https://images.unsplash.com/photo-1503756234508-e32369269deb?q=80&w=2564&auto=format&fit=crop&sat=-100'
  }).eq('id', 1);
  
  if (error) {
    console.error('Error updating:', error);
  } else {
    console.log('Successfully updated home_bg');
  }
}

run();

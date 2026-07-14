global.WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be configured');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

(async () => {
  console.log('Querying atlas_projects...');
  try {
    const { data, error } = await supabase.from('atlas_projects').select('*').limit(1);
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Data sample:', data);
      if (data && data.length > 0) {
        console.log('Columns:', Object.keys(data[0]));
      } else {
        console.log('Table is empty.');
      }
    }
  } catch (e) {
    console.error('Execution exception:', e);
  }
})();

global.WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://orxyjsqtbjygatxkjrql.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yeHlqc3F0Ymp5Z2F0eGtqcnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMjU4NzgsImV4cCI6MjA5NDgwMTg3OH0.1su1oVJ5SfcZAapvHuldbkyfPEdiq3fGleZvET0_bU8';

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

const { createClient } = require('@supabase/supabase-js');

// Constants
const supabaseUrl = 'https://maxzyccbxpanounjsbyd.supabase.co';
const supabaseKey = 'sb_publishable_rtGc9XjEWhUxMYML5m8WEg_EtrnUH-Z';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log('Checking read access to "fests" table...');

  // 1. Try to read anything
  const { data, error, count } = await supabase
    .from('fests')
    .select('*', { count: 'exact', head: false })
    .limit(5);

  if (error) {
    console.error('Error reading from "fests":', error.message);
    console.error('Hint: This likely means RLS (Row Level Security) is blocking read access.');
    console.error('Go to Supabase Dashboard -> Authentication -> Policies -> "fests" table.');
    console.error('Enable a policy for "Select" (read) for public/anon users.');
  } else {
    console.log(`Read success! Found ${data.length} rows.`);
    console.log('Total count in table:', count);
    if (data.length > 0) {
      console.log('First row sample:', data[0]);
      console.log('Month value in first row:', `"${data[0].month}"`);
    } else {
      console.log('Table appears to be empty or RLS is hiding all rows.');
    }
  }
}

checkData();

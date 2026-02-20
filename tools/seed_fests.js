const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Credentials
const supabaseUrl = 'https://maxzyccbxpanounjsbyd.supabase.co';
const supabaseKey = 'sb_publishable_rtGc9XjEWhUxMYML5m8WEg_EtrnUH-Z';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Reading datanames.tsx...');
  const filePath = path.join(__dirname, '../data/datanames.tsx');
  const content = fs.readFileSync(filePath, 'utf8');

  // Simple parser to extract the array content from the TSX file
  // This is a bit hacky but works for the format in datanames.tsx
  const match = content.match(/export const Datanames = (\[[\s\S]*?\]);/);
  if (!match) {
    console.error('Could not find Datanames array in file');
    return;
  }

  // Convert the string to actual JSON-like objects
  // We need to clean up the code slightly to make it valid JS
  let dataString = match[1]
    .replace(/\/\/.*$/gm, '') // remove comments
    .replace(/names: \[/g, '"names": [')
    .replace(/celebrations: \[/g, '"celebrations": [')
    .replace(/day: /g, '"day": ')
    .replace(/month: /g, '"month": ')
    .replace(/'/g, '"') // replace single quotes with double quotes
    .replace(/,(\s*[\]\}])/g, '$1'); // remove trailing commas

  try {
    const datanames = JSON.parse(dataString);
    console.log(`Parsed ${datanames.length} entries. preparing upload...`);

    // Prepare for Supabase (join arrays into strings as per your schema)
    const formattedData = datanames.map(item => ({
      day: item.day,
      month: item.month,
      names: item.names.join(', '),
      celebrations: item.celebrations.join(', ')
    }));

    // Upload in chunks of 50 to avoid timeouts
    const chunkSize = 50;
    for (let i = 0; i < formattedData.length; i += chunkSize) {
      const chunk = formattedData.slice(i, i + chunkSize);
      const { error } = await supabase.from('fests').insert(chunk);
      if (error) {
        console.error(`Error uploading chunk ${i}:`, error.message);
      } else {
        console.log(`Uploaded entries ${i} to ${Math.min(i + chunkSize, formattedData.length)}`);
      }
    }

    console.log('Migration complete!');
  } catch (e) {
    console.error('Failed to parse or upload data:', e);
  }
}

seed();

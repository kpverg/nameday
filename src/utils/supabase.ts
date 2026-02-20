import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://maxzyccbxpanounjsbyd.supabase.co';
const supabaseKey = 'sb_publishable_rtGc9XjEWhUxMYML5m8WEg_EtrnUH-Z';

// Exporting as both named and default to ensure compatibility with how you import it.
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // Set to true if you use @react-native-async-storage/async-storage
  }
});

export default supabase;

import supabase from '../../utils/supabase'

export interface Fest {
  day?: number | string
  month?: string
  names?: string
  celebrations?: string
  [key: string]: any
}

/**
 * Fetches all festivals for a specific month.
 * @param month The Greek name of the month (e.g., 'Φεβρουάριος')
 */
export async function getFestsByMonth(month: string): Promise<Fest[]> {
  console.log(`Querying Supabase for all fests in month: "${month}"`);
  
  // First, let's check if there are ANY records in the table
  const { count, error: countError } = await supabase
    .from('fests')
    .select('*', { count: 'exact', head: true });
  
  if (!countError) {
    console.log(`Total records in "fests" table: ${count}`);
  }

  const { data, error } = await supabase
    .from('fests')
    .select('day, names, celebrations')
    .ilike('month', month.trim()) // Use ilike and trim just in case
    .order('day', { ascending: true });

  if (error) {
    console.error(`Error fetching fests for ${month}:`, error);
    throw error;
  }

  console.log(`Query for "${month}" returned ${data?.length || 0} results.`);
  return (data ?? []) as Fest[];
}

export default {
  getFestsByMonth,
};

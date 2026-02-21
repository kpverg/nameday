import supabase from '../../utils/supabase'
import type { Fest } from '../../types/fest'

export async function getAllFests(): Promise<Fest[]> {
  const { data, error } = await supabase.from('fests').select('*')
  if (error) throw error
  return (data ?? []) as Fest[]
}

export async function getFestsByDayMonth(day: number | string, month: string): Promise<Fest[]> {
  console.log(`Querying Supabase for day: ${day} (type: ${typeof day}), month: ${month}`);
  const { data, error } = await supabase
    .from('fests')
    .select('day, month, names, celebrations')
    .eq('day', day)
    .eq('month', month)
  
  if (error) {
    console.error('Supabase query error:', error);
    throw error;
  }
  return (data ?? []) as Fest[]
}

export async function getTodayFests(): Promise<Fest[]> {
  const date = new Date()
  const day = date.getDate()
  const greekMonths = [
    'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος',
    'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'
  ]
  const month = greekMonths[date.getMonth()]
  
  console.log(`Current Date Info: Day ${day}, Month ${month}`);
  
  try {
    // Try as number first, then as string if no results? 
    // Usually the DB type is fixed. Let's try both in logging.
    let results = await getFestsByDayMonth(day, month);
    
    if (results.length === 0) {
      console.log('No results found for day as number, trying as string...');
      results = await getFestsByDayMonth(day.toString(), month);
    }
    
    console.log('Today Fests results:', results);
    return results;
  } catch (err) {
    console.error('Error in getTodayFests:', err);
    return [];
  }
}

export default {
  getAllFests,
  getFestsByDayMonth,
  getTodayFests,
}

import { executeQuery } from '../sqliteService'
import type { Fest } from '../../types/fest'

/**
 * Fetches all festivals for a specific month.
 * @param month The Greek name of the month (e.g., 'Φεβρουάριος')
 */
export async function getFestsByMonth(month: string): Promise<Fest[]> {
  console.log(`Querying SQLite for all fests in month: "${month}"`);
  
  return await executeQuery<Fest>(
    'SELECT day, month, names, celebrations FROM fests WHERE month = ? ORDER BY CAST(day AS INTEGER) ASC',
    [month.trim()]
  );
}

export default {
  getFestsByMonth,
};

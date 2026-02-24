import { executeQuery } from '../sqliteService'
import type { Fest } from '../../types/fest'

export async function getFestsByDayMonth(day: number | string, month: string): Promise<Fest[]> {
  const d = day.toString().trim();
  const m = month.trim();
  return await executeQuery<Fest>(
    'SELECT day, month, names, celebrations FROM fests WHERE TRIM(day) = ? AND TRIM(month) = ?',
    [d, m]
  );
}

export async function getTodayFests(): Promise<Fest[]> {
  const date = new Date()
  const day = date.getDate().toString()
  const greekMonths = [
    'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος',
    'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'
  ];
  const month = greekMonths[date.getMonth()]
  
  try {
    return await getFestsByDayMonth(day, month);
  } catch (err) {
    console.error('Error in getTodayFests:', err);
    return [];
  }
}

export default {
  getFestsByDayMonth,
  getTodayFests,
}

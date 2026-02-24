import { executeQuery } from '../sqliteService'

export interface WorldDay {
  id?: number
  day?: number | string
  month?: string
  title?: string
  description?: string
  [key: string]: any
}

/** Fetch world days for a specific day+month */
export async function getWorldDaysByDayMonth(day: number | string, month: string): Promise<WorldDay[]> {
  const d = day.toString().trim();
  const m = month.trim();
  return await executeQuery<WorldDay>(
    'SELECT id, day, month, title, description FROM worldday WHERE TRIM(day) = ? AND TRIM(month) = ?',
    [d, m]
  );
}

/** Fetch all world days for a month (used by month view) */
export async function getWorldDaysByMonth(month: string): Promise<WorldDay[]> {
  return await executeQuery<WorldDay>(
    'SELECT id, day, month, title, description FROM worldday WHERE month = ? ORDER BY day ASC',
    [month.trim()]
  );
}

/** Convenience: today's world days */
export async function getTodayWorldDays(): Promise<WorldDay[]> {
  const date = new Date()
  const day = date.getDate()
  const greekMonths = [
    'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος',
    'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'
  ]
  const month = greekMonths[date.getMonth()]

  try {
    let results = await getWorldDaysByDayMonth(day, month)
    if (results.length === 0) {
      results = await getWorldDaysByDayMonth(String(day), month)
    }
    return results
  } catch (err) {
    console.error('getTodayWorldDays error:', err)
    return []
  }
}

export default {
  getWorldDaysByDayMonth,
  getWorldDaysByMonth,
  getTodayWorldDays,
}

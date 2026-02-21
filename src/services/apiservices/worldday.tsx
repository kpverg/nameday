import supabase from '../../utils/supabase'

export interface WorldDay {
  id?: number
  day?: number | string
  month?: string
  title?: string
  description?: string
  [key: string]: any
}

/** Fetch all world days */
export async function getAllWorldDays(): Promise<WorldDay[]> {
  const { data, error } = await supabase.from('worldDay').select('*')
  if (error) {
    console.error('getAllWorldDays error:', error)
    throw error
  }
  return (data ?? []) as WorldDay[]
}

/** Fetch world days for a specific day+month */
export async function getWorldDaysByDayMonth(day: number | string, month: string): Promise<WorldDay[]> {
  console.log(`Querying worldDay for day=${day}, month=${month}`)
  const { data, error } = await supabase
    .from('worldDay')
    .select('id, day, month, title, description')
    .eq('day', day)
    .eq('month', month)

  if (error) {
    console.error('getWorldDaysByDayMonth error:', error)
    throw error
  }
  return (data ?? []) as WorldDay[]
}

/** Fetch all world days for a month (used by month view) */
export async function getWorldDaysByMonth(month: string): Promise<WorldDay[]> {
  console.log(`Querying worldDay for month=${month}`)
  const { data, error } = await supabase
    .from('worldDay')
    .select('id, day, month, title, description')
    .ilike('month', month.trim())
    .order('day', { ascending: true })

  if (error) {
    console.error('getWorldDaysByMonth error:', error)
    throw error
  }
  return (data ?? []) as WorldDay[]
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
  getAllWorldDays,
  getWorldDaysByDayMonth,
  getWorldDaysByMonth,
  getTodayWorldDays,
}

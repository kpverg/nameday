import supabase from '../utils/supabase';
import {
  getMovableNamedayEntries,
  getMovingFeastForDate,
} from '../../data/movingCelebrations';
import { normalizeGreekName } from '../utils/greekUtils';

export interface SearchResult {
  day: number;
  month: string;
  names?: string[];
  celebrations?: string[];
}

const GREEK_MONTHS = [
  'Ιανουάριος',
  'Φεβρουάριος',
  'Μάρτιος',
  'Απρίλιος',
  'Μάιος',
  'Ιούνιος',
  'Ιούλιος',
  'Αύγουστος',
  'Σεπτέμβριος',
  'Οκτώβριος',
  'Νοέμβριος',
  'Δεκέμβριος',
];

/**
 * Searches for names in both Supabase and movable celebrations.
 * @param query The name to search for.
 * @param selectedYear The year to calculate movable feasts for.
 * @returns An array of SearchResult or an error message.
 */
export const searchNames = async (
  query: string,
  selectedYear: number | null,
): Promise<{ results: SearchResult[]; message: string | null }> => {
  const q = query.trim();
  if (!q) {
    return { results: [], message: 'Γράψτε ένα όνομα.' };
  }

  const found: SearchResult[] = [];

  // 1. Search Supabase (remote data)
  const { data, error } = await supabase
    .from('fests')
    .select('day, month, names, celebrations')
    .ilike('names', `%${q}%`);

  if (!error && data) {
    data.forEach(entry => {
      // Split names string to array
      const namesArray = (entry.names as string).split(',').map(n => n.trim());
      // Re-verify exact match or relevant match (since ilike is partial)
      // but let's trust ilike for now for better ux
      found.push({
        day: Number(entry.day),
        month: entry.month as string,
        names: namesArray,
        celebrations: entry.celebrations ? (entry.celebrations as string).split(',').map(c => c.trim()) : [],
      });
    });
  }

  // 2. Search movable nameday entries for selected year
  const year = selectedYear || new Date().getFullYear();
  const moving = getMovableNamedayEntries(year);
  const qLower = normalizeGreekName(q);
  
  for (const me of moving) {
    const namesMatch = me.names && me.names.some((n: string) => normalizeGreekName(n).includes(qLower));
    const celebrationsMatch = me.celebrations && me.celebrations.some((c: string) => normalizeGreekName(c).includes(qLower));
    
    if (namesMatch || celebrationsMatch) {
      found.push({
        day: me.day,
        month: me.month,
        names: me.names,
        celebrations: me.celebrations,
      });
    }
  }

  // 2.5 Search pure movable feasts (calculated dates like "Καθαρά Δευτέρα")
  const mFeasts = (await import('./calculateMovingCeleb')).movableFeasts(year);
  Object.entries(mFeasts).forEach(([feastName, date]) => {
    if (normalizeGreekName(feastName).includes(qLower)) {
      // Avoid duplicate adds if already in movable nameday entries
      const monthLabel = GREEK_MONTHS[date.getUTCMonth()];
      const day = date.getUTCDate();
      
      const alreadyFound = found.some(f => f.day === day && f.month === monthLabel && f.celebrations?.includes(feastName));
      
      if (!alreadyFound) {
        found.push({
          day: day,
          month: monthLabel,
          names: [],
          celebrations: [feastName],
        });
      }
    }
  });

  if (found.length === 0) {
    return { results: [], message: 'Δεν βρέθηκε το όνομα.' };
  }

  // 3. Augment each found entry with any movable feast that falls on that date
  const augmented = found.map(f => {
    const monthIndex = GREEK_MONTHS.indexOf(f.month);
    const dateObj =
      monthIndex >= 0
        ? new Date(year, monthIndex, f.day)
        : new Date(year, 0, f.day);
    
    const movingName = getMovingFeastForDate(dateObj);
    const celebrations = Array.isArray(f.celebrations)
      ? [...f.celebrations]
      : [];
    
    if (movingName && !celebrations.includes(movingName)) {
      celebrations.push(movingName);
    }
    
    return { ...f, celebrations };
  });

  return { results: augmented, message: null };
};

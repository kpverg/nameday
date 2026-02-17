import { Datanames } from '../../data/datanames';
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
 * Searches for names in both static and movable celebrations.
 * @param query The name to search for.
 * @param selectedYear The year to calculate movable feasts for.
 * @returns An array of SearchResult or an error message.
 */
export const searchNames = (
  query: string,
  selectedYear: number | null,
): { results: SearchResult[]; message: string | null } => {
  const q = query.trim();
  if (!q) {
    return { results: [], message: 'Γράψτε ένα όνομα.' };
  }

  const qLower = normalizeGreekName(q);
  const found: SearchResult[] = [];

  // 1. Search static data
  for (const entry of Datanames) {
    if (
      entry.names &&
      entry.names.some((n: string) => normalizeGreekName(n) === qLower)
    ) {
      found.push({
        day: entry.day,
        month: entry.month,
        names: entry.names,
        celebrations: entry.celebrations,
      });
    }
  }

  // 2. Search movable nameday entries for selected year
  const year = selectedYear || new Date().getFullYear();
  const moving = getMovableNamedayEntries(year);
  for (const me of moving) {
    if (
      me.names &&
      me.names.some((n: string) => normalizeGreekName(n) === qLower)
    ) {
      found.push({
        day: me.day,
        month: me.month,
        names: me.names,
        celebrations: me.celebrations,
      });
    }
  }

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

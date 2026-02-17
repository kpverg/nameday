import { Datanames } from '../../data/datanames';
import { getMovableNamedayEntries } from '../../data/movingCelebrations';
import { worldDaysJanFeb } from '../../data/worldday';

export const GREEK_MONTHS = [
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

export const GREEK_MONTHS_GENITIVE = [
  'Ιανουαρίου',
  'Φεβρουαρίου',
  'Μαρτίου',
  'Απριλίου',
  'Μαΐου',
  'Ιουνίου',
  'Ιουλίου',
  'Αυγούστου',
  'Σεπτεμβρίου',
  'Οκτωβρίου',
  'Νοεμβρίου',
  'Δεκεμβρίου',
];

export const GREEK_WEEKDAYS = [
  'Κυριακή',
  'Δευτέρα',
  'Τρίτη',
  'Τετάρτη',
  'Πέμπτη',
  'Παρασκευή',
  'Σάββατο',
];

export interface NamedayEntry {
  names: string[];
  celebrations: string[];
}

export const findNamedayLocal = (dt: Date): NamedayEntry | undefined => {
  const monthName = GREEK_MONTHS[dt.getMonth()];
  const dayNum = dt.getDate();
  const staticEntry = Datanames.find(
    e => e.month === monthName && e.day === dayNum,
  );
  const movingEntries = getMovableNamedayEntries(dt.getFullYear());
  const movingEntry = movingEntries.find(
    e => e.month === monthName && e.day === dayNum,
  );

  if (!staticEntry && !movingEntry) return undefined;

  return {
    names: [...(staticEntry?.names ?? []), ...(movingEntry?.names ?? [])],
    celebrations: [
      ...(staticEntry?.celebrations ?? []),
      ...(movingEntry?.celebrations ?? []),
    ],
  };
};

export const findWorldDayLocal = (dt: Date): string | null => {
  const monthName = GREEK_MONTHS[dt.getMonth()];
  const dayNum = dt.getDate();
  const dayString = `${dayNum} ${monthName}`;
  // Search for exact match
  return (
    worldDaysJanFeb.find(
      wd => wd.date === dayString || wd.date.includes(dayString),
    )?.title ?? null
  );
};

export const formatDate = (dt: Date): string => {
  return dt.toLocaleDateString('el-GR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export interface DayCelebrations {
  day: number;
  monthIndex: number;
  weekday: string;
  names: string[];
  celebrations: string[];
  worldDays: string[];
  isToday: boolean;
}

export const getYearCelebrations = (year: number): DayCelebrations[] => {
  const result: DayCelebrations[] = [];
  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const movingEntries = getMovableNamedayEntries(year);

  for (let m = 0; m < 12; m++) {
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    const monthName = GREEK_MONTHS[m];

    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(year, m, d);
      const weekday = GREEK_WEEKDAYS[dt.getDay()];

      const staticEntry = Datanames.find(
        e => e.month === monthName && e.day === d,
      );
      const movingEntry = movingEntries.find(
        e => e.month === monthName && e.day === d,
      );

      const dayString = `${d} ${monthName}`;
      const wdMatches = worldDaysJanFeb.filter(
        wd => wd.date === dayString || wd.date.includes(dayString),
      );

      result.push({
        day: d,
        monthIndex: m,
        weekday: weekday,
        names: [...(staticEntry?.names ?? []), ...(movingEntry?.names ?? [])],
        celebrations: [
          ...(staticEntry?.celebrations ?? []),
          ...(movingEntry?.celebrations ?? []),
        ],
        worldDays: wdMatches.map(w => w.title),
        isToday: year === todayYear && m === todayMonth && d === todayDay,
      });
    }
  }

  return result;
};

export const getWeekCelebrations = (
  startDate: Date,
  selectedYear: number,
  globalDaysEnabled: boolean,
): DayCelebrations[] => {
  const result: DayCelebrations[] = [];
  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const movingEntries = getMovableNamedayEntries(selectedYear);

  for (let i = 0; i < 7; i++) {
    const dt = new Date(startDate);
    dt.setDate(startDate.getDate() + i);

    const d = dt.getDate();
    const m = dt.getMonth();
    const monthName = GREEK_MONTHS[m];
    const weekday = GREEK_WEEKDAYS[dt.getDay()];

    const staticEntry = Datanames.find(
      e => e.month === monthName && e.day === d,
    );
    const movingEntry = movingEntries.find(
      e => e.month === monthName && e.day === d,
    );

    const dayString = `${d} ${monthName}`;
    const wdMatches = globalDaysEnabled
      ? worldDaysJanFeb.filter(
          wd => wd.date === dayString || wd.date.includes(dayString),
        )
      : [];

    result.push({
      day: d,
      monthIndex: m,
      weekday: weekday,
      names: [...(staticEntry?.names ?? []), ...(movingEntry?.names ?? [])],
      celebrations: [
        ...(staticEntry?.celebrations ?? []),
        ...(movingEntry?.celebrations ?? []),
      ],
      worldDays: wdMatches.map(w => w.title),
      isToday:
        dt.getFullYear() === todayYear && m === todayMonth && d === todayDay,
    });
  }

  return result;
};

// export const findWorldDayLocal = (dt: Date): string | null => {
//   const monthName = GREEK_MONTHS[dt.getMonth()];
//   const dayNum = dt.getDate();
//   const dayString = `${dayNum} ${monthName}`;
//   // Search for exact match
//   return (
//     worldDaysJanFeb.find(
//       wd => wd.date === dayString || wd.date.includes(dayString),
//     )?.title ?? null
//   );
// };

// export const formatDate = (date: Date = new Date()) =>
//   date.toLocaleDateString('el-GR', {
//     weekday: 'long',
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric',
//   });

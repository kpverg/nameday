import { getMovableNamedayEntries } from '../../data/movingCelebrations';

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
  const movingEntries = getMovableNamedayEntries(dt.getFullYear());
  const movingEntry = movingEntries.find(
    e => e.month === monthName && e.day === dayNum,
  );

  if (!movingEntry) return undefined;

  return {
    names: [...(movingEntry?.names ?? [])],
    celebrations: [
      ...(movingEntry?.celebrations ?? []),
    ],
  };
};

export const findWorldDayLocal = (dt: Date): string | null => {
  return null;
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

      const movingEntry = movingEntries.find(
        e => e.month === monthName && e.day === d,
      );

      result.push({
        day: d,
        monthIndex: m,
        weekday: weekday,
        names: [...(movingEntry?.names ?? [])],
        celebrations: [
          ...(movingEntry?.celebrations ?? []),
        ],
        worldDays: [],
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
  numDays: number = 7,
): DayCelebrations[] => {
  const result: DayCelebrations[] = [];
  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const movingEntries = getMovableNamedayEntries(selectedYear);

  for (let i = 0; i < numDays; i++) {
    const dt = new Date(startDate);
    dt.setDate(startDate.getDate() + i);

    const d = dt.getDate();
    const m = dt.getMonth();
    const monthName = GREEK_MONTHS[m];
    const weekday = GREEK_WEEKDAYS[dt.getDay()];

    const movingEntry = movingEntries.find(
      e => e.month === monthName && e.day === d,
    );

    result.push({
      day: d,
      monthIndex: m,
      weekday: weekday,
      names: [...(movingEntry?.names ?? [])],
      celebrations: [
        ...(movingEntry?.celebrations ?? []),
      ],
      worldDays: [],
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

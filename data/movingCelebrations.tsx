// movingcelebrations.tsx
//Τσικνοπέμπτη' 52 μερεσ πρι το πασχα νηστειςν

//Ψυχοσάββατο είναι η Σάββατο πριν την Κυριακή της Απόκρεω
//Της Απόκρεω' είναι η Κυριακή πριν την Καθαρά Δευτέρα
//Η Τυροφάγος είναι η Δευτέρα πριν την Καθαρά Δευτέρα, δηλαδή η πρώτη μέρα της εβδομάδας της Απόκρεω.
//Οι Α΄ Χαιρετισμοί είναι η πρώτη Παρασκευή των Χαιρετισμών της Θεοτόκου, που γιορτάζονται την Πρώτη Παρασκευή της Σαρακοστής πριν το Πάσχα.
//Η Κυριακή της Ορθοδοξίας, που είναι η Α΄ Κυριακή των Νηστειών της Μεγάλης Σαρακοστής, γιορτάζεται την πρώτη Κυριακή μετά την Κυριακή του Τυροφάγου.
//'Β΄ Χαιρετισμοί',
//   'Β΄ Κυριακή των νηστειών',
//  'Γ΄ Χαιρετισμοί',
// 'Της Σταυροπροσκυνήσεως (Γ΄ Κυριακή των Νηστειών)',Η Κυριακή της Σταυροπροσκυνήσεως, που είναι η Γ’ Κυριακή των Νηστειών, γιορτάζεται την τρίτη Κυριακή της Μεγάλης Τεσσαρακοστής στην Ορθόδοξη Εκκλησία.
//'Δ΄ Χαιρετισμοί',
// 'Δ΄ Κυριακή των Νηστειών',
//Ο Ακάθιστος Ύμνος ψάλλεται κατά τη Μεγάλη Τεσσαρακοστή, συγκεκριμένα την πέμπτη εβδομάδα της νηστείας, που είναι η Πέμπτη Πέμπτη πριν από το Πάσχα.
//      'Ε΄ Κυριακή των Νηστειών',
//Το Σάββατο του Λαζάρου εορτάζεται το Σάββατο πριν από την Κυριακή των Βαΐων, δηλαδή 8 ημέρες πριν το Πάσχα, και τιμά την ανάσταση του Λαζάρου από τον Χριστό, ως προαναγγελία της Ανάστασης.
//      'Μεγάλη Δευτέρα',     'Μεγάλη Τρίτη', 'Μεγάλη Τετάρτη', 'Μεγάλη Πέμπτη','Μεγάλη Παρασκευή','Μεγάλο Σάββατο','Άγιο Πάσχα'
//Η 3η Διακαινησίμου είναι η Τετάρτη της Διακαινησίμου Εβδομάδας, δηλαδή η Τετάρτη μετά το Πάσχα.
//Η Ζωοδόχος Πηγή εορτάζεται την Παρασκευή της Διακαινησίμου Εβδομάδας, δηλαδή την πρώτη Παρασκευή μετά το Πάσχα.
//      'Εργατική Πρωτομαγιά',
//Η Γιορτή της Μητέρας εορτάζεται στην Ελλάδα τη δεύτερη Κυριακή του Μαΐου.
//Η Ανάληψη του Χριστού εορτάζεται 40 ημέρες μετά το Πάσχα, πάντα ημέρα Πέμπτη.
//Η Πεντηκοστή εορτάζεται 50 ημέρες μετά το Πάσχα, πάντα ημέρα Κυριακή
//

export type MovingFeast = {
  name: string;
  date: Date;
};

// Datanames-like entry for integrating movable feasts with static data
export type NamedayEntry = {
  day: number;
  month: string; // nominative case, as used in Datanames
  names: string[];
  celebrations: string[];
};

function orthodoxEaster(year: number): Date {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;

  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;

  const month = Math.floor((d + e + 114) / 31);
  const day = ((d + e + 114) % 31) + 1;

  // Ιουλιανό Πάσχα
  const julianEaster = new Date(year, month - 1, day);

  // Ιουλιανό → Γρηγοριανό (1900–2099)
  const gregorianEaster = new Date(julianEaster.getTime() + 13 * 86400000);

  return gregorianEaster;
}

function addDays(base: Date, days: number): Date {
  return new Date(base.getTime() + days * 86400000);
}

export function movableFeasts(year: number): Record<string, Date> {
  const easter = orthodoxEaster(year);

  return {
    'Καθαρά Δευτέρα': addDays(easter, -48),
    'Κυριακή των Βαΐων': addDays(easter, -7),
    'Μεγάλη Παρασκευή': addDays(easter, -2),
    Πάσχα: easter,
    'Κυριακή του Θωμά': addDays(easter, 7),
    Ανάληψη: addDays(easter, 40),
    Πεντηκοστή: addDays(easter, 50),
    'Αγίου Πνεύματος': addDays(easter, 51),
    'Αγίων Πάντων': addDays(easter, 56),
  };
}

// Επιστρέφει την εορτή για συγκεκριμένη ημερομηνία αν υπάρχει
export function getMovingFeastForDate(date: Date): string | null {
  const year = date.getFullYear();
  const feasts = movableFeasts(year);

  const targetDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  for (const [name, feastDate] of Object.entries(feasts)) {
    const compareDate = new Date(
      feastDate.getFullYear(),
      feastDate.getMonth(),
      feastDate.getDate(),
    );

    if (
      compareDate.getDate() === targetDate.getDate() &&
      compareDate.getMonth() === targetDate.getMonth() &&
      compareDate.getFullYear() === targetDate.getFullYear()
    ) {
      return name;
    }
  }

  return null;
}

// Επιστρέφει όλες τις κινούμενες εορτές ως array
export function getMovableFeastsArray(year: number): MovingFeast[] {
  const feasts = movableFeasts(year);
  return Object.entries(feasts).map(([name, date]) => ({ name, date }));
}

// Greek months (nominative) to match `data/datanames.tsx`
const GREEK_MONTHS_NOMINATIVE = [
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

// Build Datanames-style entries for key movable feasts (Πάσχα, Κυριακή των Βαΐων)
export function getMovableNamedayEntries(year: number): NamedayEntry[] {
  const feasts = movableFeasts(year);

  const easter = feasts['Πάσχα'];
  const palms = feasts['Κυριακή των Βαΐων'];
  const thomas = feasts['Κυριακή του Θωμά'];

  const entries: NamedayEntry[] = [];

  if (palms) {
    const monthName = GREEK_MONTHS_NOMINATIVE[palms.getMonth()];
    entries.push({
      day: palms.getDate(),
      month: monthName,
      names: ['Βάια', 'Βάγια', 'Βαία', 'Βάιος', 'Δάφνη', 'Δάφνης'],
      celebrations: ['Κυριακή των Βαΐων'],
    });
  }

  if (thomas) {
    const monthName = GREEK_MONTHS_NOMINATIVE[thomas.getMonth()];
    entries.push({
      day: thomas.getDate(),
      month: monthName,
      names: ['Θωμάς', 'Θωμαΐς', 'Θωμαή'],
      celebrations: ['Κυριακή του Θωμά'],
    });
  }

  if (easter) {
    const monthName = GREEK_MONTHS_NOMINATIVE[easter.getMonth()];
    entries.push({
      day: easter.getDate(),
      month: monthName,
      names: [
        'Αναστάσιος',
        'Τάσος',
        'Αναστάσης',
        'Ανέστης',
        'Αναστασία',
        'Τασούλα',
        'Νατάσα',
        'Νανά',
        'Τασία',
        'Σία',
        'Τατία',
        'Τάσα',
        'Τέσα',
        'Σάσα',
        'Πασχαλίνα',
        'Λίνα',
        'Πασχαλιά',
        'Πασχάλης',
        'Λάμπρος',
        'Λαμπρινή',
        'Λαμπρίνα',
        'Λίλα',
      ],
      celebrations: ['Πάσχα'],
    });
  }

  return entries;
}

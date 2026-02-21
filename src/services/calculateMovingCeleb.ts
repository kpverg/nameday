
function orthodoxEaster(year: number): Date {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;

  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;

  const month = Math.floor((d + e + 114) / 31);
  const day = ((d + e + 114) % 31) + 1;

  // Ιουλιανό Πάσχα (σε UTC για αποφυγή timezone shifts)
  const julianEaster = new Date(Date.UTC(year, month - 1, day));

  // Ιουλιανό → Γρηγοριανό (1900–2099)
  const gregorianEaster = new Date(julianEaster.getTime() + 13 * 86400000);

  return gregorianEaster;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  ));
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function georgiosNameDay(year: number): Date {
  const easter = orthodoxEaster(year);
  const april23 = new Date(Date.UTC(year, 3, 23)); // μήνες: 0-based

  if (april23 < easter) {
    // Δευτέρα του Πάσχα
    return addDays(easter, 1);
  }

  return april23;
}

export function movableFeasts(year: number): Record<string, Date> {
  const easter = orthodoxEaster(year);
  const movable: Record<string, Date> = {};

  // Πάσχα
  movable['Πάσχα'] = easter;

  // Κυριακή των Βαΐων (1 εβδομάδα πριν)
  movable['Κυριακή των Βαΐων'] = addDays(easter, -7);

  // Σάββατο του Λαζάρου (8 ημέρες πριν)
  movable['Σάββατο του Λαζάρου'] = addDays(easter, -8);

  // Μεγάλη Εβδομάδα
  movable['Μεγάλη Δευτέρα'] = addDays(easter, -6);
  movable['Μεγάλη Τρίτη'] = addDays(easter, -5);
  movable['Μεγάλη Τετάρτη'] = addDays(easter, -4);
  movable['Μεγάλη Πέμπτη'] = addDays(easter, -3);
  movable['Μεγάλη Παρασκευή'] = addDays(easter, -2);
  movable['Μεγάλο Σάββατο'] = addDays(easter, -1);

  // Κυριακή του Θωμά (1 εβδομάδα μετά)
  movable['Κυριακή του Θωμά'] = addDays(easter, 7);

  // 3η Διακαινησίμου (Τετάρτη μετά το Πάσχα)
  movable['3η Διακαινησίμου'] = addDays(easter, 3);

  // Ζωοδόχος Πηγή (Παρασκευή Διακαινησίμου)
  movable['Ζωοδόχος Πηγή'] = addDays(easter, 5);

  // Ανάληψη (40 ημέρες μετά)
  movable['Ανάληψη'] = addDays(easter, 39);

  // Πεντηκοστή (50 ημέρες μετά)
  movable['Πεντηκοστή'] = addDays(easter, 49);

  // Αγίου Πνεύματος (Δευτέρα Πεντηκοστής)
  movable['Αγίου Πνεύματος'] = addDays(easter, 50);

  // Αγίων Πάντων (1η Κυριακή μετά την Πεντηκοστή)
  movable['Αγίων Πάντων'] = addDays(easter, 56);

  // 🔥 Αποκριά – Σαρακοστή
  const cleanMonday = addDays(easter, -48);
  movable['Καθαρά Δευτέρα'] = cleanMonday;

  // Τυροφάγος (Κυριακή πριν την Καθαρά Δευτέρα)
  movable['Τυροφάγος'] = addDays(cleanMonday, -1);

  // Κυριακή της Απόκρεω (1 εβδομάδα πριν την Τυροφάγο)
  movable['Κυριακή της Απόκρεω'] = addDays(cleanMonday, -8);

  // Ψυχοσάββατο (Σάββατο πριν την Απόκρεω)
  movable['Ψυχοσάββατο'] = addDays(cleanMonday, -9);

  // Τσικνοπέμπτη (Πέμπτη πριν την Απόκρεω)
  movable['Τσικνοπέμπτη'] = addDays(cleanMonday, -12);

  // ✝ Χαιρετισμοί & Κυριακές Νηστειών
  movable['Κυριακή της Ορθοδοξίας'] = addDays(easter, -42);

  // Αʼ Χαιρετισμοί (Παρασκευή της 1ης εβδομάδας)
  movable['Αʼ Χαιρετισμοί'] = addDays(easter, -44);

  // Βʼ Χαιρετισμοί
  movable['Βʼ Χαιρετισμοί'] = addDays(easter, -37);
  movable['Βʼ Κυριακή των Νηστειών'] = addDays(easter, -35);

  // Γʼ Χαιρετισμοί
  movable['Γʼ Χαιρετισμοί'] = addDays(easter, -30);
  movable['Κυριακή της Σταυροπροσκυνήσεως'] = addDays(easter, -28);

  // Δʼ Χαιρετισμοί
  movable['Δʼ Χαιρετισμοί'] = addDays(easter, -23);
  movable['Δʼ Κυριακή των Νηστειών'] = addDays(easter, -21);

  // Ακάθιστος Ύμνος (Παρασκευή 5ης εβδομάδας)
  movable['Ακάθιστος Ύμνος'] = addDays(easter, -16);

  // Εʼ Κυριακή των Νηστειών
  movable['Εʼ Κυριακή των Νηστειών'] = addDays(easter, -14);

  // 🌼 Σταθερές αλλά “κινητές” ως προς εβδομάδα
  // Γιορτή της Μητέρας (Δεύτερη Κυριακή Μαΐου)
  const mothersDay = new Date(Date.UTC(year, 4, 1)); // Μάιος
  while (mothersDay.getUTCDay() !== 0) mothersDay.setUTCDate(mothersDay.getUTCDate() + 1);
  mothersDay.setUTCDate(mothersDay.getUTCDate() + 7);
  movable['Γιορτή της Μητέρας'] = mothersDay;

  // Εργατική Πρωτομαγιά
  movable['Εργατική Πρωτομαγιά'] = new Date(Date.UTC(year, 4, 1));

  // Άγιος Γεώργιος (Ειδικός κανόνας)
  movable['Άγιος Γεώργιος'] = georgiosNameDay(year);

  return movable;
}

// Επιστρέφει την εορτή για συγκεκριμένη ημερομηνία αν υπάρχει
export function getMovingFeastForDate(date: Date): string | null {
  const year = date.getFullYear();
  const feasts = movableFeasts(year);

  const targetDate = new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ));

  for (const [name, feastDate] of Object.entries(feasts)) {
    const compareDate = new Date(Date.UTC(
      feastDate.getUTCFullYear(),
      feastDate.getUTCMonth(),
      feastDate.getUTCDate(),
    ));

    if (
      compareDate.getUTCDate() === targetDate.getUTCDate() &&
      compareDate.getUTCMonth() === targetDate.getUTCMonth() &&
      compareDate.getUTCFullYear() === targetDate.getUTCFullYear()
    ) {
      return name;
    }
  }

  return null;
}

export type MovingFeast = {
  name: string;
  date: Date;
};

// Επιστρέφει όλες τις κινούμενες εορτές ως array
export function getMovableFeastsArray(year: number): MovingFeast[] {
  const feasts = movableFeasts(year);
  return Object.entries(feasts).map(([name, date]) => ({ name, date }));
}


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

function georgiosNameDay(year: number): Date {
  const easter = orthodoxEaster(year);
  const april23 = new Date(year, 3, 23); // μήνες: 0-based

  if (april23 < easter) {
    // Δευτέρα του Πάσχα
    const easterMonday = new Date(easter);
    easterMonday.setDate(easterMonday.getDate() + 1);
    return easterMonday;
  }

  return april23;
}

export function movableFeasts(year: number): Record<string, Date> {
  const easter = orthodoxEaster(year);
  // Υπολογισμοί για όλες τις κινητές εορτές
  const apokreoSunday = addDays(easter, -49); // Κυριακή της Απόκρεω
  const tyrofagosSunday = addDays(easter, -42); // Κυριακή της Τυροφάγου
  const tsiknopempti = addDays(easter, -52); // Τσικνοπέμπτη
  const psychosabbato = addDays(easter, -50); // Ψυχοσάββατο (Σάββατο πριν της Απόκρεω)
  const firstSalutations = addDays(easter, -43); // Α' Χαιρετισμοί (πρώτη Παρασκευή Σαρακοστής)
  const orthodoxySunday = addDays(easter, -42); // Κυριακή της Ορθοδοξίας (Α' Κυριακή Νηστειών)
  const secondSalutations = addDays(easter, -36); // Β' Χαιρετισμοί (δεύτερη Παρασκευή Σαρακοστής)
  const secondLentSunday = addDays(easter, -35); // Β' Κυριακή Νηστειών
  const thirdSalutations = addDays(easter, -29); // Γ' Χαιρετισμοί (τρίτη Παρασκευή Σαρακοστής)
  const venerationSunday = addDays(easter, -28); // Κυριακή Σταυροπροσκυνήσεως (Γ' Κυριακή Νηστειών)
  const fourthSalutations = addDays(easter, -22); // Δ' Χαιρετισμοί (τέταρτη Παρασκευή Σαρακοστής)
  const fourthLentSunday = addDays(easter, -21); // Δ' Κυριακή Νηστειών
  const akathistosHymn = addDays(easter, -15); // Ακάθιστος Ύμνος (πέμπτη Παρασκευή Σαρακοστής)
  const fifthLentSunday = addDays(easter, -14); // Ε' Κυριακή Νηστειών
  const lazarusSaturday = addDays(easter, -8); // Σάββατο του Λαζάρου
  const palmsSunday = addDays(easter, -7); // Κυριακή των Βαΐων
  const holyMonday = addDays(easter, -6); // Μεγάλη Δευτέρα
  const holyTuesday = addDays(easter, -5); // Μεγάλη Τρίτη
  const holyWednesday = addDays(easter, -4); // Μεγάλη Τετάρτη
  const holyThursday = addDays(easter, -3); // Μεγάλη Πέμπτη
  const holyFriday = addDays(easter, -2); // Μεγάλη Παρασκευή
  const holySaturday = addDays(easter, -1); // Μεγάλο Σάββατο
  const pascha = easter; // Πάσχα
  const thomasSunday = addDays(easter, 7); // Κυριακή του Θωμά
  const thirdOfDiakainisimos = addDays(easter, 10); // 3η Διακαινησίμου (Τετάρτη μετά το Πάσχα)
  const zoodochosPigi = addDays(easter, 12); // Ζωοδόχος Πηγή (Παρασκευή μετά το Πάσχα)
  const mayDay = new Date(year, 4, 1); // Εργατική Πρωτομαγιά
  const georgios = georgiosNameDay(year); // Άγιος Γεώργιος
  
  // Γιορτή της Μητέρας: 2η Κυριακή Μαΐου
  let mothersDay = new Date(year, 4, 1);
  let sundayCount = 0;
  for (let i = 0; i < 31; i++) {
    const d = new Date(year, 4, 1 + i);
    if (d.getMonth() !== 4) break;
    if (d.getDay() === 0) {
      sundayCount++;
      if (sundayCount === 2) {
        mothersDay = d;
        break;
      }
    }
  }
  const ascension = addDays(easter, 40); // Ανάληψη
  const pentecost = addDays(easter, 50); // Πεντηκοστή
  const holySpirit = addDays(easter, 51); // Αγίου Πνεύματος
  const allSaints = addDays(easter, 56); // Αγίων Πάντων

  return {
    Τσικνοπέμπτη: tsiknopempti,
    Ψυχοσάββατο: psychosabbato,
    'Κυριακή της Απόκρεω': apokreoSunday,
    Τυροφάγος: tyrofagosSunday,
    'Αʼ Χαιρετισμοί': firstSalutations,
    'Κυριακή της Ορθοδοξίας': orthodoxySunday,
    'Βʼ Χαιρετισμοί': secondSalutations,
    'Βʼ Κυριακή των Νηστειών': secondLentSunday,
    'Γʼ Χαιρετισμοί': thirdSalutations,
    'Κυριακή της Σταυροπροσκυνήσεως': venerationSunday,
    'Δʼ Χαιρετισμοί': fourthSalutations,
    'Δʼ Κυριακή των Νηστειών': fourthLentSunday,
    'Ακάθιστος Ύμνος': akathistosHymn,
    'Εʼ Κυριακή των Νηστειών': fifthLentSunday,
    'Σάββατο του Λαζάρου': lazarusSaturday,
    'Κυριακή των Βαΐων': palmsSunday,
    'Μεγάλη Δευτέρα': holyMonday,
    'Μεγάλη Τρίτη': holyTuesday,
    'Μεγάλη Τετάρτη': holyWednesday,
    'Μεγάλη Πέμπτη': holyThursday,
    'Μεγάλη Παρασκευή': holyFriday,
    'Μεγάλο Σάββατο': holySaturday,
    Πάσχα: pascha,
    'Κυριακή του Θωμά': thomasSunday,
    '3η Διακαινησίμου': thirdOfDiakainisimos,
    'Ζωοδόχος Πηγή': zoodochosPigi,
    'Εργατική Πρωτομαγιά': mayDay,
    'Γιορτή της Μητέρας': mothersDay,
    'Άγιος Γεώργιος': georgios,
    Ανάληψη: ascension,
    Πεντηκοστή: pentecost,
    'Αγίου Πνεύματος': holySpirit,
    'Αγίων Πάντων': allSaints,
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

export type MovingFeast = {
  name: string;
  date: Date;
};

// Επιστρέφει όλες τις κινούμενες εορτές ως array
export function getMovableFeastsArray(year: number): MovingFeast[] {
  const feasts = movableFeasts(year);
  return Object.entries(feasts).map(([name, date]) => ({ name, date }));
}

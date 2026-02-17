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

import {
  movableFeasts,
  getMovingFeastForDate as getFeastForDate,
  getMovableFeastsArray,
} from '../src/services/calculateMovingCeleb';

export { getFeastForDate as getMovingFeastForDate };

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

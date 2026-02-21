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
  const zoodochosPigi = feasts['Ζωοδόχος Πηγή'];
  const holySpirit = feasts['Αγίου Πνεύματος'];
  const allSaints = feasts['Αγίων Πάντων'];
  const georgios = feasts['Άγιος Γεώργιος'];

  const entries: NamedayEntry[] = [];

  if (georgios) {
    const monthName = GREEK_MONTHS_NOMINATIVE[georgios.getMonth()];
    entries.push({
      day: georgios.getDate(),
      month: monthName,
      names: ['Γεώργιος', 'Γιώργος', 'Γιωργάκης', 'Γεωργία', 'Γιωργία', 'Γιωργίτσα', 'Γωγώ', 'Τζώρτζια'],
      celebrations: ['Αγίου Γεωργίου'],
    });
  }

  if (zoodochosPigi) {
    const monthName = GREEK_MONTHS_NOMINATIVE[zoodochosPigi.getMonth()];
    entries.push({
      day: zoodochosPigi.getDate(),
      month: monthName,
      names: ['Ζωή', 'Ζωίτσα', 'Ζωζώ', 'Πηγή', 'Κρήνη', 'Κρηνιώ'],
      celebrations: ['Ζωοδόχου Πηγής'],
    });
  }

  if (holySpirit) {
    const monthName = GREEK_MONTHS_NOMINATIVE[holySpirit.getMonth()];
    entries.push({
      day: holySpirit.getDate(),
      month: monthName,
      names: ['Τριάδα', 'Τριάδω', 'Τριανταφυλλιά'],
      celebrations: ['Αγίου Πνεύματος'],
    });
  }

  if (allSaints) {
    const monthName = GREEK_MONTHS_NOMINATIVE[allSaints.getMonth()];
    entries.push({
      day: allSaints.getDate(),
      month: monthName,
      names: ['Αγαμέμνων', 'Αγαμέμνονας', 'Αγησίλαος', 'Αγόρω', 'Αγορίτσα', 'Αίολος', 'Άλκηστις', 'Αλκμήνη', 'Ανδρομέδα', 'Αντιόπη', 'Αριστομένης', 'Αρθούρος', 'Βελισσάριος', 'Βενέτιος', 'Βενετία', 'Βενιζέλος', 'Βιολέτα', 'Βρασίδας', 'Διαγόρας', 'Δίκαιος', 'Εβελίνα', 'Έκτορας', 'Ελβίρα', 'Εριφύλη', 'Έρρικα', 'Ερρίκος', 'Ερωτόκριτος', 'Ευαγόρας', 'Ευριπίδης', 'Ευρυδίκη', 'Ζώτος', 'Ήβη', 'Ηλέκτρα', 'Ηρώ', 'Θέλμα', 'Θεόβουλος', 'Θεόφραστος', 'Θησέας', 'Ινώ', 'Ιοκάστη', 'Ισαβέλλα', 'Ισμήνη', 'Καραρίνα', 'Κίμων', 'Κίμωνας', 'Κλέαρχος', 'Κλεομένης', 'Κομνηνός', 'Κρίτων', 'Λαέρτης', 'Λογοθέτης', 'Λυκούργος', 'Μαλαματή', 'Μάρω', 'Μίνωας', 'Μιράντα', 'Μιρέλλα', 'Μυρτώ', 'Ναυσικά', 'Νεοκλής', 'Νεοπτόλεμος', 'Νιόβη', 'Ορφέας', 'Όθων', 'Όθωνας', 'Παγώνα', 'Πανωραία', 'Περίανδρος', 'Πραξιτέλης', 'Πυθαγόρας', 'Ροδοθέα', 'Τερέζα', 'Τερψιθέα', 'Τίμων', 'Τίμωνας', 'Φαίδρα', 'Φρύνη', 'Χλόη', 'Χρυσηίδα'],
      celebrations: ['Αγίων Πάντων'],
    });
  }

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

  // Add other movable feasts that don't necessarily have names but are important celebrations
  const otherFeasts = [
    'Καθαρά Δευτέρα',
    'Τσικνοπέμπτη',
    'Ψυχοσάββατο',
    'Κυριακή της Απόκρεω',
    'Τυροφάγος',
    'Αʼ Χαιρετισμοί',
    'Κυριακή της Ορθοδοξίας',
    'Βʼ Χαιρετισμοί',
    'Βʼ Κυριακή των Νηστειών',
    'Γʼ Χαιρετισμοί',
    'Κυριακή της Σταυροπροσκυνήσεως',
    'Δʼ Χαιρετισμοί',
    'Δʼ Κυριακή των Νηστειών',
    'Ακάθιστος Ύμνος',
    'Εʼ Κυριακή των Νηστειών',
    'Σάββατο του Λαζάρου',
    'Μεγάλη Δευτέρα',
    'Μεγάλη Τρίτη',
    'Μεγάλη Τετάρτη',
    'Μεγάλη Πέμπτη',
    'Μεγάλη Παρασκευή',
    'Μεγάλο Σάββατο',
    '3η Διακαινησίμου',
    'Εργατική Πρωτομαγιά',
    'Γιορτή της Μητέρας',
    'Ανάληψη',
    'Πεντηκοστή'
  ];

  otherFeasts.forEach(feastName => {
    const feastDate = feasts[feastName];
    if (feastDate) {
      const monthName = GREEK_MONTHS_NOMINATIVE[feastDate.getMonth()];
      entries.push({
        day: feastDate.getDate(),
        month: monthName,
        names: [],
        celebrations: [feastName],
      });
    }
  });

  return entries;
}

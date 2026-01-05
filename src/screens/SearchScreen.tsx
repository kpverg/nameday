import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Button,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Datanames } from '../../data/datanames';
import {
  getMovableNamedayEntries,
  getMovingFeastForDate,
} from '../../data/movingCelebrations';
import { useAppContext } from '../AppContext';

type Props = {
  onBack: () => void;
};

export function SearchScreen({ onBack }: Props) {
  const { selectedYear, darkModeEnabled, backgroundColor, effectiveTextColor } =
    useAppContext();
  const [query, setQuery] = useState('');
  const [normalizedQuery, setNormalizedQuery] = useState('');
  const [results, setResults] = useState<
    Array<{
      day: number;
      month: string;
      names?: string[];
      celebrations?: string[];
    }>
  >([]);
  const [message, setMessage] = useState<string | null>(null);

  const normalize = (s: string) =>
    s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

  const findName = () => {
    const q = query.trim();
    if (!q) {
      setMessage('Γράψτε ένα όνομα.');
      setResults([]);
      return;
    }
    const qLower = normalize(q);
    setNormalizedQuery(qLower);
    const found: Array<{
      day: number;
      month: string;
      names?: string[];
      celebrations?: string[];
    }> = [];

    // Search static data
    for (const entry of Datanames) {
      if (
        entry.names &&
        entry.names.some((n: string) => normalize(n) === qLower)
      ) {
        found.push({
          day: entry.day,
          month: entry.month,
          names: entry.names,
          celebrations: entry.celebrations,
        });
      }
    }

    // Search movable nameday entries for selected year
    const moving = getMovableNamedayEntries(
      selectedYear || new Date().getFullYear(),
    );
    for (const me of moving) {
      if (me.names && me.names.some((n: string) => normalize(n) === qLower)) {
        found.push({
          day: me.day,
          month: me.month,
          names: me.names,
          celebrations: me.celebrations,
        });
      }
    }

    if (found.length === 0) {
      setMessage('Δεν βρέθηκε το όνομα.');
      setResults([]);
    } else {
      // Augment each found entry with any movable feast that falls on that date
      const augmented = found.map(f => {
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
        const monthIndex = GREEK_MONTHS.indexOf(f.month);
        const year = selectedYear || new Date().getFullYear();
        const dateObj =
          monthIndex >= 0
            ? new Date(year, monthIndex, f.day)
            : new Date(year, 0, f.day);
        const movingName = getMovingFeastForDate(dateObj);
        const celebrations = Array.isArray(f.celebrations)
          ? [...f.celebrations]
          : [];
        if (movingName && !celebrations.includes(movingName))
          celebrations.push(movingName);
        return { ...f, celebrations };
      });

      setMessage(null);
      setResults(augmented);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: darkModeEnabled ? '#0B1220' : backgroundColor },
      ]}
    >
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={effectiveTextColor} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: effectiveTextColor }]}>
          Αναζήτηση ονόματος
        </Text>
      </View>

      <View style={styles.body}>
        <TextInput
          placeholder="Γράψτε όνομα"
          value={query}
          onChangeText={setQuery}
          style={[
            styles.input,
            {
              backgroundColor: darkModeEnabled ? '#111827' : '#fff',
              color: effectiveTextColor,
              borderColor: darkModeEnabled ? '#222' : '#D1D5DB',
            },
          ]}
          autoCapitalize="words"
        />
        <View style={styles.findButton}>
          <Button title="Find" onPress={findName} />
        </View>

        {message ? (
          <Text style={[styles.message, { color: effectiveTextColor }]}>
            {message}
          </Text>
        ) : null}

        <ScrollView style={styles.results}>
          {results.map((r, idx) => {
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
            const monthIndex = GREEK_MONTHS.indexOf(r.month);
            const year = selectedYear || new Date().getFullYear();
            const dateObj =
              monthIndex >= 0
                ? new Date(year, monthIndex, r.day)
                : new Date(year, 0, r.day);
            const weekday = dateObj.toLocaleDateString('el-GR', {
              weekday: 'long',
            });

            return (
              <View
                key={`${r.month}-${r.day}-${idx}`}
                style={styles.resultItem}
              >
                <Text
                  style={[styles.resultText, { color: effectiveTextColor }]}
                >{`${weekday}, ${r.day} ${r.month}`}</Text>
                {r.names && r.names.length > 0 && (
                  <Text
                    style={[styles.namesLine, { color: effectiveTextColor }]}
                  >
                    {r.names.map((n, i) => {
                      const isMatch = normalize(n) === normalizedQuery;
                      return (
                        <Text
                          key={i}
                          style={isMatch ? styles.nameMatch : undefined}
                        >
                          {n}
                          {i < r.names!.length - 1 ? ', ' : ''}
                        </Text>
                      );
                    })}
                  </Text>
                )}
                {r.celebrations && r.celebrations.length > 0 && (
                  <View style={styles.celebrationBlock}>
                    <Text
                      style={[
                        styles.celebrationLabel,
                        { color: effectiveTextColor },
                      ]}
                    >
                      Εορτές σήμερα:
                    </Text>
                    <Text
                      style={[
                        styles.celebrationText,
                        { color: effectiveTextColor },
                      ]}
                    >
                      {r.celebrations.join(', ')}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: { marginRight: 8 },
  title: { fontSize: 18, fontWeight: '600' },
  body: { padding: 16 },
  input: {
    height: 44,
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  findButton: { marginBottom: 12 },
  message: { color: '#6B7280', marginBottom: 8 },
  results: { marginTop: 8 },
  resultItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  resultText: { fontSize: 16, fontWeight: '600' },
  namesList: { marginTop: 6, marginBottom: 6 },
  nameItem: { fontSize: 14, color: '#111827' },
  namesLine: { marginTop: 6, marginBottom: 6, fontSize: 14, color: '#111827' },
  celebrationBlock: { marginTop: 6 },
  celebrationLabel: { fontSize: 14, fontWeight: '700', color: '#111827' },
  celebrationText: {
    fontSize: 14,
    color: '#374151',
    marginTop: 4,
    fontWeight: '700',
  },
  nameMatch: { fontWeight: '700' },
});

export default SearchScreen;

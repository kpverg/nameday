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
import { useAppContext } from '../AppContext';
import { normalizeGreekName } from '../utils/greekUtils';
import { searchNames, SearchResult } from '../services/searchService';

type Props = {
  onBack: () => void;
};

export function SearchScreen({ onBack }: Props) {
  const { selectedYear, darkModeEnabled, backgroundColor, effectiveTextColor } =
    useAppContext();
  const [query, setQuery] = useState('');
  const [normalizedQuery, setNormalizedQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  const findName = async () => {
    const qLower = normalizeGreekName(query);
    setNormalizedQuery(qLower);
    setSearching(true);

    try {
      const { results: searchResults, message: searchMessage } = await searchNames(
        query,
        selectedYear,
      );

      setResults(searchResults);
      setMessage(searchMessage);
    } catch (err) {
      console.error(err);
      setMessage('Σφάλμα κατά την αναζήτηση.');
    } finally {
      setSearching(false);
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
                style={[
                  styles.resultItem,
                  { borderBottomColor: darkModeEnabled ? '#374151' : '#F3F4F6' }
                ]}
              >
                {/* 1. Ημερομηνία πρώτη */}
                <Text
                  style={[styles.resultText, { color: effectiveTextColor }]}
                >{`${weekday}, ${r.day} ${r.month}`}</Text>

                {/* 2. Εορτές σήμερα */}
                {r.celebrations && r.celebrations.length > 0 && (
                  <View style={styles.celebrationBlock}>
                    <Text
                      style={[
                        styles.celebrationText,
                        { color: darkModeEnabled ? '#9CA3AF' : '#4B5563' },
                      ]}
                    >
                      Γιορτή: {r.celebrations.join(', ')}
                    </Text>
                  </View>
                )}

                {/* 3. Ονόματα (με μπλε το όνομα που γράψαμε) */}
                {r.names && r.names.length > 0 && (
                  <View style={{ marginTop: 8 }}>
                    <Text
                      style={[
                        styles.celebrationLabel,
                        { color: effectiveTextColor, fontSize: 13 },
                      ]}
                    >
                      Ονόματα που γιορτάζουν σήμερα:
                    </Text>
                    <Text
                      style={[styles.namesLine, { color: effectiveTextColor, marginTop: 4 }]}
                    >
                      {r.names.map((n, i) => {
                        const isMatch = normalizeGreekName(n) === normalizedQuery;
                        return (
                          <Text
                            key={i}
                            style={isMatch ? [styles.nameMatch, { color: '#2563EB', fontWeight: 'bold' }] : undefined}
                          >
                            {n}
                            {i < r.names!.length - 1 ? ', ' : ''}
                          </Text>
                        );
                      })}
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
  container: { flex: 1 },
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
  body: { padding: 16, flex: 1 },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  findButton: { marginBottom: 12 },
  message: { fontSize: 14, marginBottom: 8 },
  results: { flex: 1, marginTop: 8 },
  resultItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  resultText: { fontSize: 16, fontWeight: '600' },
  namesList: { marginTop: 6, marginBottom: 6 },
  nameItem: { fontSize: 14 },
  namesLine: { marginTop: 6, marginBottom: 6, fontSize: 14 },
  celebrationBlock: { marginTop: 6 },
  celebrationLabel: { fontSize: 14, fontWeight: '700' },
  celebrationText: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '700',
  },
  nameMatch: { fontWeight: '700', color: '#EF4444' },
});

export default SearchScreen;

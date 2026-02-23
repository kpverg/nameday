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
  const {
    selectedYear,
    darkModeEnabled,
    backgroundColor,
    effectiveTextColor,
    primaryColor,
    primaryColorLight,
    addAlpha,
  } = useAppContext();
  const [query, setQuery] = useState('');
  const [normalizedQuery, setNormalizedQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Fixed list of common moving celebrations for autofill suggestions
  const MOVING_SUGGESTIONS = [
    'Πάσχα', 'Καθαρά Δευτέρα', 'Κυριακή των Βαΐων', 'Ανάληψη', 'Πεντηκοστή',
    'Αγίου Πνεύματος', 'Τσικνοπέμπτη', 'Σάββατο του Λαζάρου', 'Ψυχοσάββατο',
    'Κυριακή της Ορθοδοξίας', 'Μεγάλη Παρασκευή', 'Ζωοδόχος Πηγή'
  ];

  const findName = async (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) return;

    const qLower = normalizeGreekName(finalQuery);
    setNormalizedQuery(qLower);
    setSearching(true);
    setSuggestions([]);

    try {
      const { results: searchResults, message: searchMessage } = await searchNames(
        finalQuery,
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

  const handleTextChange = (text: string) => {
    setQuery(text);
    if (text.length > 1) {
      const qLower = normalizeGreekName(text);
      const filtered = MOVING_SUGGESTIONS.filter(s => 
        normalizeGreekName(s).includes(qLower)
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
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
        <View style={{ zIndex: 10 }}>
          <TextInput
            placeholder="Γράψτε όνομα ή γιορτή..."
            value={query}
            onChangeText={handleTextChange}
            style={[
              styles.input,
              {
                backgroundColor: darkModeEnabled ? '#111827' : '#fff',
                color: effectiveTextColor,
                borderColor: darkModeEnabled ? '#374151' : addAlpha(primaryColor, 0.2),
              },
            ]}
            placeholderTextColor={darkModeEnabled ? '#9CA3AF' : '#6b7280'}
            autoCapitalize="words"
          />
          {suggestions.length > 0 && (
            <View style={[
              styles.suggestionsBox, 
              { 
                backgroundColor: darkModeEnabled ? '#1F2937' : '#fff',
                borderColor: darkModeEnabled ? '#374151' : '#ddd'
              }
            ]}>
              {suggestions.map((s, i) => (
                <TouchableOpacity 
                  key={i} 
                  style={styles.suggestionItem}
                  onPress={() => {
                    setQuery(s);
                    findName(s);
                  }}
                >
                  <Text style={{ color: effectiveTextColor }}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.findButtonContainer,
            { backgroundColor: primaryColor },
          ]}
          onPress={() => findName()}
        >
          <Text style={styles.findButtonText}>Αναζήτηση</Text>
        </TouchableOpacity>

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
                  styles.resultCard,
                  {
                    backgroundColor: darkModeEnabled ? '#1F2937' : addAlpha(primaryColor, 0.05),
                    borderColor: darkModeEnabled ? '#374151' : addAlpha(primaryColor, 0.15),
                    borderWidth: 1,
                  },
                ]}
              >
                {/* 1. Ημερομηνία πρώτη */}
                <Text
                  style={[styles.resultText, { color: primaryColor }]}
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
                            style={isMatch ? { color: primaryColor, fontWeight: 'bold' } : undefined}
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
  suggestionsBox: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 100,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: { marginRight: 8 },
  title: { fontSize: 18, fontWeight: '600' },
  body: { padding: 16, flex: 1 },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  findButtonContainer: {
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  findButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  message: { fontSize: 14, marginBottom: 12 },
  results: { flex: 1, marginTop: 8 },
  resultCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  resultText: { fontSize: 16, fontWeight: '700' },
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

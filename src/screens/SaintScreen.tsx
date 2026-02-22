import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppContext } from '../AppContext';

interface SaintScreenProps {
  onBack?: () => void;
  saintName?: string;
  imageUri?: string;
  biography?: string;
  apolitikio?: string;
}

export default function SaintScreen({
  onBack,
  saintName = 'Όνομα Αγίου',
  imageUri,
  biography = 'Εδώ θα εμφανίζεται η βιογραφία του Αγίου...',
  apolitikio = 'Εδώ θα εμφανίζεται το απολυτίκιο του Αγίου...',
}: SaintScreenProps) {
  const { darkModeEnabled, primaryColor, effectiveTextColor, addAlpha, backgroundColor } = useAppContext();

  const dynamicContainerStyle = {
    backgroundColor: darkModeEnabled ? '#111827' : backgroundColor,
  };

  const dynamicHeaderStyle = {
    backgroundColor: primaryColor,
  };

  const dynamicCardStyle = {
    backgroundColor: darkModeEnabled ? '#1F2937' : '#fff',
    borderColor: darkModeEnabled ? '#374151' : addAlpha(primaryColor, 0.15),
    borderWidth: 1,
  };

  return (
    <View style={[styles.container, dynamicContainerStyle]}>
      {/* Custom Header */}
      <View style={[styles.header, dynamicHeaderStyle]}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>{saintName}</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Placeholder for Image */}
        <View style={[styles.imageContainer, dynamicCardStyle]}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.saintImage} resizeMode="contain" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={60} color={addAlpha(primaryColor, 0.3)} />
              <Text style={{ color: addAlpha(effectiveTextColor, 0.5), marginTop: 10 }}>Προσθήκη Εικόνας</Text>
            </View>
          )}
        </View>

        {/* Biography Section */}
        <View style={[styles.section, dynamicCardStyle]}>
          <Text style={[styles.sectionTitle, { color: primaryColor }]}>Βιογραφία</Text>
          <Text style={[styles.text, { color: effectiveTextColor }]}>{biography}</Text>
        </View>

        {/* Apolytikio Section */}
        <View style={[styles.section, dynamicCardStyle]}>
          <Text style={[styles.sectionTitle, { color: primaryColor }]}>Απολυτίκιο</Text>
          <Text style={[styles.text, styles.apolitikioText, { color: effectiveTextColor }]}>
            {apolitikio}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 4,
    width: 40,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saintImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
  apolitikioText: {
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

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
import { Saint } from '../types/saint';

interface SaintScreenProps {
  onBack?: () => void;
  saint?: Saint;
  allSaints?: Saint[];
  onNextSaint?: () => void;
  onPrevSaint?: () => void;
}

export default function SaintScreen({
  onBack,
  saint,
  allSaints = [],
  onNextSaint,
  onPrevSaint,
}: SaintScreenProps) {
  const { darkModeEnabled, primaryColor, effectiveTextColor, addAlpha, backgroundColor } = useAppContext();

  const currentIndex = allSaints.findIndex(s => s.id === saint?.id);
  const hasMultiple = allSaints.length > 1;

  const saintName = saint?.name || 'Όνομα Αγίου';
  const imageUri = saint?.image_url;
  const biography = saint?.bio || 'Εδώ θα εμφανίζεται η βιογραφία του Αγίου...';
  const apolitikio = saint?.apolitikio || 'Εδώ θα εμφανίζεται το απολυτίκιο του Αγίου...';

  const dynamicContainerStyle = {
    backgroundColor: darkModeEnabled ? '#111827' : backgroundColor,
  };

  const dynamicHeaderStyle = {
    backgroundColor: primaryColor,
  };

  const dynamicCardStyle = {
    backgroundColor: darkModeEnabled ? '#1F2937' : addAlpha(primaryColor, 0.05),
    borderColor: darkModeEnabled ? '#374151' : addAlpha(primaryColor, 0.15),
    borderWidth: 1,
  };

  return (
    <View style={[styles.container, dynamicContainerStyle]}>
      {/* Custom Header */}
      <View style={[styles.header, dynamicHeaderStyle]}>
        <View style={styles.headerSide}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.headerButton}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {saintName}
        </Text>

        <View style={[styles.headerSide, { flexDirection: 'row', justifyContent: 'flex-end' }]}>
          {hasMultiple && (
            <>
              <TouchableOpacity 
                onPress={onPrevSaint} 
                style={[styles.headerButton, { marginRight: 8 }]}
                disabled={currentIndex === 0}
              >
                <Ionicons 
                  name="chevron-back-outline" 
                  size={22} 
                  color={currentIndex === 0 ? 'rgba(255,255,255,0.4)' : '#fff'} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={onNextSaint} 
                style={styles.headerButton}
                disabled={currentIndex === allSaints.length - 1}
              >
                <Ionicons 
                  name="chevron-forward-outline" 
                  size={22} 
                  color={currentIndex === allSaints.length - 1 ? 'rgba(255,255,255,0.4)' : '#fff'} 
                />
              </TouchableOpacity>
            </>
          )}
          {!hasMultiple && <View style={{ width: 40 }} />}
        </View>
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
  headerSide: {
    width: 80,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 6,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
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

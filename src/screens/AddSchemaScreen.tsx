import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useState } from 'react';
import { useAppContext } from '../AppContext';

export const AddSchemaScreen = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { darkModeEnabled, backgroundColor, textColor } = useAppContext();

  const handleAdd = () => {
    // Handle adding schema logic here
    console.log('Adding schema:', { name, description });
    setName('');
    setDescription('');
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: darkModeEnabled ? '#1F2937' : backgroundColor },
      ]}
    >
      <Text
        style={[
          styles.title,
          darkModeEnabled && styles.titleDark,
          { color: textColor },
        ]}
      >
        Προσθήκη Σχήματος
      </Text>
      <Text style={[styles.subtitle, darkModeEnabled && styles.subtitleDark]}>
        Προσθέστε ένα νέο σχήμα εορτών
      </Text>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text
            style={[
              styles.label,
              darkModeEnabled && styles.labelDark,
              { color: textColor },
            ]}
          >
            Όνομα Σχήματος
          </Text>
          <TextInput
            style={[styles.input, darkModeEnabled && styles.inputDark]}
            placeholder="π.χ. Το σχήμα του Ιωάννη"
            value={name}
            onChangeText={setName}
            placeholderTextColor={darkModeEnabled ? '#6B7280' : '#9CA3AF'}
            color={textColor}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text
            style={[
              styles.label,
              darkModeEnabled && styles.labelDark,
              { color: textColor },
            ]}
          >
            Περιγραφή
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              darkModeEnabled && styles.inputDark,
            ]}
            placeholder="Περιγραφή του σχήματος..."
            value={description}
            onChangeText={setDescription}
            placeholderTextColor={darkModeEnabled ? '#6B7280' : '#9CA3AF'}
            color={textColor}
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, !name && styles.buttonDisabled]}
          onPress={handleAdd}
          disabled={!name}
        >
          <Text style={styles.buttonText}>Προσθήκη</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  containerDark: {
    backgroundColor: '#1F2937',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  titleDark: {
    color: '#F3F4F6',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  subtitleDark: {
    color: '#9CA3AF',
  },
  form: {
    marginTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  labelDark: {
    color: '#E5E7EB',
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  inputDark: {
    backgroundColor: '#111827',
    borderColor: '#374151',
    color: '#F3F4F6',
  },
  textArea: {
    paddingTop: 10,
    paddingBottom: 10,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#1E6AC7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

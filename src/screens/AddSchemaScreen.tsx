import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useState } from 'react';

export const AddSchemaScreen = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleAdd = () => {
    // Handle adding schema logic here
    console.log('Adding schema:', { name, description });
    setName('');
    setDescription('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Προσθήκη Σχήματος</Text>
      <Text style={styles.subtitle}>Προσθέστε ένα νέο σχήμα εορτών</Text>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Όνομα Σχήματος</Text>
          <TextInput
            style={styles.input}
            placeholder="π.χ. Το σχήμα του Ιωάννη"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Περιγραφή</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Περιγραφή του σχήματος..."
            value={description}
            onChangeText={setDescription}
            placeholderTextColor="#9CA3AF"
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
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
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

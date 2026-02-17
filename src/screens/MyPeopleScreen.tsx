import React, { useState, useEffect } from 'react';
/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useContacts } from '../ContactsContext';
import { useAppContext } from '../AppContext';

const MY_PEOPLE_STORAGE_KEY = '@nameday_schemas';

export default function MyPeopleScreen() {
  const { searchContactsByGreeklish, refreshMyPeople } = useContacts();
  const { effectiveTextColor, darkModeEnabled } =
    useAppContext();

  const [showModal, setShowModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [assocQuery, setAssocQuery] = useState('');
  const [assocSuggestions, setAssocSuggestions] = useState<any[]>([]);
  const [selectedPersonContact, setSelectedPersonContact] = useState<any>(null);
  const [memberName, setMemberName] = useState('');
  const [memberRelation, setMemberRelation] = useState('Γιος');
  const [memberBirthday, setMemberBirthday] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [savedPeopleGroups, setSavedPeopleGroups] = useState<any[]>([]);
  const [editGroupId, setEditGroupId] = useState<string | null>(null);

  // Load groups from AsyncStorage on mount
  useEffect(() => {
    loadGroups();
  }, []);

  // Save groups to AsyncStorage whenever they change
  useEffect(() => {
    console.log(
      '[MyPeopleScreen] savedPeopleGroups changed, length:',
      savedPeopleGroups.length,
    );
    saveGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedPeopleGroups]);

  const loadGroups = async () => {
    try {
      const stored = await AsyncStorage.getItem(MY_PEOPLE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log(
          '[MyPeopleScreen] Loaded groups from storage:',
          parsed.length,
        );
        setSavedPeopleGroups(parsed);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const saveGroups = async () => {
    try {
      console.log(
        '[MyPeopleScreen] Saving groups to storage:',
        savedPeopleGroups.length,
      );
      await AsyncStorage.setItem(
        MY_PEOPLE_STORAGE_KEY,
        JSON.stringify(savedPeopleGroups),
      );
      console.log('[MyPeopleScreen] Groups saved successfully');
      if (refreshMyPeople) refreshMyPeople();
    } catch (error) {
      console.error('Error saving groups:', error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: darkModeEnabled ? '#0B1220' : '#F2F4F7' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: effectiveTextColor }]}>
          Δικοί μου άνθρωποι
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: '#1E6AC7', opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => {
            console.log('[MyPeopleScreen] Add Group button pressed (Pressable)');
            setEditGroupId(null);
            setGroupName('');
            setMembers([]);
            setAssocQuery('');
            setSelectedPersonContact(null);
            setShowModal(true);
          }}
        >
          <Text style={styles.addButtonText}>+ Προσθήκη Ομάδας</Text>
        </Pressable>

        {savedPeopleGroups.length === 0 && (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: darkModeEnabled ? '#1A2332' : '#F9FAFB' },
            ]}
          >
            <Ionicons
              name="people-outline"
              size={48}
              color={darkModeEnabled ? '#4B5563' : '#9CA3AF'}
            />
            <Text
              style={[
                styles.emptyText,
                { color: darkModeEnabled ? '#9CA3AF' : '#6B7280' },
              ]}
            >
              Δεν υπάρχουν αποθηκευμένοι άνθρωποι
            </Text>
            <Text
              style={[
                styles.emptySubtext,
                { color: darkModeEnabled ? '#6B7280' : '#9CA3AF' },
              ]}
            >
              Πατήστε το κουμπί παραπάνω για να προσθέσετε
            </Text>
          </View>
        )}

        {savedPeopleGroups.map(s => (
          <View
            key={s.id}
            style={[
              styles.groupCard,
              {
                backgroundColor: darkModeEnabled ? '#1A2332' : '#FFFFFF',
                borderColor: darkModeEnabled ? '#374151' : '#E5E7EB',
              },
            ]}
          >
            <View style={styles.groupHeader}>
              <View style={styles.groupHeaderLeft}>
                <Ionicons
                  name="heart"
                  size={24}
                  color={darkModeEnabled ? '#F87171' : '#E11D48'}
                  style={styles.groupIcon}
                />
                <View>
                  <Text style={[styles.cardTitle, { color: effectiveTextColor }]}>
                    {s.name}
                  </Text>
                  {s.assocName && (
                    <Text
                      style={[
                        styles.assocText,
                        { color: darkModeEnabled ? '#9CA3AF' : '#6B7280' },
                      ]}
                    >
                      📞 {s.assocName}
                      {s.contactPhoneNumber && (
                        <Text style={{ fontSize: 12 }}>
                          {' • '}
                          {s.contactPhoneNumber}
                        </Text>
                      )}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.groupActions}>
                <TouchableOpacity
                  onPress={() => {
                    setEditGroupId(s.id);
                    setGroupName(s.name || '');
                    setMembers(s.members || []);
                    setAssocQuery(s.assocName || '');
                    setSelectedPersonContact(null);
                    setShowModal(true);
                  }}
                  style={styles.iconBtn}
                >
                  <Ionicons name="pencil" size={18} color="#1E6AC7" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert('Διαγραφή', 'Θέλετε να διαγράψετε την ομάδα;', [
                      { text: 'Ακύρωση', style: 'cancel' },
                      {
                        text: 'Διαγραφή',
                        style: 'destructive',
                        onPress: () =>
                          setSavedPeopleGroups(prev =>
                            prev.filter(x => x.id !== s.id),
                          ),
                      },
                    ]);
                  }}
                  style={styles.iconBtn}
                >
                  <Ionicons name="trash" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.membersContainer}>
              <Text
                style={[
                  styles.membersLabel,
                  { color: darkModeEnabled ? '#9CA3AF' : '#6B7280' },
                ]}
              >
                Μέλη ({s.members.length})
              </Text>
              {s.members.map((m: any) => (
                <View
                  key={m.id}
                  style={[
                    styles.memberRowMain,
                    { backgroundColor: darkModeEnabled ? '#0B1220' : '#F9FAFB' },
                  ]}
                >
                  <View style={styles.memberInfo}>
                    <Ionicons
                      name="person-circle-outline"
                      size={20}
                      color={darkModeEnabled ? '#60A5FA' : '#3B82F6'}
                    />
                    <View style={styles.memberTextContainer}>
                      <Text
                        style={[styles.memberName, { color: effectiveTextColor }]}
                      >
                        {m.name}
                      </Text>
                      <Text
                        style={[
                          styles.memberRelation,
                          { color: darkModeEnabled ? '#9CA3AF' : '#6b7280' },
                        ]}
                      >
                        {m.relation}
                        {m.birthday && ` • ${m.birthday}`}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: darkModeEnabled ? '#0B1220' : '#F2F4F7' }}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={[styles.modalContent, { paddingBottom: 80 }]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              <Text style={[styles.modalTitle, { color: effectiveTextColor }]}>
                {editGroupId ? 'Επεξεργασία Ομάδας' : 'Προσθήκη Ομάδας'}
              </Text>

              <Text style={[styles.label, { color: effectiveTextColor }]}>
                Όνομα ομάδας
              </Text>
              <TextInput
                value={groupName}
                onChangeText={setGroupName}
                placeholder="π.χ. Οικογένεια"
                style={[
                  styles.input,
                  {
                    backgroundColor: darkModeEnabled ? '#1A2332' : '#fff',
                    color: effectiveTextColor,
                  },
                ]}
              />

              <Text style={[styles.label, styles.mt10, { color: effectiveTextColor }]}>
                Συσχέτιση επαφής
              </Text>
              <TextInput
                value={assocQuery}
                onChangeText={text => {
                  setAssocQuery(text);
                  if (!text || text.trim().length < 2) return setAssocSuggestions([]);
                  const res = searchContactsByGreeklish ? searchContactsByGreeklish(text) : [];
                  setAssocSuggestions(res.slice(0, 6));
                }}
                placeholder="Γράψε όνομα για προτάσεις"
                style={[
                  styles.input,
                  {
                    backgroundColor: darkModeEnabled ? '#1A2332' : '#fff',
                    color: effectiveTextColor,
                  },
                ]}
              />
              {assocSuggestions.map(s => (
                <TouchableOpacity
                  key={s.recordID}
                  onPress={() => {
                    setAssocQuery(s.displayName);
                    setSelectedPersonContact(s);
                    setAssocSuggestions([]);
                  }}
                  style={styles.suggestionItem}
                >
                  <Text style={{ color: effectiveTextColor }}>
                    {s.displayName}
                    {s.phoneNumbers && s.phoneNumbers.length > 0 && (
                      <Text style={{ color: darkModeEnabled ? '#9CA3AF' : '#6B7280' }}>
                        {' • '}
                        {s.phoneNumbers[0].number}
                      </Text>
                    )}
                  </Text>
                </TouchableOpacity>
              ))}
              {selectedPersonContact && (
                <View
                  style={[
                    styles.selectedContactBox,
                    { backgroundColor: darkModeEnabled ? '#1A2332' : '#E8F5E9' },
                  ]}
                >
                  <Text style={[styles.selectedContactText, { color: effectiveTextColor }]}>
                    ✓ Επιλέχθηκε: {selectedPersonContact.displayName}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedPersonContact(null);
                      setAssocQuery('');
                    }}
                  >
                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              )}

              <Text style={[styles.label, styles.mt12, { color: effectiveTextColor }]}>
                Όνομα μέλους
              </Text>
              <TextInput
                value={memberName}
                onChangeText={setMemberName}
                placeholder="π.χ. Γιάννης"
                style={[
                  styles.input,
                  {
                    backgroundColor: darkModeEnabled ? '#1A2332' : '#fff',
                    color: effectiveTextColor,
                  },
                ]}
              />

              <Text style={[styles.label, styles.mt12, { color: effectiveTextColor }]}>
                Σχέση
              </Text>
              <View style={styles.relationRow}>
                {['Μητέρα', 'Πατέρας', 'Γιος', 'Κόρη', 'Παππούς', 'Γιαγιά'].map(r => (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setMemberRelation(r)}
                    style={[styles.relationBtn, memberRelation === r && styles.relationBtnActive]}
                  >
                    <Text
                      style={
                        memberRelation === r ? styles.relationTextActive : styles.relationText
                      }
                    >
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, styles.mt12, { color: effectiveTextColor }]}>
                Ημ/νία (dd/mm/yyyy)
              </Text>
              <TextInput
                value={memberBirthday}
                onChangeText={setMemberBirthday}
                placeholder="dd/mm/yyyy"
                style={[
                  styles.input,
                  {
                    backgroundColor: darkModeEnabled ? '#1A2332' : '#fff',
                    color: effectiveTextColor,
                  },
                ]}
              />

              <Pressable
                style={({ pressed }) => [
                  styles.addMemberBtn,
                  { backgroundColor: '#1E6AC7', opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => {
                  if (!memberName.trim()) {
                    Alert.alert('Σφάλμα', 'Συμπλήρωσε όνομα μέλους');
                    return;
                  }
                  const id = `${memberName}-${Date.now()}`;
                  const newMember = {
                    id,
                    name: memberName.trim(),
                    relation: memberRelation,
                    birthday: memberBirthday || null,
                  };
                  setMembers(prev => [...prev, newMember]);
                  setMemberName('');
                  setMemberBirthday('');
                  setMemberRelation('Γιος');
                }}
              >
                <Text style={styles.addMemberText}>Προσθήκη Μέλους</Text>
              </Pressable>

              {members.length > 0 && (
                <View style={[styles.fullWidth, styles.mt12]}>
                  <Text style={[styles.label, styles.mb8, { color: effectiveTextColor }]}>
                    Μέλη στην ομάδα
                  </Text>
                  {members.map(m => (
                    <View
                      key={m.id}
                      style={[
                        styles.memberBox,
                        { backgroundColor: darkModeEnabled ? '#1A2332' : '#F9FAFB' },
                      ]}
                    >
                      <View style={styles.memberBoxContent}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.memberName, { color: effectiveTextColor }]}>
                            {m.name}
                          </Text>
                          <Text
                            style={[
                              styles.memberRelation,
                              { color: darkModeEnabled ? '#9CA3AF' : '#6b7280' },
                            ]}
                          >
                            {m.relation}
                            {m.birthday ? ` — ${m.birthday}` : ''}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => setMembers(prev => prev.filter(x => x.id !== m.id))}
                          style={styles.deleteBtn}
                        >
                          <Ionicons name="trash" size={18} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              <Pressable
                style={({ pressed }) => [
                  styles.saveButton,
                  styles.mt16,
                  { backgroundColor: '#1E6AC7', opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => {
                  if (!groupName.trim()) {
                    Alert.alert('Σφάλμα', 'Συμπλήρωσε όνομα ομάδας');
                    return;
                  }
                  if (members.length === 0) {
                    Alert.alert('Σφάλμα', 'Πρόσθεσε τουλάχιστον ένα μέλος');
                    return;
                  }
                  if (editGroupId) {
                    setSavedPeopleGroups(prev =>
                      prev.map(p =>
                        p.id === editGroupId
                          ? {
                              ...p,
                              name: groupName.trim(),
                              members,
                              assocName: selectedPersonContact?.displayName || assocQuery,
                              contactPhoneNumber:
                                selectedPersonContact?.phoneNumbers?.[0]?.number || null,
                            }
                          : p,
                      ),
                    );
                    setEditGroupId(null);
                  } else {
                    const personGroup = {
                      id: `${groupName}-${Date.now()}`,
                      name: groupName.trim(),
                      members,
                      assocName: selectedPersonContact?.displayName || assocQuery,
                      contactPhoneNumber: selectedPersonContact?.phoneNumbers?.[0]?.number || null,
                    };
                    setSavedPeopleGroups(prev => [personGroup, ...prev]);
                  }
                  setMembers([]);
                  setGroupName('');
                  setAssocQuery('');
                  setSelectedPersonContact(null);
                  setShowModal(false);
                }}
              >
                <Text style={styles.saveText}>
                  {editGroupId ? 'Ενημέρωση Ομάδας' : 'Αποθήκευση Ομάδας'}
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.closeButton,
                  { backgroundColor: darkModeEnabled ? '#991B1B' : '#EF4444', opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.closeButtonText}>Κλείσιμο</Text>
              </Pressable>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#1E6AC7',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyCard: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  groupCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  groupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  groupIcon: {
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  assocText: {
    fontSize: 13,
    marginTop: 2,
  },
  membersContainer: {
    marginTop: 4,
  },
  membersLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  memberRowMain: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 6,
    borderRadius: 8,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
  },
  memberRelation: {
    fontSize: 13,
    marginTop: 2,
  },
  memberContactInfo: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  selectedContactBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    marginTop: 8,
    borderRadius: 8,
  },
  selectedContactText: {
    fontSize: 13,
    fontWeight: '500',
  },
  groupActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 6,
  },
  item: {
    fontSize: 16,
    paddingVertical: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  mt10: { marginTop: 10 },
  mt12: { marginTop: 12 },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 12,
    marginTop: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#000',
    fontSize: 16,
  },
  suggestionItem: {
    width: '100%',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  relationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // gap is not supported on Android older RN; use margin on items instead
    marginTop: 8,
  },
  relationBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginRight: 8,
    marginBottom: 8,
  },
  relationBtnActive: {
    backgroundColor: '#1E6AC7',
    borderColor: '#1E6AC7',
  },
  relationText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  relationTextActive: { color: '#fff', fontWeight: '600' },
  addMemberBtn: {
    padding: 14,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  addMemberText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  modalContent: {
    padding: 20,
    alignItems: 'stretch',
  },
  memberBox: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  memberBoxContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteBtn: {
    padding: 8,
    marginLeft: 12,
  },
  fullWidth: { width: '100%' },
  mb8: { marginBottom: 8 },
  mt16: { marginTop: 16 },
  saveButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
  closeButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Appbar,
  Card,
  Text,
  Button,
  TextInput,
  Modal,
  Portal,
  Chip,
  Switch,
  Divider,
} from 'react-native-paper';
import { useApp } from '../context/AppContext';

const EditPensumScreen = ({ navigation }) => {
  const { 
    subjects, 
    saveSubjects, 
    updateSubject, 
    toggleSubjectCompletion, 
    resetToDefault, 
    clearAllSubjects 
  } = useApp(); 
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    credits: '',
    semester: '',
    prerequisites: '',
  });

  useEffect(() => {
    filterSubjects();
  }, [subjects, searchQuery, selectedSemester]);

  const filterSubjects = () => {
    let filtered = subjects;

    if (searchQuery) {
      filtered = filtered.filter(subject =>
        subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedSemester !== 'all') {
      filtered = filtered.filter(subject => subject.semester === parseInt(selectedSemester));
    }

    setFilteredSubjects(filtered);
  };

  const handleResetToDefault = () => {
    Alert.alert(
      'Restablecer Pensum',
      '¿Estás seguro de que quieres restablecer todas las materias a los valores por defecto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer',
          style: 'destructive',
          onPress: async () => {
            await resetToDefault();
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Eliminar Todas las Materias',
      '¿Estás seguro de que quieres eliminar todas las materias?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await clearAllSubjects();
          },
        },
      ]
    );
  };

  const openEditModal = (subject = null) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        code: subject.code,
        name: subject.name,
        credits: subject.credits.toString(),
        semester: subject.semester.toString(),
        prerequisites: subject.prerequisites.join(', '),
      });
    } else {
      setEditingSubject(null);
      setFormData({
        code: '',
        name: '',
        credits: '',
        semester: '',
        prerequisites: '',
      });
    }
    setModalVisible(true);
  };

  const handleSaveSubject = async () => {
    const newSubject = {
      id: editingSubject ? editingSubject.id : Date.now().toString(),
      code: formData.code.trim(),
      name: formData.name.trim(),
      credits: parseInt(formData.credits) || 0,
      semester: parseInt(formData.semester) || 1,
      prerequisites: formData.prerequisites.split(',').map(p => p.trim()).filter(p => p),
      completed: editingSubject ? editingSubject.completed : false,
    };

    if (editingSubject) {
      await updateSubject(editingSubject.id, newSubject);
    } else {
      const newSubjects = [...subjects, newSubject];
      await saveSubjects(newSubjects);
    }
    
    setModalVisible(false);
  };

  const handleDeleteSubject = (subject) => {
    Alert.alert(
      'Eliminar Materia',
      `¿Estás seguro de que quieres eliminar ${subject.code} - ${subject.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const newSubjects = subjects.filter(s => s.id !== subject.id);
            await saveSubjects(newSubjects);
          },
        },
      ]
    );
  };

  const handleToggleCompletion = async (subject) => {
    await toggleSubjectCompletion(subject.id);
  };

  const renderSubjectCard = (subject) => (
    <Card key={subject.id} style={styles.subjectCard}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.subjectInfo}>
            <Text variant="titleSmall" style={styles.subjectCode}>
              {subject.code}
            </Text>
            <Switch
              value={subject.completed}
              onValueChange={() => handleToggleCompletion(subject)}
              style={styles.completionSwitch}
            />
          </View>
          <Text variant="bodyMedium" style={styles.credits}>
            {subject.credits} créditos
          </Text>
        </View>

        <Text variant="bodyMedium" style={styles.subjectName}>
          {subject.name}
        </Text>

        <View style={styles.cardFooter}>
          <Chip mode="outlined" compact={true}>
            Cuatrimestre {subject.semester}
          </Chip>

          {subject.prerequisites.length > 0 && (
            <Chip mode="flat" compact={true} style={styles.prereqChip}>
              Prerreq: {subject.prerequisites.join(', ')}
            </Chip>
          )}
        </View>

        <View style={styles.cardActions}>
          <Button
            mode="outlined"
            compact={true}
            onPress={() => openEditModal(subject)}
          >
            Editar
          </Button>
          <Button
            mode="outlined"
            compact={true}
            textColor="red"
            onPress={() => handleDeleteSubject(subject)}
          >
            Eliminar
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Editar Pensum" />
      </Appbar.Header>

      <View style={styles.controls}>
        <TextInput
          placeholder="Buscar materia..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          mode="outlined"
          left={<TextInput.Icon icon="magnify" />}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.semesterFilter}>
          <Chip
            selected={selectedSemester === 'all'}
            onPress={() => setSelectedSemester('all')}
            style={styles.filterChip}
          >
            Todos
          </Chip>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(sem => (
            <Chip
              key={sem}
              selected={selectedSemester === sem.toString()}
              onPress={() => setSelectedSemester(sem.toString())}
              style={styles.filterChip}
            >
              {sem}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <View style={styles.actionButtons}>
        <Button
          mode="contained"
          icon="plus"
          onPress={() => openEditModal()}
          style={styles.actionButton}
        >
          Agregar Materia
        </Button>
        <Button
          mode="outlined"
          icon="restore"
          onPress={handleResetToDefault}
          style={styles.actionButton}
        >
          Restablecer
        </Button>
        <Button
          mode="outlined"
          icon="delete"
          textColor="red"
          onPress={handleClearAll}
          style={styles.actionButton}
        >
          Eliminar Todas
        </Button>
      </View>

      <Divider style={styles.divider} />

      <ScrollView style={styles.subjectsList}>
        {filteredSubjects.map(renderSubjectCard)}
        
        {filteredSubjects.length === 0 && (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text variant="bodyLarge" style={styles.emptyText}>
                No se encontraron materias
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            {editingSubject ? 'Editar Materia' : 'Agregar Materia'}
          </Text>

          <TextInput
            label="Código"
            value={formData.code}
            onChangeText={(text) => setFormData({ ...formData, code: text })}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Nombre"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            style={styles.input}
            mode="outlined"
            multiline
          />

          <TextInput
            label="Créditos"
            value={formData.credits}
            onChangeText={(text) => setFormData({ ...formData, credits: text })}
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
          />

          <TextInput
            label="Cuatrimestre"
            value={formData.semester}
            onChangeText={(text) => setFormData({ ...formData, semester: text })}
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
          />

          <TextInput
            label="Prerrequisitos (separar por comas)"
            value={formData.prerequisites}
            onChangeText={(text) => setFormData({ ...formData, prerequisites: text })}
            style={styles.input}
            mode="outlined"
          />

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setModalVisible(false)}
              style={styles.modalButton}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleSaveSubject}
              style={styles.modalButton}
            >
              Guardar
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  controls: {
    padding: 16,
    backgroundColor: 'white',
  },
  searchInput: {
    marginBottom: 12,
  },
  semesterFilter: {
    marginBottom: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  divider: {
    marginVertical: 8,
  },
  subjectsList: {
    flex: 1,
    padding: 8,
  },
  subjectCard: {
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subjectCode: {
    fontWeight: 'bold',
    flex: 1,
  },
  completionSwitch: {
    marginLeft: 8,
  },
  credits: {
    fontWeight: 'bold',
    color: '#666',
  },
  subjectName: {
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  prereqChip: {
    backgroundColor: '#e3f2fd',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
  modal: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 8,
  },
  modalButton: {
    minWidth: 100,
  },
});

export default EditPensumScreen;
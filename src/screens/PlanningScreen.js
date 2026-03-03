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
  Checkbox,
  Chip,
  Divider,
  List,
  TextInput,
  Modal,
  Portal,
  MD3Colors,
} from 'react-native-paper';
import { useApp } from '../context/AppContext';

const PlanningScreen = ({ navigation, route }) => {
  const { subjects, getSubjectsBySemester, savePlan, savedPlans } = useApp();
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [planName, setPlanName] = useState('');
  const [saveModalVisible, setSaveModalVisible] = useState(false);

  // Cargar materias disponibles al iniciar
  useEffect(() => {
    loadAvailableSubjects();
  }, [subjects, semesterFilter, searchQuery]);

  // Calcular créditos totales cuando cambian las materias seleccionadas
  useEffect(() => {
    const credits = selectedSubjects.reduce((sum, subject) => sum + subject.credits, 0);
    setTotalCredits(credits);
  }, [selectedSubjects]);

  // Generar nombre de plan por defecto
  useEffect(() => {
    if (!planName) {
      const date = new Date();
      const defaultName = `Plan ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      setPlanName(defaultName);
    }
  }, []);

  const loadAvailableSubjects = () => {
    let available = subjects.filter(subject => {
      // Filtrar por cuatrimestre
      if (semesterFilter !== 'all' && subject.semester !== parseInt(semesterFilter)) {
        return false;
      }

      // Filtrar por búsqueda
      if (searchQuery && 
          !subject.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !subject.code.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Verificar prerrequisitos
      const hasPrerequisites = subject.prerequisites.length > 0;
      const prerequisitesCompleted = hasPrerequisites 
        ? subject.prerequisites.every(prereqCode => {
            const prereqSubject = subjects.find(s => s.code === prereqCode);
            return prereqSubject && prereqSubject.completed;
          })
        : true;

      return prerequisitesCompleted && !subject.completed;
    });

    setAvailableSubjects(available);
  };

  const toggleSubjectSelection = (subject) => {
    setSelectedSubjects(prev => {
      const isSelected = prev.find(s => s.id === subject.id);
      if (isSelected) {
        return prev.filter(s => s.id !== subject.id);
      } else {
        return [...prev, subject];
      }
    });
  };

  const isSubjectSelected = (subjectId) => {
    return selectedSubjects.some(s => s.id === subjectId);
  };

  const clearSelection = () => {
    setSelectedSubjects([]);
  };

  const handleSavePlan = async () => {
    if (selectedSubjects.length === 0) {
      Alert.alert('Error', 'Selecciona al menos una materia para guardar la planificación.');
      return;
    }

    if (!planName.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para el plan.');
      return;
    }

    const planData = {
      name: planName.trim(),
      subjects: selectedSubjects,
      totalCredits: totalCredits,
      subjectCount: selectedSubjects.length,
    };

    const result = await savePlan(planData);
    
    if (result.success) {
      Alert.alert(
        '✅ Plan Guardado',
        `"${planData.name}" se ha guardado exitosamente.\n\n${selectedSubjects.length} materias - ${totalCredits} créditos`,
        [
          { 
            text: 'Continuar Planificando', 
            style: 'cancel' 
          },
          { 
            text: 'Ver Planes Guardados', 
            onPress: () => navigation.navigate('SavedPlans')
          }
        ]
      );
      setSaveModalVisible(false);
      // Opcional: limpiar selección después de guardar
      // clearSelection();
    } else {
      Alert.alert('Error', result.error || 'No se pudo guardar el plan.');
    }
  };

  const getRecommendedSubjects = () => {
    // Encontrar el próximo cuatrimestre basado en materias completadas
    const completedSemesters = [...new Set(subjects.filter(s => s.completed).map(s => s.semester))];
    const nextSemester = completedSemesters.length > 0 ? Math.max(...completedSemesters) + 1 : 1;
    
    return availableSubjects.filter(subject => subject.semester === nextSemester);
  };

  const loadRecommended = () => {
    const recommended = getRecommendedSubjects();
    setSelectedSubjects(recommended);
  };

  const openSaveModal = () => {
    if (selectedSubjects.length === 0) {
      Alert.alert('Error', 'Selecciona al menos una materia para guardar.');
      return;
    }
    setSaveModalVisible(true);
  };

  const renderSubjectItem = (subject) => (
    <List.Item
      key={subject.id}
      title={subject.name}
      description={`${subject.code} - ${subject.credits} créditos - Cuatrimestre ${subject.semester}`}
      left={props => (
        <Checkbox
          status={isSubjectSelected(subject.id) ? 'checked' : 'unchecked'}
          onPress={() => toggleSubjectSelection(subject)}
        />
      )}
      right={props => (
        <View style={styles.subjectBadges}>
          <Chip mode="outlined" compact style={styles.creditChip}>
            {subject.credits} cr
          </Chip>
          <Chip mode="flat" compact style={styles.semesterChip}>
            C{subject.semester}
          </Chip>
        </View>
      )}
      style={[
        styles.listItem,
        isSubjectSelected(subject.id) && styles.selectedListItem
      ]}
    />
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Planificación" />
        <Appbar.Action 
          icon="folder" 
          onPress={() => navigation.navigate('SavedPlans')} 
        />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        {/* Resumen de la Planificación */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.summary}>
              <View style={styles.summaryItem}>
                <Text variant="titleLarge" style={styles.summaryNumber}>
                  {selectedSubjects.length}
                </Text>
                <Text variant="bodyMedium">Materias</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text variant="titleLarge" style={styles.summaryNumber}>
                  {totalCredits}
                </Text>
                <Text variant="bodyMedium">Créditos</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text variant="titleLarge" style={styles.summaryNumber}>
                  {savedPlans.length}
                </Text>
                <Text variant="bodyMedium">Planes</Text>
              </View>
            </View>

            <View style={styles.planActions}>
              <Button 
                mode="outlined" 
                onPress={clearSelection}
                disabled={selectedSubjects.length === 0}
                style={styles.planButton}
                icon="delete-sweep"
              >
                Limpiar
              </Button>
              <Button 
                mode="contained" 
                onPress={openSaveModal}
                disabled={selectedSubjects.length === 0}
                style={styles.planButton}
                icon="content-save"
              >
                Guardar Plan
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Controles de Filtro */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Filtros
            </Text>
            
            <TextInput
              placeholder="Buscar materias..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              mode="outlined"
              left={<TextInput.Icon icon="magnify" />}
              style={styles.searchInput}
            />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <Chip
                selected={semesterFilter === 'all'}
                onPress={() => setSemesterFilter('all')}
                style={styles.filterChip}
              >
                Todos
              </Chip>
              <Chip
                selected={semesterFilter === 'recommended'}
                onPress={() => setSemesterFilter('recommended')}
                style={styles.filterChip}
                icon="lightbulb"
              >
                Recomendadas
              </Chip>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(sem => (
                <Chip
                  key={sem}
                  selected={semesterFilter === sem.toString()}
                  onPress={() => setSemesterFilter(sem.toString())}
                  style={styles.filterChip}
                >
                  C{sem}
                </Chip>
              ))}
            </ScrollView>

            <Button 
              mode="outlined" 
              icon="lightbulb"
              onPress={loadRecommended}
              style={styles.recommendButton}
            >
              Cargar Recomendadas
            </Button>
          </Card.Content>
        </Card>

        {/* Lista de Materias Disponibles */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Materias Disponibles
              </Text>
              <Chip mode="outlined">
                {availableSubjects.length} disponibles
              </Chip>
            </View>

            {availableSubjects.length === 0 ? (
              <Text variant="bodyMedium" style={styles.emptyText}>
                No hay materias disponibles con los filtros actuales.
              </Text>
            ) : (
              availableSubjects.map(renderSubjectItem)
            )}
          </Card.Content>
        </Card>

        {/* Materias Seleccionadas */}
        {selectedSubjects.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Materias Seleccionadas ({selectedSubjects.length})
              </Text>
              
              {selectedSubjects.map(subject => (
                <List.Item
                  key={subject.id}
                  title={subject.name}
                  description={`${subject.code} - ${subject.credits} créditos`}
                  left={props => <List.Icon {...props} icon="check" color={MD3Colors.primary70} />}
                  right={props => (
                    <Button
                      mode="text"
                      compact
                      onPress={() => toggleSubjectSelection(subject)}
                      textColor="red"
                    >
                      Quitar
                    </Button>
                  )}
                  style={styles.selectedItem}
                />
              ))}

              <Divider style={styles.divider} />
              
              <View style={styles.totalSection}>
                <Text variant="titleLarge">Total de Créditos:</Text>
                <Text variant="titleLarge" style={styles.totalCredits}>
                  {totalCredits}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Modal para Guardar Plan */}
      <Portal>
        <Modal
          visible={saveModalVisible}
          onDismiss={() => setSaveModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            Guardar Planificación
          </Text>

          <TextInput
            label="Nombre del plan"
            value={planName}
            onChangeText={setPlanName}
            mode="outlined"
            style={styles.modalInput}
            placeholder="Ej: Plan Cuatrimestre 5"
          />

          <View style={styles.modalSummary}>
            <Text variant="bodyMedium">
              <Text style={styles.bold}>{selectedSubjects.length} materias</Text> seleccionadas
            </Text>
            <Text variant="bodyMedium">
              Total: <Text style={styles.bold}>{totalCredits} créditos</Text>
            </Text>
          </View>

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setSaveModalVisible(false)}
              style={styles.modalButton}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleSavePlan}
              style={styles.modalButton}
              disabled={!planName.trim()}
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
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontWeight: 'bold',
    color: MD3Colors.primary40,
  },
  planActions: {
    flexDirection: 'row',
    gap: 8,
  },
  planButton: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  searchInput: {
    marginBottom: 12,
  },
  filterScroll: {
    marginBottom: 12,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  recommendButton: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listItem: {
    paddingLeft: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedListItem: {
    backgroundColor: '#e3f2fd',
  },
  subjectBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  creditChip: {
    backgroundColor: '#e8f5e8',
  },
  semesterChip: {
    backgroundColor: '#fff3e0',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  selectedItem: {
    paddingLeft: 0,
    backgroundColor: '#f8fdff',
    marginBottom: 4,
    borderRadius: 4,
  },
  divider: {
    marginVertical: 16,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalCredits: {
    fontWeight: 'bold',
    color: MD3Colors.primary70,
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
  modalInput: {
    marginBottom: 16,
  },
  modalSummary: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 4,
    marginBottom: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  modalButton: {
    minWidth: 100,
  },
});

export default PlanningScreen;
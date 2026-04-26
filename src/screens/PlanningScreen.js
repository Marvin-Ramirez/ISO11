import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Appbar, Card, Text, Button, TextInput,
  Divider, List, Chip, Checkbox, MD3Colors,
  Modal, Portal,
} from 'react-native-paper';
import { useApp } from '../context/AppContext';
import { useAppTheme } from '../context/ThemeContext';

const PlanningScreen = ({ navigation, route }) => {
  const { subjects, savedPlans, savePlan } = useApp();
  const { colors } = useAppTheme();

  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [planName, setPlanName] = useState('');

  const totalCredits = selectedSubjects.reduce((sum, s) => sum + s.credits, 0);

  useEffect(() => {
    if (route.params?.recommendedSubjects) {
      setSelectedSubjects(route.params.recommendedSubjects);
    }
  }, [route.params]);

  useEffect(() => {
    filterSubjects();
  }, [subjects, searchQuery, semesterFilter]);

  const filterSubjects = () => {
    let filtered = subjects.filter(s => !s.completed);

    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (semesterFilter === 'recommended') {
      filtered = filtered.filter(s =>
        s.prerequisites.every(code => {
          const pre = subjects.find(x => x.code === code);
          return pre && pre.completed;
        })
      );
    } else if (semesterFilter !== 'all') {
      filtered = filtered.filter(s => s.semester === parseInt(semesterFilter));
    }

    setAvailableSubjects(filtered);
  };

  const toggleSubjectSelection = (subject) => {
    setSelectedSubjects(prev => {
      const isSelected = prev.find(s => s.id === subject.id);
      return isSelected ? prev.filter(s => s.id !== subject.id) : [...prev, subject];
    });
  };

  const isSubjectSelected = (subjectId) => selectedSubjects.some(s => s.id === subjectId);

  const clearSelection = () => setSelectedSubjects([]);

  const handleSavePlan = async () => {
    if (selectedSubjects.length === 0) {
      Alert.alert('Error', 'Selecciona al menos una materia.');
      return;
    }
    if (!planName.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para el plan.');
      return;
    }
    const result = await savePlan({
      name: planName.trim(),
      subjects: selectedSubjects,
      totalCredits,
      subjectCount: selectedSubjects.length,
    });
    if (result.success) {
      Alert.alert(
        '✅ Plan Guardado',
        `"${planName.trim()}" guardado.\n\n${selectedSubjects.length} materias - ${totalCredits} créditos`,
        [
          { text: 'Continuar Planificando', style: 'cancel' },
          { text: 'Ver Planes Guardados', onPress: () => navigation.navigate('SavedPlans') },
        ]
      );
      setSaveModalVisible(false);
    } else {
      Alert.alert('Error', result.error || 'No se pudo guardar el plan.');
    }
  };

  const getRecommendedSubjects = () => {
    const completedSemesters = [...new Set(subjects.filter(s => s.completed).map(s => s.semester))];
    const nextSemester = completedSemesters.length > 0 ? Math.max(...completedSemesters) + 1 : 1;
    return availableSubjects.filter(s => s.semester === nextSemester);
  };

  const loadRecommended = () => setSelectedSubjects(getRecommendedSubjects());

  const openSaveModal = () => {
    if (selectedSubjects.length === 0) { Alert.alert('Error', 'Selecciona al menos una materia.'); return; }
    setSaveModalVisible(true);
  };

  const styles = makeStyles(colors);

  const renderSubjectItem = (subject) => (
    <List.Item
      key={subject.id}
      title={subject.name}
      titleStyle={styles.itemTitle}
      description={`${subject.code} - ${subject.credits} créditos - Cuatrimestre ${subject.semester}`}
      descriptionStyle={styles.itemDesc}
      left={() => (
        <Checkbox
          status={isSubjectSelected(subject.id) ? 'checked' : 'unchecked'}
          onPress={() => toggleSubjectSelection(subject)}
        />
      )}
      right={() => (
        <View style={styles.subjectBadges}>
          <Chip mode="outlined" compact style={styles.creditChip}>{subject.credits} cr</Chip>
          <Chip mode="flat" compact style={styles.semesterChip}>C{subject.semester}</Chip>
        </View>
      )}
      style={[styles.listItem, isSubjectSelected(subject.id) && styles.selectedListItem]}
    />
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Planificación" />
        <Appbar.Action icon="folder" onPress={() => navigation.navigate('SavedPlans')} />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        {/* Resumen */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.summary}>
              {[
                { value: selectedSubjects.length, label: 'Materias' },
                { value: totalCredits, label: 'Créditos' },
                { value: savedPlans.length, label: 'Planes' },
              ].map((item, i) => (
                <View key={i} style={styles.summaryItem}>
                  <Text variant="titleLarge" style={styles.summaryNumber}>{item.value}</Text>
                  <Text variant="bodyMedium" style={styles.bodyText}>{item.label}</Text>
                </View>
              ))}
            </View>
            <View style={styles.planActions}>
              <Button
                mode="outlined" icon="delete-sweep"
                onPress={clearSelection}
                disabled={selectedSubjects.length === 0}
                style={styles.planButton}
              >
                Limpiar
              </Button>
              <Button
                mode="contained" icon="content-save"
                onPress={openSaveModal}
                disabled={selectedSubjects.length === 0}
                style={styles.planButton}
              >
                Guardar Plan
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Filtros */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Filtros</Text>
            <TextInput
              placeholder="Buscar materias..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              mode="outlined"
              left={<TextInput.Icon icon="magnify" />}
              style={styles.searchInput}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {[
                { key: 'all', label: 'Todos' },
                { key: 'recommended', label: 'Recomendadas', icon: 'lightbulb' },
                ...[1,2,3,4,5,6,7,8,9,10,11,12].map(n => ({ key: String(n), label: `C${n}` })),
              ].map(item => (
                <Chip
                  key={item.key}
                  selected={semesterFilter === item.key}
                  onPress={() => setSemesterFilter(item.key)}
                  style={styles.filterChip}
                  icon={item.icon}
                  showSelectedOverlay
                >
                  {item.label}
                </Chip>
              ))}
            </ScrollView>
            <Button mode="outlined" icon="lightbulb" onPress={loadRecommended} style={styles.recommendButton}>
              Cargar Recomendadas
            </Button>
          </Card.Content>
        </Card>

        {/* Materias disponibles */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Materias Disponibles</Text>
              <Chip mode="outlined">{availableSubjects.length} disponibles</Chip>
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

        {/* Seleccionadas */}
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
                  titleStyle={styles.itemTitle}
                  description={`${subject.code} - ${subject.credits} créditos`}
                  descriptionStyle={styles.itemDesc}
                  left={props => <List.Icon {...props} icon="check" color={MD3Colors.primary70} />}
                  right={() => (
                    <Button mode="text" compact onPress={() => toggleSubjectSelection(subject)} textColor={MD3Colors.error50}>
                      Quitar
                    </Button>
                  )}
                  style={styles.selectedItem}
                />
              ))}
              <Divider style={styles.divider} />
              <View style={styles.totalSection}>
                <Text variant="titleLarge" style={styles.bodyText}>Total de Créditos:</Text>
                <Text variant="titleLarge" style={styles.totalCredits}>{totalCredits}</Text>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Modal guardar */}
      <Portal>
        <Modal
          visible={saveModalVisible}
          onDismiss={() => setSaveModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>Guardar Planificación</Text>
          <TextInput
            label="Nombre del plan"
            value={planName}
            onChangeText={setPlanName}
            mode="outlined"
            style={styles.modalInput}
            placeholder="Ej: Plan Cuatrimestre 5"
          />
          <View style={styles.modalSummary}>
            <Text variant="bodyMedium" style={styles.bodyText}>
              <Text style={styles.bold}>{selectedSubjects.length} materias</Text> seleccionadas
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              Total: <Text style={styles.bold}>{totalCredits} créditos</Text>
            </Text>
          </View>
          <View style={styles.modalActions}>
            <Button mode="outlined" onPress={() => setSaveModalVisible(false)} style={styles.modalButton}>Cancelar</Button>
            <Button mode="contained" onPress={handleSavePlan} style={styles.modalButton} disabled={!planName.trim()}>Guardar</Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1, padding: 16 },
  card: { marginBottom: 16, backgroundColor: colors.surface },
  summary: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  summaryItem: { alignItems: 'center' },
  summaryNumber: { fontWeight: 'bold', color: MD3Colors.primary40 },
  bodyText: { color: colors.text },
  planActions: { flexDirection: 'row', gap: 8 },
  planButton: { flex: 1 },
  sectionTitle: { marginBottom: 12, fontWeight: 'bold', color: colors.text },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  searchInput: { marginBottom: 12 },
  filterScroll: { marginBottom: 12 },
  filterChip: { marginRight: 8, marginBottom: 4 },
  recommendButton: { marginTop: 8 },
  listItem: { paddingLeft: 0, borderBottomWidth: 1, borderBottomColor: colors.divider },
  selectedListItem: { backgroundColor: colors.selectedItemBg },
  itemTitle: { color: colors.text },
  itemDesc: { color: colors.textSecondary },
  subjectBadges: { flexDirection: 'row', gap: 4 },
  creditChip: { backgroundColor: colors.greenBg },
  semesterChip: { backgroundColor: colors.orangeBg },
  emptyText: { textAlign: 'center', color: colors.textTertiary, fontStyle: 'italic', paddingVertical: 20 },
  selectedItem: { paddingLeft: 0, backgroundColor: colors.selectedItemBg, marginBottom: 4, borderRadius: 4 },
  divider: { marginVertical: 16, backgroundColor: colors.divider },
  totalSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalCredits: { fontWeight: 'bold', color: MD3Colors.primary70 },
  modal: { backgroundColor: colors.surface, margin: 20, padding: 20, borderRadius: 8 },
  modalTitle: { marginBottom: 20, textAlign: 'center', color: colors.text },
  modalInput: { marginBottom: 16 },
  modalSummary: { backgroundColor: colors.subtleBg, padding: 12, borderRadius: 4, marginBottom: 20 },
  bold: { fontWeight: 'bold', color: colors.text },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  modalButton: { minWidth: 100 },
});

export default PlanningScreen;
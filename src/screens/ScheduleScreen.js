import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Appbar,
  Text,
  Button,
  TextInput,
  Divider,
  Chip,
  MD3Colors,
  Modal,
  Portal,
  FAB,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../context/AppContext';

// ─── Constantes ────────────────────────────────────────────────
const DAYS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

const TIME_SLOTS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
  '19:00', '20:00', '21:00',
];

const END_TIMES = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00',
];

const SUBJECT_COLORS = [
  '#1E88E5', // azul
  '#43A047', // verde
  '#E53935', // rojo
  '#8E24AA', // púrpura
  '#FB8C00', // naranja
  '#00ACC1', // cian
  '#D81B60', // rosa
  '#6D4C41', // marrón
  '#3949AB', // índigo
  '#00897B', // verde azulado
  '#F4511E', // naranja oscuro
  '#7CB342', // verde lima
  '#039BE5', // azul claro
  '#757575', // gris
  '#C0CA33', // amarillo verde
];

const SCHEDULES_KEY = '@pensum_schedules';

// ─── Componente ────────────────────────────────────────────────
const ScheduleScreen = ({ navigation }) => {
  const { subjects } = useApp();

  // Estado principal
  const [schedules, setSchedules] = useState([]);
  const [activeScheduleId, setActiveScheduleId] = useState(null);

  // Modales
  const [createScheduleModal, setCreateScheduleModal] = useState(false);
  const [addSubjectModal, setAddSubjectModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);

  // Form – crear horario
  const [newScheduleName, setNewScheduleName] = useState('');

  // Form – agregar/editar materia
  const [editMode, setEditMode] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [subjectName, setSubjectName] = useState('');
  const [subjectSuggestions, setSubjectSuggestions] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [professor, setProfessor] = useState('');
  const [aula, setAula] = useState('');
  const [notes, setNotes] = useState('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // ── Carga inicial ─────────────────────────────────────────────
  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const json = await AsyncStorage.getItem(SCHEDULES_KEY);
      if (json) {
        const loaded = JSON.parse(json);
        setSchedules(loaded);
        if (loaded.length > 0) setActiveScheduleId(loaded[0].id);
      }
    } catch (e) {
      console.error('Error loading schedules:', e);
    }
  };

  const saveSchedules = async (updated) => {
    try {
      await AsyncStorage.setItem(SCHEDULES_KEY, JSON.stringify(updated));
      setSchedules(updated);
    } catch (e) {
      console.error('Error saving schedules:', e);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────
  const activeSchedule = schedules.find(s => s.id === activeScheduleId);

  const getNextColor = (entries = []) => {
    const used = entries.map(e => e.color);
    const unused = SUBJECT_COLORS.find(c => !used.includes(c));
    return unused ?? SUBJECT_COLORS[entries.length % SUBJECT_COLORS.length];
  };

  const getEntryForSlot = (day, slot) => {
    if (!activeSchedule) return null;
    const slotH = parseInt(slot);
    return activeSchedule.entries.find(entry => {
      if (!entry.days.includes(day)) return false;
      const startH = parseInt(entry.startTime);
      const endH = parseInt(entry.endTime);
      return slotH >= startH && slotH < endH;
    }) ?? null;
  };

  const isEntryStart = (entry, slot) =>
    parseInt(entry.startTime) === parseInt(slot);

  // ── Autocomplete ──────────────────────────────────────────────
  const handleSubjectNameChange = (text) => {
    setSubjectName(text);
    if (text.length >= 3) {
      const filtered = subjects
        .filter(s =>
          s.name.toLowerCase().includes(text.toLowerCase()) ||
          s.code.toLowerCase().includes(text.toLowerCase())
        )
        .slice(0, 6);
      setSubjectSuggestions(filtered);
    } else {
      setSubjectSuggestions([]);
    }
  };

  const selectSuggestion = (s) => {
    setSubjectName(s.name);
    setSubjectSuggestions([]);
  };

  const toggleDay = (day) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // ── Crear Horario ─────────────────────────────────────────────
  const createSchedule = async () => {
    if (!newScheduleName.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para el horario.');
      return;
    }
    const newSched = {
      id: Date.now().toString(),
      name: newScheduleName.trim(),
      createdAt: new Date().toISOString(),
      entries: [],
    };
    const updated = [...schedules, newSched];
    await saveSchedules(updated);
    setActiveScheduleId(newSched.id);
    setNewScheduleName('');
    setCreateScheduleModal(false);
  };

  const deleteSchedule = (scheduleId) => {
    Alert.alert(
      'Eliminar Horario',
      '¿Estás seguro de que quieres eliminar este horario y todas sus materias?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const updated = schedules.filter(s => s.id !== scheduleId);
            await saveSchedules(updated);
            if (activeScheduleId === scheduleId) {
              setActiveScheduleId(updated.length > 0 ? updated[0].id : null);
            }
          },
        },
      ]
    );
  };

  // ── Agregar / Editar materia ───────────────────────────────────
  const resetAddForm = () => {
    setSubjectName('');
    setSubjectSuggestions([]);
    setSelectedDays([]);
    setStartTime('');
    setEndTime('');
    setProfessor('');
    setAula('');
    setNotes('');
    setShowStartPicker(false);
    setShowEndPicker(false);
  };

  const openAddSubjectModal = () => {
    resetAddForm();
    setEditMode(false);
    setSelectedEntry(null);
    setAddSubjectModal(true);
  };

  const openEditModal = (entry) => {
    setSubjectName(entry.subjectName);
    setSelectedDays([...entry.days]);
    setStartTime(entry.startTime);
    setEndTime(entry.endTime);
    setProfessor(entry.professor || '');
    setAula(entry.aula || '');
    setNotes(entry.notes || '');
    setSubjectSuggestions([]);
    setEditMode(true);
    setSelectedEntry(entry);
    setDetailModal(false);
    setAddSubjectModal(true);
  };

  const saveEntry = async () => {
    if (!subjectName.trim()) {
      Alert.alert('Error', 'El nombre de la materia es obligatorio.');
      return;
    }
    if (selectedDays.length === 0) {
      Alert.alert('Error', 'Selecciona al menos un día.');
      return;
    }
    if (!startTime) {
      Alert.alert('Error', 'La hora de inicio es obligatoria.');
      return;
    }
    if (!endTime) {
      Alert.alert('Error', 'La hora de fin es obligatoria.');
      return;
    }
    if (parseInt(startTime) >= parseInt(endTime)) {
      Alert.alert('Error', 'La hora de inicio debe ser antes que la hora de fin.');
      return;
    }

    const entry = {
      id: editMode && selectedEntry ? selectedEntry.id : Date.now().toString(),
      subjectName: subjectName.trim(),
      days: selectedDays,
      startTime,
      endTime,
      color: editMode && selectedEntry
        ? selectedEntry.color
        : getNextColor(activeSchedule?.entries ?? []),
      professor: professor.trim(),
      aula: aula.trim(),
      notes: notes.trim(),
    };

    const updatedSchedules = schedules.map(s => {
      if (s.id !== activeScheduleId) return s;
      const entries = editMode
        ? s.entries.map(e => e.id === entry.id ? entry : e)
        : [...s.entries, entry];
      return { ...s, entries };
    });

    await saveSchedules(updatedSchedules);
    setAddSubjectModal(false);
    resetAddForm();
  };

  const deleteEntry = async (entryId) => {
    Alert.alert(
      'Eliminar Materia',
      '¿Quieres eliminar esta materia del horario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const updatedSchedules = schedules.map(s => {
              if (s.id !== activeScheduleId) return s;
              return { ...s, entries: s.entries.filter(e => e.id !== entryId) };
            });
            await saveSchedules(updatedSchedules);
            setDetailModal(false);
            setSelectedEntry(null);
          },
        },
      ]
    );
  };

  const openDetailModal = (entry) => {
    setSelectedEntry(entry);
    setDetailModal(true);
  };

  // ── Dimensiones de la tabla ───────────────────────────────────
  const TIME_W = 54;
  const DAY_W = 78;
  const ROW_H = 56;

  // ── Render ────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Horario" />
        <Appbar.Action
          icon="plus-circle-outline"
          onPress={() => setCreateScheduleModal(true)}
          tooltip="Nuevo horario"
        />
      </Appbar.Header>

      {/* Tabs de horarios */}
      {schedules.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsBar}
          contentContainerStyle={styles.tabsContent}
        >
          {schedules.map(s => (
            <Chip
              key={s.id}
              mode={s.id === activeScheduleId ? 'flat' : 'outlined'}
              selected={s.id === activeScheduleId}
              onPress={() => setActiveScheduleId(s.id)}
              onLongPress={() => deleteSchedule(s.id)}
              style={[
                styles.tab,
                s.id === activeScheduleId && styles.tabActive,
              ]}
              textStyle={s.id === activeScheduleId ? styles.tabActiveText : undefined}
            >
              {s.name}
            </Chip>
          ))}
        </ScrollView>
      )}

      {/* Estado vacío */}
      {!activeSchedule ? (
        <View style={styles.emptyState}>
          <Text variant="headlineSmall" style={styles.emptyTitle}>Sin Horarios</Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            Crea tu primer horario para comenzar a organizar tus clases.
          </Text>
          <Button
            mode="contained"
            icon="plus"
            onPress={() => setCreateScheduleModal(true)}
            style={{ marginTop: 8 }}
          >
            Crear Horario
          </Button>
        </View>
      ) : (
        <>
          {/* Tabla de horario */}
          <ScrollView style={styles.tableWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <View>
                {/* Cabecera */}
                <View style={styles.tableRow}>
                  <View style={[styles.timeCell, { width: TIME_W, height: 40 }]}>
                    <Text style={styles.headerSmall}>Hora</Text>
                  </View>
                  {DAYS.map(d => (
                    <View key={d} style={[styles.dayHeader, { width: DAY_W, height: 40 }]}>
                      <Text style={styles.dayHeaderText}>{d}</Text>
                    </View>
                  ))}
                </View>

                {/* Filas por hora */}
                {TIME_SLOTS.map(slot => (
                  <View key={slot} style={[styles.tableRow, { height: ROW_H }]}>
                    <View style={[styles.timeCell, { width: TIME_W, height: ROW_H }]}>
                      <Text style={styles.timeText}>{slot}</Text>
                    </View>
                    {DAYS.map(day => {
                      const entry = getEntryForSlot(day, slot);
                      const isStart = entry ? isEntryStart(entry, slot) : false;
                      return (
                        <TouchableOpacity
                          key={day}
                          style={[
                            styles.cell,
                            { width: DAY_W, height: ROW_H },
                            entry && {
                              backgroundColor: entry.color + 'DD',
                              borderColor: entry.color,
                            },
                          ]}
                          onPress={() => entry && openDetailModal(entry)}
                          activeOpacity={entry ? 0.75 : 1}
                        >
                          {entry && isStart && (
                            <Text style={styles.cellText} numberOfLines={3}>
                              {entry.subjectName}
                            </Text>
                          )}
                          {entry && !isStart && (
                            <View style={[styles.cellContinue, { backgroundColor: entry.color + '55' }]} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
            </ScrollView>
          </ScrollView>

          {/* Leyenda de materias */}
          {activeSchedule.entries.length > 0 && (
            <View style={styles.legend}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[...new Map(activeSchedule.entries.map(e => [e.id, e])).values()].map(e => (
                  <View key={e.id} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: e.color }]} />
                    <Text style={styles.legendText} numberOfLines={1}>
                      {e.subjectName.length > 18
                        ? e.subjectName.substring(0, 18) + '…'
                        : e.subjectName}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* FAB */}
          <FAB
            icon="plus"
            style={styles.fab}
            onPress={openAddSubjectModal}
            label="Agregar Materia"
          />
        </>
      )}

      {/* ── MODAL: Crear horario ─────────────────────────────── */}
      <Portal>
        <Modal
          visible={createScheduleModal}
          onDismiss={() => setCreateScheduleModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            Nuevo Horario
          </Text>
          <TextInput
            label="Nombre del horario"
            value={newScheduleName}
            onChangeText={setNewScheduleName}
            mode="outlined"
            style={styles.mInput}
            placeholder="Ej: Cuatrimestre 6, Semestre 2025…"
          />
          <View style={styles.modalActions}>
            <Button mode="outlined" onPress={() => setCreateScheduleModal(false)}>
              Cancelar
            </Button>
            <Button mode="contained" onPress={createSchedule}>
              Crear
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* ── MODAL: Agregar / Editar materia ─────────────────── */}
      <Portal>
        <Modal
          visible={addSubjectModal}
          onDismiss={() => { setAddSubjectModal(false); resetAddForm(); }}
          contentContainerStyle={styles.addModal}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text variant="titleLarge" style={styles.modalTitle}>
              {editMode ? 'Editar Materia' : 'Agregar Materia'}
            </Text>

            {/* ─ Nombre + autocomplete ─ */}
            <View style={styles.autocompleteWrap}>
              <TextInput
                label="Nombre de la Materia *"
                value={subjectName}
                onChangeText={handleSubjectNameChange}
                mode="outlined"
                style={styles.mInput}
                placeholder="Escribe 3 o más letras para buscar…"
              />
              {subjectSuggestions.length > 0 && (
                <View style={styles.suggestionsBox}>
                  {subjectSuggestions.map(s => (
                    <TouchableOpacity
                      key={s.id}
                      style={styles.suggestionRow}
                      onPress={() => selectSuggestion(s)}
                    >
                      <Text style={styles.suggCode}>{s.code}</Text>
                      <Text style={styles.suggName} numberOfLines={1}>{s.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* ─ Días ─ */}
            <Text variant="labelLarge" style={styles.fieldLabel}>Días *</Text>
            <View style={styles.daysRow}>
              {DAYS.map(d => (
                <Chip
                  key={d}
                  mode={selectedDays.includes(d) ? 'flat' : 'outlined'}
                  selected={selectedDays.includes(d)}
                  onPress={() => toggleDay(d)}
                  style={styles.dayChip}
                  compact
                >
                  {d}
                </Chip>
              ))}
            </View>

            {/* ─ Hora inicio ─ */}
            <Text variant="labelLarge" style={styles.fieldLabel}>Hora de inicio *</Text>
            <TouchableOpacity
              onPress={() => { setShowStartPicker(v => !v); setShowEndPicker(false); }}
            >
              <View pointerEvents="none">
                <TextInput
                  value={startTime}
                  mode="outlined"
                  style={styles.mInput}
                  placeholder="Seleccionar…"
                  editable={false}
                  right={<TextInput.Icon icon="clock-outline" />}
                />
              </View>
            </TouchableOpacity>
            {showStartPicker && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.timePicker}
              >
                {TIME_SLOTS.map(t => (
                  <Chip
                    key={t}
                    mode={startTime === t ? 'flat' : 'outlined'}
                    onPress={() => { setStartTime(t); setShowStartPicker(false); }}
                    style={styles.timeChip}
                  >
                    {t}
                  </Chip>
                ))}
              </ScrollView>
            )}

            {/* ─ Hora fin ─ */}
            <Text variant="labelLarge" style={styles.fieldLabel}>Hora de fin *</Text>
            <TouchableOpacity
              onPress={() => { setShowEndPicker(v => !v); setShowStartPicker(false); }}
            >
              <View pointerEvents="none">
                <TextInput
                  value={endTime}
                  mode="outlined"
                  style={styles.mInput}
                  placeholder="Seleccionar…"
                  editable={false}
                  right={<TextInput.Icon icon="clock-outline" />}
                />
              </View>
            </TouchableOpacity>
            {showEndPicker && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.timePicker}
              >
                {END_TIMES.map(t => (
                  <Chip
                    key={t}
                    mode={endTime === t ? 'flat' : 'outlined'}
                    onPress={() => { setEndTime(t); setShowEndPicker(false); }}
                    style={styles.timeChip}
                  >
                    {t}
                  </Chip>
                ))}
              </ScrollView>
            )}

            {/* ─ Campos opcionales ─ */}
            <Divider style={styles.optDivider} />
            <Text variant="labelSmall" style={styles.optLabel}>
              Campos opcionales — no aparecen en la tabla
            </Text>

            <TextInput
              label="Profesor"
              value={professor}
              onChangeText={setProfessor}
              mode="outlined"
              style={styles.mInput}
            />
            <TextInput
              label="Aula / Laboratorio"
              value={aula}
              onChangeText={setAula}
              mode="outlined"
              style={styles.mInput}
            />
            <TextInput
              label="Notas"
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              style={styles.mInput}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => { setAddSubjectModal(false); resetAddForm(); }}
              >
                Cancelar
              </Button>
              <Button mode="contained" onPress={saveEntry}>
                {editMode ? 'Guardar cambios' : 'Agregar'}
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* ── MODAL: Detalle de materia ────────────────────────── */}
      <Portal>
        <Modal
          visible={detailModal}
          onDismiss={() => setDetailModal(false)}
          contentContainerStyle={styles.modal}
        >
          {selectedEntry && (
            <>
              {/* Encabezado con color */}
              <View style={[styles.detailHeader, { backgroundColor: selectedEntry.color + '22' }]}>
                <View style={[styles.colorBadge, { backgroundColor: selectedEntry.color }]} />
                <Text variant="titleMedium" style={styles.detailTitle}>
                  {selectedEntry.subjectName}
                </Text>
              </View>

              <View style={styles.detailBody}>
                <DetailRow label="Días" value={selectedEntry.days.join(', ')} />
                <DetailRow
                  label="Horario"
                  value={`${selectedEntry.startTime} – ${selectedEntry.endTime}`}
                />
                {selectedEntry.professor ? (
                  <DetailRow label="Profesor" value={selectedEntry.professor} />
                ) : null}
                {selectedEntry.aula ? (
                  <DetailRow label="Aula" value={selectedEntry.aula} />
                ) : null}
                {selectedEntry.notes ? (
                  <DetailRow label="Notas" value={selectedEntry.notes} />
                ) : null}
                {!selectedEntry.professor && !selectedEntry.aula && !selectedEntry.notes && (
                  <Text style={styles.noOptional}>Sin información adicional registrada.</Text>
                )}
              </View>

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  icon="delete"
                  textColor={MD3Colors.error50}
                  onPress={() => deleteEntry(selectedEntry.id)}
                >
                  Eliminar
                </Button>
                <Button
                  mode="contained"
                  icon="pencil"
                  onPress={() => openEditModal(selectedEntry)}
                >
                  Editar
                </Button>
              </View>
            </>
          )}
        </Modal>
      </Portal>
    </View>
  );
};

// ─── Sub-componente fila de detalle ────────────────────────────
const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

// ─── Estilos ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  // Tabs
  tabsBar: {
    maxHeight: 56,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabsContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    alignItems: 'center',
  },
  tab: {
    marginRight: 4,
  },
  tabActive: {
    backgroundColor: '#1565C0',
  },
  tabActiveText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
    marginBottom: 8,
  },

  // Tabla
  tableWrapper: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
  },
  timeCell: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRightWidth: 2,
    borderBottomWidth: 1,
    borderColor: '#C5CAE9',
    paddingHorizontal: 2,
  },
  dayHeader: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1565C0',
    borderRightWidth: 1,
    borderBottomWidth: 2,
    borderColor: '#0D47A1',
  },
  dayHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  headerSmall: {
    color: '#5C6BC0',
    fontWeight: 'bold',
    fontSize: 11,
  },
  timeText: {
    fontSize: 11,
    color: '#5C6BC0',
    fontWeight: '600',
  },
  cell: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 2,
    overflow: 'hidden',
  },
  cellText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    paddingHorizontal: 2,
    marginTop: 2,
  },
  cellContinue: {
    flex: 1,
    width: '100%',
  },

  // Leyenda
  legend: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 48,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#333',
  },

  // FAB
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 72,
  },

  // Modales compartidos
  modal: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  addModal: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    maxHeight: '92%',
  },
  modalTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  mInput: {
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },

  // Autocomplete
  autocompleteWrap: {
    zIndex: 10,
  },
  suggestionsBox: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#C5CAE9',
    borderRadius: 8,
    marginTop: -8,
    marginBottom: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 10,
  },
  suggCode: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1565C0',
    width: 64,
  },
  suggName: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },

  // Días y tiempos
  fieldLabel: {
    color: '#555',
    marginBottom: 8,
    marginTop: 4,
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  dayChip: {},
  timePicker: {
    marginBottom: 14,
    paddingBottom: 4,
  },
  timeChip: {
    marginRight: 6,
  },

  // Opcionales
  optDivider: {
    marginVertical: 14,
  },
  optLabel: {
    color: '#999',
    marginBottom: 12,
    fontStyle: 'italic',
  },

  // Detalle
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    gap: 12,
  },
  colorBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    flexShrink: 0,
  },
  detailTitle: {
    fontWeight: 'bold',
    flex: 1,
    flexWrap: 'wrap',
  },
  detailBody: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontWeight: '700',
    color: '#555',
    width: 72,
    fontSize: 14,
  },
  detailValue: {
    flex: 1,
    color: '#222',
    fontSize: 14,
    lineHeight: 20,
  },
  noOptional: {
    color: '#aaa',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 8,
  },
});

export default ScheduleScreen;

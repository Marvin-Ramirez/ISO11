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
import { useAppTheme } from '../context/ThemeContext';

// ─── Constantes ────────────────────────────────────────────────
const DAYS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

const TIME_SLOTS = [
  '07:00','08:00','09:00','10:00','11:00','12:00',
  '13:00','14:00','15:00','16:00','17:00','18:00',
  '19:00','20:00','21:00',
];

const END_TIMES = [
  '08:00','09:00','10:00','11:00','12:00','13:00',
  '14:00','15:00','16:00','17:00','18:00','19:00',
  '20:00','21:00','22:00',
];

const SUBJECT_COLORS = [
  '#1E88E5','#43A047','#E53935','#8E24AA','#FB8C00',
  '#00ACC1','#D81B60','#6D4C41','#3949AB','#00897B',
  '#F4511E','#7CB342','#039BE5','#757575','#C0CA33',
];

const SCHEDULES_KEY = '@pensum_schedules';

// ─── Componente ────────────────────────────────────────────────
const ScheduleScreen = ({ navigation }) => {
  const { subjects } = useApp();
  const { colors } = useAppTheme();

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
  // daySchedules: { 'Lun': { startTime: '08:00', endTime: '10:00' }, ... }
  const [daySchedules, setDaySchedules] = useState({});
  // Control de qué selectores de hora están abiertos: 'Lun-start', 'Lun-end', etc.
  const [openPicker, setOpenPicker] = useState(null);
  const [professor, setProfessor] = useState('');
  const [aula, setAula] = useState('');
  const [notes, setNotes] = useState('');

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
    return SUBJECT_COLORS.find(c => !used.includes(c))
      ?? SUBJECT_COLORS[entries.length % SUBJECT_COLORS.length];
  };

  // Devuelve la entry que ocupa el slot (day, time)
  // Soporta formato nuevo (daySchedules) y legado (days + startTime/endTime)
  const getEntryForSlot = (day, slot) => {
    if (!activeSchedule) return null;
    const slotH = parseInt(slot);
    return activeSchedule.entries.find(entry => {
      if (entry.daySchedules) {
        const ds = entry.daySchedules.find(d => d.day === day);
        if (!ds) return false;
        return slotH >= parseInt(ds.startTime) && slotH < parseInt(ds.endTime);
      }
      // Formato legado
      if (!entry.days?.includes(day)) return false;
      return slotH >= parseInt(entry.startTime) && slotH < parseInt(entry.endTime);
    }) ?? null;
  };

  // ¿Este slot es el inicio de la entry en ese día?
  const isEntryStart = (entry, day, slot) => {
    const slotH = parseInt(slot);
    if (entry.daySchedules) {
      const ds = entry.daySchedules.find(d => d.day === day);
      return ds ? parseInt(ds.startTime) === slotH : false;
    }
    return parseInt(entry.startTime) === slotH;
  };

  // ── Autocomplete ──────────────────────────────────────────────
  const handleSubjectNameChange = (text) => {
    setSubjectName(text);
    if (text.length >= 3) {
      setSubjectSuggestions(
        subjects.filter(s =>
          s.name.toLowerCase().includes(text.toLowerCase()) ||
          s.code.toLowerCase().includes(text.toLowerCase())
        ).slice(0, 6)
      );
    } else {
      setSubjectSuggestions([]);
    }
  };

  const selectSuggestion = (s) => {
    setSubjectName(s.name);
    setSubjectSuggestions([]);
  };

  // ── Días y horas ──────────────────────────────────────────────
  const toggleDay = (day) => {
    setSelectedDays(prev => {
      if (prev.includes(day)) {
        setDaySchedules(ds => { const n = {...ds}; delete n[day]; return n; });
        return prev.filter(d => d !== day);
      }
      return [...prev, day];
    });
  };

  const setDayTime = (day, field, value) => {
    setDaySchedules(prev => ({
      ...prev,
      [day]: { ...(prev[day] || {}), [field]: value },
    }));
    setOpenPicker(null);
  };

  const togglePicker = (key) => {
    setOpenPicker(prev => prev === key ? null : key);
  };

  // ── Crear horario ─────────────────────────────────────────────
  const createSchedule = async () => {
    if (!newScheduleName.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para el horario.');
      return;
    }
    const ns = {
      id: Date.now().toString(),
      name: newScheduleName.trim(),
      createdAt: new Date().toISOString(),
      entries: [],
    };
    const updated = [...schedules, ns];
    await saveSchedules(updated);
    setActiveScheduleId(ns.id);
    setNewScheduleName('');
    setCreateScheduleModal(false);
  };

  const deleteSchedule = (sid) => {
    Alert.alert(
      'Eliminar Horario',
      '¿Eliminar este horario y todas sus materias?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: async () => {
            const updated = schedules.filter(s => s.id !== sid);
            await saveSchedules(updated);
            setActiveScheduleId(updated.length > 0 ? updated[0].id : null);
          },
        },
      ]
    );
  };

  // ── Agregar / Editar materia ───────────────────────────────────
  const resetForm = () => {
    setSubjectName('');
    setSubjectSuggestions([]);
    setSelectedDays([]);
    setDaySchedules({});
    setOpenPicker(null);
    setProfessor('');
    setAula('');
    setNotes('');
  };

  const openAddModal = () => {
    resetForm();
    setEditMode(false);
    setSelectedEntry(null);
    setAddSubjectModal(true);
  };

  const openEditModal = (entry) => {
    setSubjectName(entry.subjectName);
    // Cargar daySchedules del entry
    if (entry.daySchedules) {
      const days = entry.daySchedules.map(d => d.day);
      const sched = {};
      entry.daySchedules.forEach(d => { sched[d.day] = { startTime: d.startTime, endTime: d.endTime }; });
      setSelectedDays(days);
      setDaySchedules(sched);
    } else {
      // Legado
      setSelectedDays([...(entry.days || [])]);
      const sched = {};
      (entry.days || []).forEach(d => {
        sched[d] = { startTime: entry.startTime, endTime: entry.endTime };
      });
      setDaySchedules(sched);
    }
    setProfessor(entry.professor || '');
    setAula(entry.aula || '');
    setNotes(entry.notes || '');
    setSubjectSuggestions([]);
    setOpenPicker(null);
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
    // Validar horas de cada día
    for (const day of selectedDays) {
      const ds = daySchedules[day];
      if (!ds?.startTime || !ds?.endTime) {
        Alert.alert('Error', `Debes asignar hora de inicio y fin para el día ${day}.`);
        return;
      }
      if (parseInt(ds.startTime) >= parseInt(ds.endTime)) {
        Alert.alert('Error', `La hora de inicio debe ser antes que la de fin en el día ${day}.`);
        return;
      }
    }

    const builtDaySchedules = selectedDays.map(day => ({
      day,
      startTime: daySchedules[day].startTime,
      endTime: daySchedules[day].endTime,
    }));

    const entry = {
      id: editMode && selectedEntry ? selectedEntry.id : Date.now().toString(),
      subjectName: subjectName.trim(),
      daySchedules: builtDaySchedules,
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
    resetForm();
  };

  const deleteEntry = (entryId) => {
    Alert.alert('Eliminar Materia', '¿Eliminar esta materia del horario?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
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
    ]);
  };

  const openDetailModal = (entry) => {
    setSelectedEntry(entry);
    setDetailModal(true);
  };

  // ── Dimensiones de la tabla ───────────────────────────────────
  const TIME_W = 54;
  const DAY_W = 82;
  const ROW_H = 56;

  const styles = makeStyles(colors);

  // ── Render ────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Horario" />
        <Appbar.Action icon="plus-circle-outline" onPress={() => setCreateScheduleModal(true)} />
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
              style={[styles.tab, s.id === activeScheduleId && styles.tabActive]}
              textStyle={s.id === activeScheduleId ? styles.tabActiveText : { color: colors.text }}
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
            Crea tu primer horario para organizar tus clases.
          </Text>
          <Button mode="contained" icon="plus" onPress={() => setCreateScheduleModal(true)} style={{ marginTop: 8 }}>
            Crear Horario
          </Button>
        </View>
      ) : (
        <>
          {/* Tabla */}
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

                {/* Filas */}
                {TIME_SLOTS.map(slot => (
                  <View key={slot} style={[styles.tableRow, { height: ROW_H }]}>
                    <View style={[styles.timeCell, { width: TIME_W, height: ROW_H }]}>
                      <Text style={styles.timeText}>{slot}</Text>
                    </View>
                    {DAYS.map(day => {
                      const entry = getEntryForSlot(day, slot);
                      const isStart = entry ? isEntryStart(entry, day, slot) : false;
                      return (
                        <TouchableOpacity
                          key={day}
                          style={[
                            styles.cell,
                            { width: DAY_W, height: ROW_H },
                            entry && { backgroundColor: entry.color + 'DD', borderColor: entry.color },
                          ]}
                          onPress={() => entry && openDetailModal(entry)}
                          activeOpacity={entry ? 0.75 : 1}
                        >
                          {entry && isStart && (
                            <Text style={styles.cellText} numberOfLines={3}>{entry.subjectName}</Text>
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

          {/* Leyenda */}
          {activeSchedule.entries.length > 0 && (
            <View style={styles.legend}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[...new Map(activeSchedule.entries.map(e => [e.id, e])).values()].map(e => (
                  <View key={e.id} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: e.color }]} />
                    <Text style={styles.legendText} numberOfLines={1}>
                      {e.subjectName.length > 18 ? e.subjectName.substring(0, 18) + '…' : e.subjectName}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <FAB icon="plus" style={styles.fab} onPress={openAddModal} label="Agregar Materia" />
        </>
      )}

      {/* ── MODAL: Crear horario ─────────────────────────────── */}
      <Portal>
        <Modal
          visible={createScheduleModal}
          onDismiss={() => setCreateScheduleModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>Nuevo Horario</Text>
          <TextInput
            label="Nombre del horario"
            value={newScheduleName}
            onChangeText={setNewScheduleName}
            mode="outlined"
            style={styles.mInput}
            placeholder="Ej: Cuatrimestre 6…"
          />
          <View style={styles.modalActions}>
            <Button mode="outlined" onPress={() => setCreateScheduleModal(false)}>Cancelar</Button>
            <Button mode="contained" onPress={createSchedule}>Crear</Button>
          </View>
        </Modal>
      </Portal>

      {/* ── MODAL: Agregar / Editar materia ─────────────────── */}
      <Portal>
        <Modal
          visible={addSubjectModal}
          onDismiss={() => { setAddSubjectModal(false); resetForm(); }}
          contentContainerStyle={styles.addModal}
        >
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text variant="titleLarge" style={styles.modalTitle}>
              {editMode ? 'Editar Materia' : 'Agregar Materia'}
            </Text>

            {/* Autocomplete */}
            <View style={{ zIndex: 10 }}>
              <TextInput
                label="Nombre de la Materia *"
                value={subjectName}
                onChangeText={handleSubjectNameChange}
                mode="outlined"
                style={styles.mInput}
                placeholder="Escribe 3+ letras para buscar…"
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

            {/* Selección de días */}
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

            {/* Horas por día */}
            {selectedDays.length > 0 && (
              <View style={styles.dayTimesSection}>
                <Text variant="labelLarge" style={styles.fieldLabel}>
                  Horario por día *
                </Text>
                <Text variant="bodySmall" style={styles.hintText}>
                  Cada día puede tener su propio horario independiente.
                </Text>

                {selectedDays.map(day => {
                  const ds = daySchedules[day] || {};
                  const startKey = `${day}-start`;
                  const endKey = `${day}-end`;
                  return (
                    <View key={day} style={styles.dayTimeBlock}>
                      <View style={styles.dayTimeLabelRow}>
                        <View style={[styles.dayBadge, { backgroundColor: MD3Colors.primary40 }]}>
                          <Text style={styles.dayBadgeText}>{day}</Text>
                        </View>
                        <Text style={styles.dayTimeRange}>
                          {ds.startTime && ds.endTime
                            ? `${ds.startTime} – ${ds.endTime}`
                            : 'Sin asignar'}
                        </Text>
                      </View>

                      {/* Inicio */}
                      <TouchableOpacity onPress={() => togglePicker(startKey)}>
                        <View pointerEvents="none">
                          <TextInput
                            label={`Inicio (${day})`}
                            value={ds.startTime || ''}
                            mode="outlined"
                            style={styles.timeInput}
                            editable={false}
                            right={<TextInput.Icon icon="clock-start" />}
                          />
                        </View>
                      </TouchableOpacity>
                      {openPicker === startKey && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timePicker}>
                          {TIME_SLOTS.map(t => (
                            <Chip
                              key={t}
                              mode={ds.startTime === t ? 'flat' : 'outlined'}
                              onPress={() => setDayTime(day, 'startTime', t)}
                              style={styles.timeChip}
                            >
                              {t}
                            </Chip>
                          ))}
                        </ScrollView>
                      )}

                      {/* Fin */}
                      <TouchableOpacity onPress={() => togglePicker(endKey)}>
                        <View pointerEvents="none">
                          <TextInput
                            label={`Fin (${day})`}
                            value={ds.endTime || ''}
                            mode="outlined"
                            style={styles.timeInput}
                            editable={false}
                            right={<TextInput.Icon icon="clock-end" />}
                          />
                        </View>
                      </TouchableOpacity>
                      {openPicker === endKey && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timePicker}>
                          {END_TIMES.map(t => (
                            <Chip
                              key={t}
                              mode={ds.endTime === t ? 'flat' : 'outlined'}
                              onPress={() => setDayTime(day, 'endTime', t)}
                              style={styles.timeChip}
                            >
                              {t}
                            </Chip>
                          ))}
                        </ScrollView>
                      )}

                      {/* Separador entre días */}
                      <Divider style={{ marginTop: 8, marginBottom: 4, backgroundColor: colors.divider }} />
                    </View>
                  );
                })}
              </View>
            )}

            {/* Campos opcionales */}
            <Divider style={styles.optDivider} />
            <Text variant="labelSmall" style={styles.optLabel}>
              Campos opcionales
            </Text>

            <TextInput label="Profesor" value={professor} onChangeText={setProfessor} mode="outlined" style={styles.mInput} />
            <TextInput label="Aula / Laboratorio" value={aula} onChangeText={setAula} mode="outlined" style={styles.mInput} />
            <TextInput label="Notas" value={notes} onChangeText={setNotes} mode="outlined" style={styles.mInput} multiline numberOfLines={3} />

            <View style={styles.modalActions}>
              <Button mode="outlined" onPress={() => { setAddSubjectModal(false); resetForm(); }}>Cancelar</Button>
              <Button mode="contained" onPress={saveEntry}>{editMode ? 'Guardar cambios' : 'Agregar'}</Button>
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
              <View style={[styles.detailHeader, { backgroundColor: selectedEntry.color + '22' }]}>
                <View style={[styles.colorBadge, { backgroundColor: selectedEntry.color }]} />
                <Text variant="titleMedium" style={styles.detailTitle}>{selectedEntry.subjectName}</Text>
              </View>

              <View style={styles.detailBody}>
                {/* Mostrar horario por día */}
                {(selectedEntry.daySchedules || []).map(ds => (
                  <DetailRow key={ds.day} label={ds.day} value={`${ds.startTime} – ${ds.endTime}`} colors={colors} />
                ))}
                {/* Legado */}
                {!selectedEntry.daySchedules && selectedEntry.days && (
                  <DetailRow
                    label="Días"
                    value={`${selectedEntry.days.join(', ')}  ${selectedEntry.startTime}–${selectedEntry.endTime}`}
                    colors={colors}
                  />
                )}
                {selectedEntry.professor ? <DetailRow label="Profesor" value={selectedEntry.professor} colors={colors} /> : null}
                {selectedEntry.aula ? <DetailRow label="Aula" value={selectedEntry.aula} colors={colors} /> : null}
                {selectedEntry.notes ? <DetailRow label="Notas" value={selectedEntry.notes} colors={colors} /> : null}
                {!selectedEntry.professor && !selectedEntry.aula && !selectedEntry.notes && (
                  <Text style={styles.noOptional}>Sin información adicional registrada.</Text>
                )}
              </View>

              <View style={styles.modalActions}>
                <Button mode="outlined" icon="delete" textColor={MD3Colors.error50} onPress={() => deleteEntry(selectedEntry.id)}>
                  Eliminar
                </Button>
                <Button mode="contained" icon="pencil" onPress={() => openEditModal(selectedEntry)}>
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

// Sub-componente fila de detalle
const DetailRow = ({ label, value, colors }) => (
  <View style={{ flexDirection: 'row', marginBottom: 10, alignItems: 'flex-start' }}>
    <Text style={{ fontWeight: '700', color: colors.textSecondary, width: 72, fontSize: 14 }}>{label}:</Text>
    <Text style={{ flex: 1, color: colors.text, fontSize: 14, lineHeight: 20 }}>{value}</Text>
  </View>
);

// ─── Estilos dinámicos ────────────────────────────────────────
const makeStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabsBar: { maxHeight: 56, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  tabsContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 8, alignItems: 'center' },
  tab: { marginRight: 4 },
  tabActive: { backgroundColor: colors.tabActiveBg },
  tabActiveText: { color: colors.tabActiveText, fontWeight: 'bold' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontWeight: 'bold', marginBottom: 12, color: colors.text },
  emptyText: { textAlign: 'center', color: colors.textSecondary, lineHeight: 22, marginBottom: 8 },
  tableWrapper: { flex: 1 },
  tableRow: { flexDirection: 'row' },
  timeCell: {
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.scheduleTimeCell,
    borderRightWidth: 2, borderBottomWidth: 1,
    borderColor: colors.scheduleTimeCellBorder,
    paddingHorizontal: 2,
  },
  dayHeader: {
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.scheduleHeader,
    borderRightWidth: 1, borderBottomWidth: 2,
    borderColor: colors.scheduleTimeCellBorder,
  },
  dayHeaderText: { color: colors.scheduleHeaderText, fontWeight: 'bold', fontSize: 13 },
  headerSmall: { color: colors.scheduleTimeText, fontWeight: 'bold', fontSize: 11 },
  timeText: { fontSize: 11, color: colors.scheduleTimeText, fontWeight: '600' },
  cell: {
    borderRightWidth: 1, borderBottomWidth: 1,
    borderColor: colors.scheduleCellBorder,
    justifyContent: 'flex-start', alignItems: 'center',
    padding: 2, overflow: 'hidden',
  },
  cellText: {
    fontSize: 10, color: '#fff', fontWeight: 'bold', textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
    paddingHorizontal: 2, marginTop: 2,
  },
  cellContinue: { flex: 1, width: '100%' },
  legend: {
    backgroundColor: colors.legendBg,
    borderTopWidth: 1, borderTopColor: colors.legendBorderTop,
    paddingHorizontal: 12, paddingVertical: 8, maxHeight: 48,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 6 },
  legendText: { fontSize: 12, color: colors.text },
  fab: { position: 'absolute', right: 16, bottom: 72 },
  // Modal compartido
  modal: { backgroundColor: colors.surface, margin: 20, padding: 20, borderRadius: 12 },
  addModal: { backgroundColor: colors.surface, margin: 16, padding: 20, borderRadius: 12, maxHeight: '92%' },
  modalTitle: { fontWeight: 'bold', textAlign: 'center', marginBottom: 16, color: colors.text },
  mInput: { marginBottom: 12 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
  // Autocomplete
  suggestionsBox: {
    backgroundColor: colors.suggestBg, borderWidth: 1, borderColor: colors.suggestBorder,
    borderRadius: 8, marginTop: -8, marginBottom: 8,
    elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6,
  },
  suggestionRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: colors.suggestSeparator, gap: 10,
  },
  suggCode: { fontSize: 12, fontWeight: 'bold', color: colors.suggCodeColor, width: 64 },
  suggName: { fontSize: 13, color: colors.suggNameColor, flex: 1 },
  // Días
  fieldLabel: { color: colors.textSecondary, marginBottom: 8, marginTop: 4 },
  daysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  dayChip: {},
  // Horario por día
  dayTimesSection: {
    borderWidth: 1, borderColor: colors.dayTimeSectionBorder,
    borderRadius: 8, padding: 12, marginBottom: 12,
    backgroundColor: colors.dayTimeSectionBg,
  },
  hintText: { color: colors.textTertiary, marginBottom: 12, fontStyle: 'italic' },
  dayTimeBlock: { marginBottom: 4 },
  dayTimeLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  dayBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  dayBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  dayTimeRange: { color: colors.textSecondary, fontSize: 13 },
  timeInput: { marginBottom: 6 },
  timePicker: { marginBottom: 8, paddingBottom: 4 },
  timeChip: { marginRight: 6 },
  // Opcionales
  optDivider: { marginVertical: 14, backgroundColor: colors.divider },
  optLabel: { color: colors.textTertiary, marginBottom: 12, fontStyle: 'italic' },
  // Detalle
  detailHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 10, marginBottom: 16, gap: 12 },
  colorBadge: { width: 18, height: 18, borderRadius: 9, flexShrink: 0 },
  detailTitle: { fontWeight: 'bold', flex: 1, flexWrap: 'wrap', color: colors.text },
  detailBody: { marginBottom: 12 },
  noOptional: { color: colors.textTertiary, fontStyle: 'italic', textAlign: 'center', marginVertical: 8 },
});

export default ScheduleScreen;
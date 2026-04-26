import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Appbar, Card, Text, Button, TextInput,
  Divider, List, MD3Colors, Modal, Portal, DataTable,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '../context/ThemeContext';

const FinanceScreen = ({ navigation }) => {
  const { colors } = useAppTheme();
  const [payments, setPayments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [formData, setFormData] = useState({ semester: '', amount: '', date: '', description: '' });

  const PAYMENTS_KEY = '@pensum_payments';

  useEffect(() => { loadPayments(); }, []);

  const loadPayments = async () => {
    try {
      const json = await AsyncStorage.getItem(PAYMENTS_KEY);
      if (json) setPayments(JSON.parse(json));
    } catch (e) { console.error(e); }
  };

  const savePayments = async (list) => {
    try {
      await AsyncStorage.setItem(PAYMENTS_KEY, JSON.stringify(list));
      setPayments(list);
      return true;
    } catch (e) { return false; }
  };

  const calcTotals = () => {
    const totalPaid = payments.reduce((s, p) => s + parseFloat(p.amount || 0), 0);
    const bySemester = payments.reduce((acc, p) => {
      acc[p.semester] = (acc[p.semester] || 0) + parseFloat(p.amount || 0);
      return acc;
    }, {});
    return { totalPaid, bySemester, semesterCount: Object.keys(bySemester).length };
  };

  const { totalPaid, bySemester, semesterCount } = calcTotals();

  const openModal = (payment = null) => {
    if (payment) {
      setEditingPayment(payment);
      setFormData({ semester: String(payment.semester), amount: String(payment.amount), date: payment.date, description: payment.description || '' });
    } else {
      setEditingPayment(null);
      setFormData({ semester: '', amount: '', date: new Date().toISOString().split('T')[0], description: '' });
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.semester.trim() || !formData.amount.trim() || !formData.date.trim()) {
      Alert.alert('Error', 'Completa los campos obligatorios.'); return;
    }
    const amount = parseFloat(formData.amount);
    const semester = parseInt(formData.semester);
    if (isNaN(amount) || amount <= 0) { Alert.alert('Error', 'Monto inválido.'); return; }
    if (isNaN(semester) || semester < 1 || semester > 12) { Alert.alert('Error', 'Cuatrimestre debe ser 1–12.'); return; }

    const p = {
      id: editingPayment?.id ?? Date.now().toString(),
      semester, amount, date: formData.date,
      description: formData.description.trim(),
      createdAt: editingPayment?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let list = editingPayment ? payments.map(x => x.id === p.id ? p : x) : [...payments, p];
    list.sort((a, b) => a.semester !== b.semester ? a.semester - b.semester : new Date(b.date) - new Date(a.date));
    const ok = await savePayments(list);
    if (ok) {
      setModalVisible(false);
      Alert.alert('✅ Guardado', editingPayment ? 'Pago actualizado.' : 'Pago registrado.');
    }
  };

  const handleDelete = (p) => {
    Alert.alert('Eliminar Pago', `¿Eliminar pago del cuatrimestre ${p.semester}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        if (await savePayments(payments.filter(x => x.id !== p.id)))
          Alert.alert('✅ Eliminado');
      }},
    ]);
  };

  const handleClearAll = () => {
    if (!payments.length) return;
    Alert.alert('Eliminar Todos', `¿Eliminar ${payments.length} registros?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        if (await savePayments([])) Alert.alert('✅ Eliminados');
      }},
    ]);
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const fmtCur = (a) => `RD$ ${parseFloat(a).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const styles = makeStyles(colors);

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Control de Pagos" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        {/* Resumen Financiero */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.summaryTitle}>Resumen Financiero</Text>
            <View style={styles.countersRow}>
              <View style={styles.counter}>
                <Text variant="headlineMedium" style={styles.counterNum}>{semesterCount}</Text>
                <Text variant="bodySmall" style={styles.counterLabel}>Cuatrimestres</Text>
              </View>
              <View style={styles.counterSep} />
              <View style={styles.counter}>
                <Text variant="headlineMedium" style={styles.counterNum}>{payments.length}</Text>
                <Text variant="bodySmall" style={styles.counterLabel}>Pagos registrados</Text>
              </View>
            </View>
            <Divider style={styles.summaryDivider} />
            <View style={styles.totalBox}>
              <Text variant="bodyMedium" style={styles.totalBoxLabel}>Total Pagado</Text>
              <Text variant="headlineSmall" style={styles.totalBoxAmt}>{fmtCur(totalPaid)}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Por cuatrimestre */}
        {Object.keys(bySemester).length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>Total por Cuatrimestre</Text>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title><Text style={styles.bodyText}>Cuatrimestre</Text></DataTable.Title>
                  <DataTable.Title numeric><Text style={styles.bodyText}>Total Pagado</Text></DataTable.Title>
                </DataTable.Header>
                {Object.entries(bySemester).sort(([a],[b]) => +a - +b).map(([sem, amt]) => (
                  <DataTable.Row key={sem}>
                    <DataTable.Cell><Text style={styles.bodyText}>Cuatrimestre {sem}</Text></DataTable.Cell>
                    <DataTable.Cell numeric><Text style={styles.bodyText}>{fmtCur(amt)}</Text></DataTable.Cell>
                  </DataTable.Row>
                ))}
                <DataTable.Row style={styles.totalRow}>
                  <DataTable.Cell><Text variant="titleSmall" style={styles.totalText}>Total General</Text></DataTable.Cell>
                  <DataTable.Cell numeric><Text variant="titleSmall" style={styles.totalText}>{fmtCur(totalPaid)}</Text></DataTable.Cell>
                </DataTable.Row>
              </DataTable>
            </Card.Content>
          </Card>
        )}

        {/* Historial */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Historial ({payments.length})</Text>
              <View style={styles.headerActions}>
                <Button mode="outlined" icon="plus" onPress={() => openModal()} compact>Agregar</Button>
                {payments.length > 0 && (
                  <Button mode="outlined" icon="delete" textColor={MD3Colors.error50} onPress={handleClearAll} compact>Limpiar</Button>
                )}
              </View>
            </View>
            <Divider style={styles.divider} />
            {payments.length === 0 ? (
              <View style={styles.emptyState}>
                <Text variant="bodyLarge" style={styles.emptyText}>No hay pagos registrados</Text>
                <Text variant="bodyMedium" style={styles.emptySubtext}>Presiona "Agregar" para el primer pago</Text>
                <Button mode="contained" icon="plus" onPress={() => openModal()} style={{ marginTop: 8 }}>Registrar Primer Pago</Button>
              </View>
            ) : payments.map((p, i) => (
              <List.Item
                key={p.id}
                title={`Cuatrimestre ${p.semester}`}
                titleStyle={styles.bodyText}
                description={p.description || 'Pago de matrícula'}
                descriptionStyle={styles.descText}
                left={props => <List.Icon {...props} icon="cash" color={MD3Colors.primary70} />}
                right={() => (
                  <View style={styles.paymentActions}>
                    <Text variant="bodyLarge" style={styles.paymentAmount}>{fmtCur(p.amount)}</Text>
                    <View style={styles.actionBtns}>
                      <Button mode="text" icon="pencil" onPress={() => openModal(p)} compact>Editar</Button>
                      <Button mode="text" icon="delete" textColor={MD3Colors.error50} onPress={() => handleDelete(p)} compact>Eliminar</Button>
                    </View>
                  </View>
                )}
                style={[styles.listItem, i === payments.length - 1 && styles.lastListItem]}
              />
            ))}
          </Card.Content>
        </Card>
      </ScrollView>

      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modal}>
          <Text variant="titleLarge" style={styles.modalTitle}>{editingPayment ? 'Editar Pago' : 'Registrar Pago'}</Text>
          <TextInput label="Cuatrimestre *" value={formData.semester} onChangeText={t => setFormData(f => ({...f, semester: t}))} keyboardType="numeric" mode="outlined" style={styles.input} placeholder="Ej: 5" />
          <TextInput label="Monto (RD$) *" value={formData.amount} onChangeText={t => setFormData(f => ({...f, amount: t}))} keyboardType="numeric" mode="outlined" style={styles.input} placeholder="15250.00" />
          <TextInput label="Fecha *" value={formData.date} onChangeText={t => setFormData(f => ({...f, date: t}))} mode="outlined" style={styles.input} placeholder="YYYY-MM-DD" />
          <TextInput label="Descripción (opcional)" value={formData.description} onChangeText={t => setFormData(f => ({...f, description: t}))} mode="outlined" style={styles.input} multiline numberOfLines={2} />
          <View style={styles.modalActions}>
            <Button mode="outlined" onPress={() => setModalVisible(false)} style={styles.modalBtn}>Cancelar</Button>
            <Button mode="contained" onPress={handleSave} style={styles.modalBtn}>{editingPayment ? 'Actualizar' : 'Guardar'}</Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1, padding: 16 },
  summaryCard: { marginBottom: 16, backgroundColor: colors.financeSummaryBg },
  summaryTitle: { textAlign: 'center', marginBottom: 16, fontWeight: 'bold', color: colors.financeTitleColor },
  countersRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  counter: { alignItems: 'center', flex: 1, paddingVertical: 8 },
  counterNum: { fontWeight: 'bold', color: MD3Colors.primary40, lineHeight: 40 },
  counterLabel: { color: colors.textSecondary, marginTop: 2, textAlign: 'center' },
  counterSep: { width: 1, height: 48, backgroundColor: colors.counterSeparator, marginHorizontal: 8 },
  summaryDivider: { marginVertical: 14, backgroundColor: colors.counterSeparator },
  totalBox: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: 10, paddingVertical: 14, paddingHorizontal: 20, borderWidth: 1, borderColor: colors.financeSummaryBorder },
  totalBoxLabel: { color: colors.textSecondary, marginBottom: 6, letterSpacing: 0.5 },
  totalBoxAmt: { fontWeight: 'bold', color: colors.financeSummaryTotal },
  card: { marginBottom: 16, backgroundColor: colors.surface },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontWeight: 'bold', color: colors.text },
  headerActions: { flexDirection: 'row', gap: 8 },
  divider: { marginVertical: 12, backgroundColor: colors.divider },
  totalRow: { backgroundColor: colors.subtleBg },
  totalText: { fontWeight: 'bold', color: colors.text },
  bodyText: { color: colors.text },
  descText: { color: colors.textSecondary },
  emptyState: { alignItems: 'center', padding: 32 },
  emptyText: { textAlign: 'center', marginBottom: 8, color: colors.textSecondary },
  emptySubtext: { textAlign: 'center', color: colors.textTertiary, marginBottom: 24 },
  listItem: { paddingLeft: 0, borderBottomWidth: 1, borderBottomColor: colors.divider },
  lastListItem: { borderBottomWidth: 0 },
  paymentActions: { alignItems: 'flex-end' },
  paymentAmount: { fontWeight: 'bold', marginBottom: 4, color: colors.text },
  actionBtns: { flexDirection: 'row', gap: 4 },
  modal: { backgroundColor: colors.surface, margin: 20, padding: 20, borderRadius: 8 },
  modalTitle: { marginBottom: 20, textAlign: 'center', color: colors.text },
  input: { marginBottom: 12 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 8 },
  modalBtn: { minWidth: 100 },
});

export default FinanceScreen;
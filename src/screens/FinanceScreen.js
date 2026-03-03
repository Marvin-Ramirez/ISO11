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
  Divider,
  List,
  Chip,
  MD3Colors,
  Modal,
  Portal,
  DataTable,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FinanceScreen = ({ navigation }) => {
  const [payments, setPayments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [formData, setFormData] = useState({
    semester: '',
    amount: '',
    date: '',
    description: '',
  });

  const PAYMENTS_STORAGE_KEY = '@pensum_payments';

  // Cargar pagos al iniciar
  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(PAYMENTS_STORAGE_KEY);
      if (jsonValue !== null) {
        setPayments(JSON.parse(jsonValue));
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  const savePayments = async (newPayments) => {
    try {
      const jsonValue = JSON.stringify(newPayments);
      await AsyncStorage.setItem(PAYMENTS_STORAGE_KEY, jsonValue);
      setPayments(newPayments);
      return true;
    } catch (error) {
      console.error('Error saving payments:', error);
      return false;
    }
  };

  // Calcular totales
  const calculateTotals = () => {
    const totalPaid = payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
    
    // Agrupar por cuatrimestre
    const bySemester = payments.reduce((acc, payment) => {
      const semester = payment.semester;
      if (!acc[semester]) {
        acc[semester] = 0;
      }
      acc[semester] += parseFloat(payment.amount || 0);
      return acc;
    }, {});

    return {
      totalPaid,
      bySemester,
      semesterCount: Object.keys(bySemester).length,
    };
  };

  const { totalPaid, bySemester, semesterCount } = calculateTotals();

  // Abrir modal para agregar/editar pago
  const openPaymentModal = (payment = null) => {
    if (payment) {
      setEditingPayment(payment);
      setFormData({
        semester: payment.semester.toString(),
        amount: payment.amount.toString(),
        date: payment.date,
        description: payment.description || '',
      });
    } else {
      setEditingPayment(null);
      setFormData({
        semester: '',
        amount: '',
        date: new Date().toISOString().split('T')[0], // Fecha actual
        description: '',
      });
    }
    setModalVisible(true);
  };

  // Guardar pago
  const handleSavePayment = async () => {
    if (!formData.semester.trim() || !formData.amount.trim() || !formData.date.trim()) {
      Alert.alert('Error', 'Por favor completa los campos obligatorios (Cuatrimestre, Monto y Fecha).');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido.');
      return;
    }

    const semester = parseInt(formData.semester);
    if (isNaN(semester) || semester < 1 || semester > 12) {
      Alert.alert('Error', 'El cuatrimestre debe ser un número entre 1 y 12.');
      return;
    }

    const paymentData = {
      id: editingPayment ? editingPayment.id : Date.now().toString(),
      semester: semester,
      amount: amount,
      date: formData.date,
      description: formData.description.trim(),
      createdAt: editingPayment ? editingPayment.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let newPayments;
    if (editingPayment) {
      newPayments = payments.map(p => p.id === editingPayment.id ? paymentData : p);
    } else {
      newPayments = [...payments, paymentData];
    }

    // Ordenar por cuatrimestre y fecha
    newPayments.sort((a, b) => {
      if (a.semester !== b.semester) return a.semester - b.semester;
      return new Date(b.date) - new Date(a.date);
    });

    const success = await savePayments(newPayments);
    if (success) {
      setModalVisible(false);
      Alert.alert(
        '✅ Pago Guardado',
        editingPayment ? 'Pago actualizado exitosamente.' : 'Pago registrado exitosamente.'
      );
    }
  };

  // Eliminar pago
  const handleDeletePayment = (payment) => {
    Alert.alert(
      'Eliminar Pago',
      `¿Estás seguro de que quieres eliminar el pago del cuatrimestre ${payment.semester}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const newPayments = payments.filter(p => p.id !== payment.id);
            const success = await savePayments(newPayments);
            if (success) {
              Alert.alert('✅ Pago Eliminado', 'El pago ha sido eliminado exitosamente.');
            }
          },
        },
      ]
    );
  };

  // Limpiar todos los pagos
  const handleClearAll = () => {
    if (payments.length === 0) return;

    Alert.alert(
      'Eliminar Todos los Pagos',
      `¿Estás seguro de que quieres eliminar todos los pagos (${payments.length} registros)?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar Todos',
          style: 'destructive',
          onPress: async () => {
            const success = await savePayments([]);
            if (success) {
              Alert.alert('✅ Pagos Eliminados', 'Todos los pagos han sido eliminados.');
            }
          },
        },
      ]
    );
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Formatear moneda
  const formatCurrency = (amount) => {
    return `RD$ ${parseFloat(amount).toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Control de Pagos" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        {/* Resumen General */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.summaryTitle}>
              Resumen Financiero
            </Text>
            
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text variant="headlineMedium" style={styles.summaryNumber}>
                  {semesterCount}
                </Text>
                <Text variant="bodyMedium">Cuatrimestres</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text variant="headlineMedium" style={styles.summaryNumber}>
                  {payments.length}
                </Text>
                <Text variant="bodyMedium">Pagos</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text variant="headlineMedium" style={styles.summaryNumber}>
                  {formatCurrency(totalPaid)}
                </Text>
                <Text variant="bodyMedium">Total Pagado</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Resumen por Cuatrimestre */}
        {Object.keys(bySemester).length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Total por Cuatrimestre
              </Text>
              
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Cuatrimestre</DataTable.Title>
                  <DataTable.Title numeric>Total Pagado</DataTable.Title>
                </DataTable.Header>

                {Object.entries(bySemester)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([semester, amount]) => (
                    <DataTable.Row key={semester}>
                      <DataTable.Cell>Cuatrimestre {semester}</DataTable.Cell>
                      <DataTable.Cell numeric>
                        {formatCurrency(amount)}
                      </DataTable.Cell>
                    </DataTable.Row>
                  ))}

                <DataTable.Row style={styles.totalRow}>
                  <DataTable.Cell>
                    <Text variant="titleSmall" style={styles.totalText}>
                      Total General
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    <Text variant="titleSmall" style={styles.totalText}>
                      {formatCurrency(totalPaid)}
                    </Text>
                  </DataTable.Cell>
                </DataTable.Row>
              </DataTable>
            </Card.Content>
          </Card>
        )}

        {/* Lista de Pagos */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Historial de Pagos ({payments.length})
              </Text>
              <View style={styles.headerActions}>
                <Button
                  mode="outlined"
                  icon="plus"
                  onPress={() => openPaymentModal()}
                  compact
                >
                  Agregar
                </Button>
                {payments.length > 0 && (
                  <Button
                    mode="outlined"
                    icon="delete"
                    textColor={MD3Colors.error50}
                    onPress={handleClearAll}
                    compact
                  >
                    Limpiar
                  </Button>
                )}
              </View>
            </View>

            <Divider style={styles.divider} />

            {payments.length === 0 ? (
              <View style={styles.emptyState}>
                <Text variant="bodyLarge" style={styles.emptyText}>
                  No hay pagos registrados
                </Text>
                <Text variant="bodyMedium" style={styles.emptySubtext}>
                  Presiona "Agregar" para registrar tu primer pago
                </Text>
                <Button
                  mode="contained"
                  icon="plus"
                  onPress={() => openPaymentModal()}
                  style={styles.addFirstButton}
                >
                  Registrar Primer Pago
                </Button>
              </View>
            ) : (
              payments.map((payment, index) => (
                <List.Item
                  key={payment.id}
                  title={`Cuatrimestre ${payment.semester}`}
                  description={payment.description || 'Pago de matrícula'}
                  left={props => (
                    <List.Icon 
                      {...props} 
                      icon="cash" 
                      color={MD3Colors.primary70}
                    />
                  )}
                  right={props => (
                    <View style={styles.paymentActions}>
                      <Text variant="bodyLarge" style={styles.paymentAmount}>
                        {formatCurrency(payment.amount)}
                      </Text>
                      <View style={styles.actionButtons}>
                        <Button
                          mode="text"
                          icon="pencil"
                          onPress={() => openPaymentModal(payment)}
                          compact
                        >
                          Editar
                        </Button>
                        <Button
                          mode="text"
                          icon="delete"
                          textColor={MD3Colors.error50}
                          onPress={() => handleDeletePayment(payment)}
                          compact
                        >
                          Eliminar
                        </Button>
                      </View>
                    </View>
                  )}
                  style={[
                    styles.listItem,
                    index === payments.length - 1 && styles.lastListItem
                  ]}
                />
              ))
            )}
          </Card.Content>
        </Card>

        
      </ScrollView>

      {/* Modal para agregar/editar pago */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            {editingPayment ? 'Editar Pago' : 'Registrar Pago'}
          </Text>

          <TextInput
            label="Cuatrimestre *"
            value={formData.semester}
            onChangeText={(text) => setFormData({ ...formData, semester: text })}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            placeholder="Ej: 5"
          />

          <TextInput
            label="Monto (RD$) *"
            value={formData.amount}
            onChangeText={(text) => setFormData({ ...formData, amount: text })}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            placeholder="Ej: 15250.00"
          />

          <TextInput
            label="Fecha *"
            value={formData.date}
            onChangeText={(text) => setFormData({ ...formData, date: text })}
            mode="outlined"
            style={styles.input}
            placeholder="YYYY-MM-DD"
          />

          <TextInput
            label="Descripción (opcional)"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={2}
            placeholder="Ej: Pago completo de matrícula cuatrimestre 5"
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
              onPress={handleSavePayment}
              style={styles.modalButton}
            >
              {editingPayment ? 'Actualizar' : 'Guardar'}
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
  summaryCard: {
    marginBottom: 16,
    backgroundColor: '#e8f5e8',
  },
  summaryTitle: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontWeight: 'bold',
    color: MD3Colors.primary40,
  },
  card: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  divider: {
    marginVertical: 12,
  },
  totalRow: {
    backgroundColor: '#f0f0f0',
  },
  totalText: {
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#666',
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#999',
    marginBottom: 24,
  },
  addFirstButton: {
    marginTop: 8,
  },
  listItem: {
    paddingLeft: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastListItem: {
    borderBottomWidth: 0,
  },
  paymentActions: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  infoCard: {
    marginBottom: 16,
    backgroundColor: '#fff3e0',
  },
  infoTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  infoText: {
    lineHeight: 20,
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

export default FinanceScreen;
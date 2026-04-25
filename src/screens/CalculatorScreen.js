import React, { useState } from 'react';
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
  MD3Colors,
  Modal,
  Portal,
  Switch,
} from 'react-native-paper';

const CalculatorScreen = ({ navigation }) => {
  const [fields, setFields] = useState([
    {
      id: 'credits',
      name: 'Créditos',
      amount: '2195',
      enabled: true,
      isDefault: true,
      creditsCount: '0',
      hasDiscount: false,
    },
    {
      id: 'discount',
      name: 'Descuento',
      amount: '10',
      enabled: true,
      isDefault: true,
      isPercentage: true,
    },
    {
      id: 'carnet',
      name: 'Carnet',
      amount: '500',
      enabled: true,
      isDefault: true,
    },
    {
      id: 'tech',
      name: 'Recursos tecnológicos',
      amount: '3625',
      enabled: true,
      isDefault: true,
    },
    {
      id: 'lab',
      name: 'Laboratorio Informática',
      amount: '955',
      enabled: true,
      isDefault: true,
      labCount: '1',   
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldAmount, setNewFieldAmount] = useState('');

  // ── Calcular totales ──────────────────────────────────────────
  const calculateTotals = () => {
    let subtotal = 0;
    let creditAmount = 0;
    let discountAmount = 0;

    const creditsField = fields.find(f => f.id === 'credits');
    const discountField = fields.find(f => f.id === 'discount');

    if (creditsField && creditsField.enabled) {
      const count = parseFloat(creditsField.creditsCount || '0');
      const price = parseFloat(creditsField.amount || '0');
      creditAmount = count * price;
      subtotal += creditAmount;
    }

    if (discountField && discountField.enabled && creditsField?.hasDiscount) {
      const pct = parseFloat(discountField.amount || '0');
      discountAmount = creditAmount * (pct / 100);
    }

    // Sumar todos los demás campos habilitados (incluido lab con su cantidad)
    const otherFieldsTotal = fields
      .filter(f => f.enabled && f.id !== 'credits' && f.id !== 'discount')
      .reduce((sum, f) => {
        if (f.id === 'lab') {
          const qty = parseFloat(f.labCount || '1');
          return sum + qty * parseFloat(f.amount || '0');
        }
        return sum + parseFloat(f.amount || '0');
      }, 0);

    const finalTotal = subtotal - discountAmount + otherFieldsTotal;

    return {
      subtotal: subtotal + otherFieldsTotal,
      discountAmount,
      finalTotal,
      creditsCount: creditsField?.creditsCount || '0',
      creditPrice: creditsField?.amount || '0',
      discountPercentage: discountField?.amount || '0',
    };
  };

  const {
    subtotal,
    discountAmount,
    finalTotal,
    creditsCount,
    creditPrice,
    discountPercentage,
  } = calculateTotals();

  // ── Helpers ───────────────────────────────────────────────────
  const updateField = (id, updates) => {
    setFields(prev => prev.map(f => (f.id === id ? { ...f, ...updates } : f)));
  };

  const toggleField = (id) => {
    setFields(prev => prev.map(f => (f.id === id ? { ...f, enabled: !f.enabled } : f)));
  };

  const deleteField = (id) => {
    const field = fields.find(f => f.id === id);
    if (field?.isDefault) {
      Alert.alert('No se puede eliminar', 'Este campo es predeterminado y no puede eliminarse.');
      return;
    }
    setFields(prev => prev.filter(f => f.id !== id));
  };

  const addNewField = () => {
    if (!newFieldName.trim() || !newFieldAmount.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre y monto válidos.');
      return;
    }
    const newField = {
      id: Date.now().toString(),
      name: newFieldName.trim(),
      amount: newFieldAmount,
      enabled: true,
      isDefault: false,
    };
    setFields(prev => [...prev, newField]);
    setNewFieldName('');
    setNewFieldAmount('');
    setModalVisible(false);
  };

  const resetFields = () => {
    setFields([
      {
        id: 'credits',
        name: 'Créditos',
        amount: '2195',
        enabled: true,
        isDefault: true,
        creditsCount: '0',
        hasDiscount: false,
      },
      {
        id: 'discount',
        name: 'Descuento',
        amount: '10',
        enabled: true,
        isDefault: true,
        isPercentage: true,
      },
      {
        id: 'carnet',
        name: 'Carnet',
        amount: '500',
        enabled: true,
        isDefault: true,
      },
      {
        id: 'tech',
        name: 'Recursos tecnológicos',
        amount: '3625',
        enabled: true,
        isDefault: true,
      },
      {
        id: 'lab',
        name: 'Laboratorio Informática',
        amount: '955',
        enabled: true,
        isDefault: true,
        labCount: '1',
      },
    ]);
  };

  // ── Render: campo Créditos ────────────────────────────────────
  const renderCreditsField = (field) => (
    <Card key={field.id} style={styles.fieldCard}>
      <Card.Content>
        <View style={styles.fieldHeader}>
          <View style={styles.fieldTitle}>
            <Text variant="titleMedium">{field.name}</Text>
            <Switch
              value={field.enabled}
              onValueChange={() => toggleField(field.id)}
              style={styles.toggleSwitch}
            />
          </View>
        </View>

        <View style={styles.creditsContainer}>
          <TextInput
            label="Cantidad de Créditos"
            value={field.creditsCount}
            onChangeText={(v) => updateField(field.id, { creditsCount: v })}
            keyboardType="numeric"
            mode="outlined"
            style={styles.creditsInput}
            disabled={!field.enabled}
          />
          <Text variant="bodyLarge" style={styles.timesText}>×</Text>
          <TextInput
            label="Precio por Crédito (RD$)"
            value={field.amount}
            onChangeText={(v) => updateField(field.id, { amount: v })}
            keyboardType="numeric"
            mode="outlined"
            style={styles.creditsInput}
            disabled={!field.enabled}
          />
        </View>

        <View style={styles.discountToggle}>
          <Text variant="bodyMedium">Aplicar descuento a créditos</Text>
          <Switch
            value={field.hasDiscount}
            onValueChange={(v) => updateField(field.id, { hasDiscount: v })}
          />
        </View>

        {field.enabled && (
          <View style={styles.fieldCalculation}>
            <Text variant="bodyMedium">
              {field.creditsCount || '0'} créditos × RD$ {field.amount} = RD${' '}
              {(
                parseFloat(field.creditsCount || '0') * parseFloat(field.amount || '0')
              ).toFixed(2)}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  // ── Render: campo Descuento ───────────────────────────────────
  const renderDiscountField = (field) => (
    <Card key={field.id} style={styles.fieldCard}>
      <Card.Content>
        <View style={styles.fieldHeader}>
          <View style={styles.fieldTitle}>
            <Text variant="titleMedium">{field.name}</Text>
            <Switch
              value={field.enabled}
              onValueChange={() => toggleField(field.id)}
              style={styles.toggleSwitch}
            />
          </View>
        </View>

        <TextInput
          label="Porcentaje de Descuento (%)"
          value={field.amount}
          onChangeText={(v) => updateField(field.id, { amount: v })}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
          disabled={!field.enabled}
        />

        {field.enabled && (
          <View style={styles.fieldCalculation}>
            <Text variant="bodyMedium">
              Descuento: {field.amount}%
              {parseFloat(creditsCount) > 0 && (
                <Text>
                  {' '}de RD$ {(
                    parseFloat(creditsCount || '0') * parseFloat(creditPrice || '0')
                  ).toFixed(2)}{' '}
                  = RD$ {discountAmount.toFixed(2)}
                </Text>
              )}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  // ── Render: campo Laboratorio Informática ─────────────────────
  const renderLabField = (field) => (
    <Card key={field.id} style={styles.fieldCard}>
      <Card.Content>
        <View style={styles.fieldHeader}>
          <View style={styles.fieldTitle}>
            <Text variant="titleMedium">{field.name}</Text>
            <Switch
              value={field.enabled}
              onValueChange={() => toggleField(field.id)}
              style={styles.toggleSwitch}
            />
          </View>
        </View>

        {/* Cantidad × Monto — igual que Créditos */}
        <View style={styles.creditsContainer}>
          <TextInput
            label="Cantidad"
            value={field.labCount}
            onChangeText={(v) => updateField(field.id, { labCount: v })}
            keyboardType="numeric"
            mode="outlined"
            style={styles.creditsInput}
            disabled={!field.enabled}
          />
          <Text variant="bodyLarge" style={styles.timesText}>×</Text>
          <TextInput
            label="Monto por Lab (RD$)"
            value={field.amount}
            onChangeText={(v) => updateField(field.id, { amount: v })}
            keyboardType="numeric"
            mode="outlined"
            style={styles.creditsInput}
            disabled={!field.enabled}
          />
        </View>

        {field.enabled && (
          <View style={styles.fieldCalculation}>
            <Text variant="bodyMedium">
              {field.labCount || '1'} × RD$ {field.amount} = RD${' '}
              {(
                parseFloat(field.labCount || '1') * parseFloat(field.amount || '0')
              ).toFixed(2)}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  // ── Render: campo normal ──────────────────────────────────────
  const renderNormalField = (field) => (
    <Card key={field.id} style={styles.fieldCard}>
      <Card.Content>
        <View style={styles.fieldHeader}>
          <View style={styles.fieldTitle}>
            <Text variant="titleMedium">{field.name}</Text>
            <Switch
              value={field.enabled}
              onValueChange={() => toggleField(field.id)}
              style={styles.toggleSwitch}
            />
          </View>
          {!field.isDefault && (
            <Button
              mode="text"
              icon="delete"
              textColor={MD3Colors.error50}
              onPress={() => deleteField(field.id)}
              compact
            >
              Eliminar
            </Button>
          )}
        </View>

        <TextInput
          label="Monto (RD$)"
          value={field.amount}
          onChangeText={(v) => updateField(field.id, { amount: v })}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
          disabled={!field.enabled}
        />

        {field.enabled && (
          <View style={styles.fieldCalculation}>
            <Text variant="bodyMedium">RD$ {field.amount}</Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  // ── JSX principal ─────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Calculadora de Matrícula" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        {/* Resumen */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.summaryTitle}>
              Resumen de Matrícula
            </Text>

            <View style={styles.summaryRow}>
              <Text variant="bodyMedium">Subtotal:</Text>
              <Text variant="bodyMedium">RD$ {subtotal.toFixed(2)}</Text>
            </View>

            {discountAmount > 0 && (
              <View style={styles.summaryRow}>
                <Text variant="bodyMedium">Descuento ({discountPercentage}%):</Text>
                <Text variant="bodyMedium" style={styles.discountText}>
                  -RD$ {discountAmount.toFixed(2)}
                </Text>
              </View>
            )}

            <Divider style={styles.divider} />

            <View style={styles.totalRow}>
              <Text variant="titleLarge">Total a Pagar:</Text>
              <Text variant="titleLarge" style={styles.totalAmount}>
                RD$ {finalTotal.toFixed(2)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Conceptos */}
        <Card style={styles.fieldsCard}>
          <Card.Content>
            <View style={styles.fieldsHeader}>
              <Text variant="titleMedium">Conceptos de Pago</Text>
              <View style={styles.headerActions}>
                <Button
                  mode="outlined"
                  icon="plus"
                  onPress={() => setModalVisible(true)}
                  compact
                >
                  Agregar
                </Button>
                <Button
                  mode="outlined"
                  icon="restore"
                  onPress={resetFields}
                  compact
                >
                  Restablecer
                </Button>
              </View>
            </View>

            <Divider style={styles.divider} />

            {fields.map(field => {
              if (field.id === 'credits') return renderCreditsField(field);
              if (field.id === 'discount') return renderDiscountField(field);
              if (field.id === 'lab') return renderLabField(field);
              return renderNormalField(field);
            })}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Modal agregar concepto */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            Agregar Concepto
          </Text>

          <TextInput
            label="Nombre del concepto"
            value={newFieldName}
            onChangeText={setNewFieldName}
            mode="outlined"
            style={styles.modalInput}
            placeholder="Ej: Seguro Estudiantil"
          />

          <TextInput
            label="Monto (RD$)"
            value={newFieldAmount}
            onChangeText={setNewFieldAmount}
            keyboardType="numeric"
            mode="outlined"
            style={styles.modalInput}
            placeholder="0.00"
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
              onPress={addNewField}
              style={styles.modalButton}
            >
              Agregar
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
    backgroundColor: '#e3f2fd',
  },
  summaryTitle: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  discountText: {
    color: MD3Colors.error50,
  },
  divider: {
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalAmount: {
    fontWeight: 'bold',
    color: MD3Colors.primary40,
  },
  fieldsCard: {
    marginBottom: 16,
  },
  fieldsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  fieldCard: {
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: MD3Colors.primary70,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fieldTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleSwitch: {
    marginLeft: 8,
  },
  creditsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  creditsInput: {
    flex: 1,
  },
  timesText: {
    marginHorizontal: 8,
    fontWeight: 'bold',
  },
  discountToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  input: {
    marginBottom: 8,
  },
  fieldCalculation: {
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    marginTop: 8,
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

export default CalculatorScreen;

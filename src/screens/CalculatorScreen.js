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
  List,
  Chip,
  MD3Colors,
  Modal,
  Portal,
  Switch,
} from 'react-native-paper';

const CalculatorScreen = ({ navigation }) => {
  // Estado para los campos predeterminados
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
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldAmount, setNewFieldAmount] = useState('');

  // Calcular totales
  const calculateTotals = () => {
    let subtotal = 0;
    let creditAmount = 0;
    let discountAmount = 0;
    let discountPercentage = 0;

    // Encontrar los valores de créditos y descuento
    const creditsField = fields.find(f => f.id === 'credits');
    const discountField = fields.find(f => f.id === 'discount');
    
    if (creditsField && creditsField.enabled) {
      const creditsCount = parseFloat(creditsField.creditsCount || '0');
      const creditPrice = parseFloat(creditsField.amount || '0');
      creditAmount = creditsCount * creditPrice;
      subtotal += creditAmount;
    }

    if (discountField && discountField.enabled && creditsField?.hasDiscount) {
      discountPercentage = parseFloat(discountField.amount || '0');
      discountAmount = creditAmount * (discountPercentage / 100);
    }

    // Sumar otros campos habilitados
    const otherFieldsTotal = fields
      .filter(field => 
        field.enabled && 
        field.id !== 'credits' && 
        field.id !== 'discount' &&
        !(field.id === 'credits' && field.hasDiscount) // No duplicar créditos con descuento
      )
      .reduce((sum, field) => sum + parseFloat(field.amount || '0'), 0);

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

  const { subtotal, discountAmount, finalTotal, creditsCount, creditPrice, discountPercentage } = calculateTotals();

  // Actualizar un campo
  const updateField = (id, updates) => {
    setFields(prev => prev.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  // Alternar habilitación de campo
  const toggleField = (id) => {
    setFields(prev => prev.map(field => 
      field.id === id ? { ...field, enabled: !field.enabled } : field
    ));
  };

  // Eliminar campo (solo si no es predeterminado)
  const deleteField = (id) => {
    const field = fields.find(f => f.id === id);
    if (field?.isDefault) {
      Alert.alert('No se puede eliminar', 'Este campo es predeterminado y no puede ser eliminado.');
      return;
    }

    setFields(prev => prev.filter(field => field.id !== id));
  };

  // Agregar nuevo campo
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

  // Restablecer campos predeterminados
  const resetFields = () => {
    setFields([
      {
        id: 'credits',
        name: 'Créditos',
        amount: '2050',
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
      },
    ]);
  };

  // Renderizar campo de créditos (especial)
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

        <View style={styles.creditsContainer}>
          <TextInput
            label="Cantidad de Créditos"
            value={field.creditsCount}
            onChangeText={(value) => updateField(field.id, { creditsCount: value })}
            keyboardType="numeric"
            mode="outlined"
            style={styles.creditsInput}
            disabled={!field.enabled}
          />
          
          <Text variant="bodyLarge" style={styles.timesText}>×</Text>
          
          <TextInput
            label="Precio por Crédito (RD$)"
            value={field.amount}
            onChangeText={(value) => updateField(field.id, { amount: value })}
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
            onValueChange={(value) => updateField(field.id, { hasDiscount: value })}
          />
        </View>

        {field.enabled && (
          <View style={styles.fieldCalculation}>
            <Text variant="bodyMedium">
              {field.creditsCount || '0'} créditos × RD$ {field.amount} = RD$ {(
                parseFloat(field.creditsCount || '0') * parseFloat(field.amount || '0')
              ).toFixed(2)}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  // Renderizar campo de descuento (especial)
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
          onChangeText={(value) => updateField(field.id, { amount: value })}
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
                  ).toFixed(2)} = RD$ {discountAmount.toFixed(2)}
                </Text>
              )}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  // Renderizar campo normal
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
          label={`Monto (RD$)`}
          value={field.amount}
          onChangeText={(value) => updateField(field.id, { amount: value })}
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

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Calculadora de Matrícula" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        {/* Resumen de Cálculos */}
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

        {/* Campos de Cálculo */}
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
              if (field.id === 'credits') {
                return renderCreditsField(field);
              } else if (field.id === 'discount') {
                return renderDiscountField(field);
              } else {
                return renderNormalField(field);
              }
            })}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Modal para agregar nuevo campo */}
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
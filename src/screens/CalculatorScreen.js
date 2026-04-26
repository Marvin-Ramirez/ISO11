import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Appbar, Card, Text, Button, TextInput,
  Divider, MD3Colors, Modal, Portal, Switch,
} from 'react-native-paper';
import { useAppTheme } from '../context/ThemeContext';

const CalculatorScreen = ({ navigation }) => {
  const { colors } = useAppTheme();

  const [fields, setFields] = useState([
    { id: 'credits', name: 'Créditos', amount: '2195', enabled: true, isDefault: true, creditsCount: '0', hasDiscount: false },
    { id: 'discount', name: 'Descuento', amount: '10', enabled: true, isDefault: true, isPercentage: true },
    { id: 'carnet', name: 'Carnet', amount: '500', enabled: true, isDefault: true },
    { id: 'tech', name: 'Recursos tecnológicos', amount: '3625', enabled: true, isDefault: true },
    { id: 'lab', name: 'Laboratorio Informática', amount: '955', enabled: true, isDefault: true, labCount: '1' },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldAmount, setNewFieldAmount] = useState('');

  const calculateTotals = () => {
    let creditAmount = 0;
    let discountAmount = 0;
    const creditsField = fields.find(f => f.id === 'credits');
    const discountField = fields.find(f => f.id === 'discount');

    if (creditsField?.enabled) {
      creditAmount = parseFloat(creditsField.creditsCount || '0') * parseFloat(creditsField.amount || '0');
    }
    if (discountField?.enabled && creditsField?.hasDiscount) {
      discountAmount = creditAmount * (parseFloat(discountField.amount || '0') / 100);
    }
    const otherFieldsTotal = fields
      .filter(f => f.enabled && f.id !== 'credits' && f.id !== 'discount')
      .reduce((sum, f) => {
        if (f.id === 'lab') return sum + parseFloat(f.labCount || '1') * parseFloat(f.amount || '0');
        return sum + parseFloat(f.amount || '0');
      }, 0);

    const subtotal = creditAmount + otherFieldsTotal;
    return {
      subtotal,
      discountAmount,
      finalTotal: subtotal - discountAmount,
      creditsCount: creditsField?.creditsCount || '0',
      creditPrice: creditsField?.amount || '0',
      discountPercentage: discountField?.amount || '0',
    };
  };

  const { subtotal, discountAmount, finalTotal, creditsCount, creditPrice, discountPercentage } = calculateTotals();

  const updateField = (id, updates) => setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  const toggleField = (id) => setFields(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  const deleteField = (id) => {
    if (fields.find(f => f.id === id)?.isDefault) {
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
    setFields(prev => [...prev, { id: Date.now().toString(), name: newFieldName.trim(), amount: newFieldAmount, enabled: true, isDefault: false }]);
    setNewFieldName(''); setNewFieldAmount(''); setModalVisible(false);
  };

  const resetFields = () => setFields([
    { id: 'credits', name: 'Créditos', amount: '2195', enabled: true, isDefault: true, creditsCount: '0', hasDiscount: false },
    { id: 'discount', name: 'Descuento', amount: '10', enabled: true, isDefault: true, isPercentage: true },
    { id: 'carnet', name: 'Carnet', amount: '500', enabled: true, isDefault: true },
    { id: 'tech', name: 'Recursos tecnológicos', amount: '3625', enabled: true, isDefault: true },
    { id: 'lab', name: 'Laboratorio Informática', amount: '955', enabled: true, isDefault: true, labCount: '1' },
  ]);

  const styles = makeStyles(colors);

  const renderCreditsField = (field) => (
    <Card key={field.id} style={styles.fieldCard}>
      <Card.Content>
        <View style={styles.fieldHeader}>
          <View style={styles.fieldTitle}>
            <Text variant="titleMedium" style={styles.fieldName}>{field.name}</Text>
            <Switch value={field.enabled} onValueChange={() => toggleField(field.id)} style={styles.toggleSwitch} />
          </View>
        </View>
        <View style={styles.creditsContainer}>
          <TextInput label="Cantidad de Créditos" value={field.creditsCount} onChangeText={v => updateField(field.id, { creditsCount: v })} keyboardType="numeric" mode="outlined" style={styles.creditsInput} disabled={!field.enabled} />
          <Text variant="bodyLarge" style={styles.timesText}>×</Text>
          <TextInput label="Precio por Crédito (RD$)" value={field.amount} onChangeText={v => updateField(field.id, { amount: v })} keyboardType="numeric" mode="outlined" style={styles.creditsInput} disabled={!field.enabled} />
        </View>
        <View style={styles.discountToggle}>
          <Text variant="bodyMedium" style={styles.bodyText}>Aplicar descuento a créditos</Text>
          <Switch value={field.hasDiscount} onValueChange={v => updateField(field.id, { hasDiscount: v })} />
        </View>
        {field.enabled && (
          <View style={styles.fieldCalculation}>
            <Text variant="bodyMedium" style={styles.calcText}>
              {field.creditsCount || '0'} créditos × RD$ {field.amount} = RD$ {(parseFloat(field.creditsCount || '0') * parseFloat(field.amount || '0')).toFixed(2)}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderDiscountField = (field) => (
    <Card key={field.id} style={styles.fieldCard}>
      <Card.Content>
        <View style={styles.fieldHeader}>
          <View style={styles.fieldTitle}>
            <Text variant="titleMedium" style={styles.fieldName}>{field.name}</Text>
            <Switch value={field.enabled} onValueChange={() => toggleField(field.id)} style={styles.toggleSwitch} />
          </View>
        </View>
        <TextInput label="Porcentaje de Descuento (%)" value={field.amount} onChangeText={v => updateField(field.id, { amount: v })} keyboardType="numeric" mode="outlined" style={styles.input} disabled={!field.enabled} />
        {field.enabled && (
          <View style={styles.fieldCalculation}>
            <Text variant="bodyMedium" style={styles.calcText}>
              Descuento: {field.amount}%{parseFloat(creditsCount) > 0 ? ` de RD$ ${(parseFloat(creditsCount) * parseFloat(creditPrice)).toFixed(2)} = RD$ ${discountAmount.toFixed(2)}` : ''}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderLabField = (field) => (
    <Card key={field.id} style={styles.fieldCard}>
      <Card.Content>
        <View style={styles.fieldHeader}>
          <View style={styles.fieldTitle}>
            <Text variant="titleMedium" style={styles.fieldName}>{field.name}</Text>
            <Switch value={field.enabled} onValueChange={() => toggleField(field.id)} style={styles.toggleSwitch} />
          </View>
        </View>
        <View style={styles.creditsContainer}>
          <TextInput label="Cantidad" value={field.labCount} onChangeText={v => updateField(field.id, { labCount: v })} keyboardType="numeric" mode="outlined" style={styles.creditsInput} disabled={!field.enabled} />
          <Text variant="bodyLarge" style={styles.timesText}>×</Text>
          <TextInput label="Monto por Laboratorio (RD$)" value={field.amount} onChangeText={v => updateField(field.id, { amount: v })} keyboardType="numeric" mode="outlined" style={styles.creditsInput} disabled={!field.enabled} />
        </View>
        {field.enabled && (
          <View style={styles.fieldCalculation}>
            <Text variant="bodyMedium" style={styles.calcText}>
              {field.labCount || '1'} × RD$ {field.amount} = RD$ {(parseFloat(field.labCount || '1') * parseFloat(field.amount || '0')).toFixed(2)}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderNormalField = (field) => (
    <Card key={field.id} style={styles.fieldCard}>
      <Card.Content>
        <View style={styles.fieldHeader}>
          <View style={styles.fieldTitle}>
            <Text variant="titleMedium" style={styles.fieldName}>{field.name}</Text>
            <Switch value={field.enabled} onValueChange={() => toggleField(field.id)} style={styles.toggleSwitch} />
          </View>
          {!field.isDefault && (
            <Button mode="text" icon="delete" textColor={MD3Colors.error50} onPress={() => deleteField(field.id)} compact>Eliminar</Button>
          )}
        </View>
        <TextInput label="Monto (RD$)" value={field.amount} onChangeText={v => updateField(field.id, { amount: v })} keyboardType="numeric" mode="outlined" style={styles.input} disabled={!field.enabled} />
        {field.enabled && (
          <View style={styles.fieldCalculation}>
            <Text variant="bodyMedium" style={styles.calcText}>RD$ {field.amount}</Text>
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
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.summaryTitle}>Resumen de Matrícula</Text>
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={styles.bodyText}>Subtotal:</Text>
              <Text variant="bodyMedium" style={styles.bodyText}>RD$ {subtotal.toFixed(2)}</Text>
            </View>
            {discountAmount > 0 && (
              <View style={styles.summaryRow}>
                <Text variant="bodyMedium" style={styles.bodyText}>Descuento ({discountPercentage}%):</Text>
                <Text variant="bodyMedium" style={styles.discountText}>-RD$ {discountAmount.toFixed(2)}</Text>
              </View>
            )}
            <Divider style={styles.divider} />
            <View style={styles.totalRow}>
              <Text variant="titleLarge" style={styles.bodyText}>Total a Pagar:</Text>
              <Text variant="titleLarge" style={styles.totalAmount}>RD$ {finalTotal.toFixed(2)}</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.fieldsCard}>
          <Card.Content>
            <View style={styles.fieldsHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Conceptos de Pago</Text>
              <View style={styles.headerActions}>
                <Button mode="outlined" icon="plus" onPress={() => setModalVisible(true)} compact>Agr...</Button>
                <Button mode="outlined" icon="restore" onPress={resetFields} compact>Rest...</Button>
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

      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modal}>
          <Text variant="titleLarge" style={styles.modalTitle}>Agregar Concepto</Text>
          <TextInput label="Nombre del concepto" value={newFieldName} onChangeText={setNewFieldName} mode="outlined" style={styles.modalInput} placeholder="Ej: Seguro Estudiantil" />
          <TextInput label="Monto (RD$)" value={newFieldAmount} onChangeText={setNewFieldAmount} keyboardType="numeric" mode="outlined" style={styles.modalInput} placeholder="0.00" />
          <View style={styles.modalActions}>
            <Button mode="outlined" onPress={() => setModalVisible(false)} style={styles.modalButton}>Cancelar</Button>
            <Button mode="contained" onPress={addNewField} style={styles.modalButton}>Agregar</Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1, padding: 16 },
  summaryCard: { marginBottom: 16, backgroundColor: colors.calcSummaryBg },
  summaryTitle: { textAlign: 'center', marginBottom: 16, fontWeight: 'bold', color: colors.text },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  bodyText: { color: colors.text },
  discountText: { color: MD3Colors.error50 },
  divider: { marginVertical: 12, backgroundColor: colors.divider },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalAmount: { fontWeight: 'bold', color: MD3Colors.primary40 },
  fieldsCard: { marginBottom: 16, backgroundColor: colors.surface },
  fieldsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontWeight: 'bold', color: colors.text },
  headerActions: { flexDirection: 'row', gap: 8 },
  fieldCard: { marginBottom: 12, borderLeftWidth: 4, borderLeftColor: MD3Colors.primary70, backgroundColor: colors.surface },
  fieldHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  fieldTitle: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  fieldName: { color: colors.text, flex: 1 },
  toggleSwitch: { marginLeft: 8 },
  creditsContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  creditsInput: { flex: 1 },
  timesText: { marginHorizontal: 8, fontWeight: 'bold', color: colors.text },
  discountToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: 8, backgroundColor: colors.discountToggleBg, borderRadius: 4 },
  input: { marginBottom: 8 },
  fieldCalculation: { padding: 8, backgroundColor: colors.subtleBg2, borderRadius: 4, marginTop: 8 },
  calcText: { color: colors.textSecondary },
  modal: { backgroundColor: colors.surface, margin: 20, padding: 20, borderRadius: 8 },
  modalTitle: { marginBottom: 20, textAlign: 'center', color: colors.text },
  modalInput: { marginBottom: 12 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 8 },
  modalButton: { minWidth: 100 },
});

export default CalculatorScreen;
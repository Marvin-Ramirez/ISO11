import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Appbar, Card, Text, Button, Chip,
  Divider, MD3Colors, Menu,
} from 'react-native-paper';
import { useApp } from '../context/AppContext';
import { useAppTheme } from '../context/ThemeContext';

const SavedPlansScreen = ({ navigation }) => {
  const { savedPlans, deletePlan, clearAllPlans } = useApp();
  const { colors } = useAppTheme();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleDeletePlan = (plan) => {
    Alert.alert(
      'Eliminar Plan',
      `¿Eliminar el plan "${plan.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: async () => {
            const result = await deletePlan(plan.id);
            if (result.success) Alert.alert('✅ Plan Eliminado', `"${plan.name}" eliminado.`);
            else Alert.alert('Error', result.error || 'No se pudo eliminar.');
          },
        },
      ]
    );
  };

  const handleClearAllPlans = () => {
    if (savedPlans.length === 0) return;
    Alert.alert(
      'Eliminar Todos los Planes',
      `¿Eliminar todos los planes (${savedPlans.length})?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar Todos', style: 'destructive',
          onPress: async () => {
            const result = await clearAllPlans();
            if (result.success) Alert.alert('✅ Planes Eliminados', 'Todos los planes eliminados.');
            else Alert.alert('Error', result.error || 'No se pudieron eliminar.');
          },
        },
      ]
    );
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const viewPlanDetails = (plan) => {
    Alert.alert(
      `📋 ${plan.name}`,
      `Materias: ${plan.subjectCount}\nCréditos: ${plan.totalCredits}\nCreado: ${formatDate(plan.createdAt)}`,
      [
        { text: 'Cerrar', style: 'cancel' },
        {
          text: 'Ver Detalles',
          onPress: () => Alert.alert(
            'Materias en este plan:',
            plan.subjects.map(s => `• ${s.code} - ${s.name} (${s.credits} créditos)`).join('\n')
          ),
        },
      ]
    );
  };

  const styles = makeStyles(colors);

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Planes Guardados" />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Appbar.Action icon="dots-vertical" onPress={() => setMenuVisible(true)} />
          }
        >
          <Menu.Item
            leadingIcon="delete-sweep"
            onPress={() => { setMenuVisible(false); handleClearAllPlans(); }}
            title="Eliminar Todos"
            disabled={savedPlans.length === 0}
          />
        </Menu>
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        {savedPlans.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text variant="titleLarge" style={styles.emptyText}>No hay planes guardados</Text>
              <Text variant="bodyMedium" style={styles.emptySubtext}>
                Crea tu primer plan en la pantalla de planificación
              </Text>
              <Button mode="contained" icon="plus" onPress={() => navigation.navigate('Planning')} style={styles.createButton}>
                Crear Plan
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <>
            {/* Resumen */}
            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.sectionTitle}>Resumen</Text>
                <View style={styles.stats}>
                  <View style={styles.statItem}>
                    <Text variant="headlineMedium" style={styles.statNumber}>{savedPlans.length}</Text>
                    <Text variant="bodyMedium" style={styles.bodyText}>Planes</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text variant="headlineMedium" style={styles.statNumber}>
                      {savedPlans.reduce((max, p) => Math.max(max, p.totalCredits), 0)}
                    </Text>
                    <Text variant="bodyMedium" style={styles.bodyText}>Máx. créditos</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Lista de planes */}
            {savedPlans.map(plan => (
              <Card key={plan.id} style={styles.planCard}>
                <Card.Content>
                  <View style={styles.planHeader}>
                    <Text variant="titleMedium" style={styles.planName}>{plan.name}</Text>
                    <Chip mode="outlined" compact>{plan.totalCredits} cr</Chip>
                  </View>
                  <View style={styles.planDetails}>
                    <Text variant="bodyMedium" style={styles.bodyText}>
                      {plan.subjectCount} materias • {formatDate(plan.createdAt)}
                    </Text>
                  </View>
                  <Divider style={styles.divider} />
                  <View style={styles.planActions}>
                    <Button mode="outlined" compact onPress={() => viewPlanDetails(plan)} style={styles.planActionButton}>
                      Ver Detalles
                    </Button>
                    <Button mode="outlined" compact textColor={MD3Colors.error50} onPress={() => handleDeletePlan(plan)} style={styles.planActionButton}>
                      Eliminar
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1, padding: 16 },
  emptyCard: { marginTop: 40, backgroundColor: colors.surface },
  emptyContent: { alignItems: 'center', padding: 32 },
  emptyText: { textAlign: 'center', marginBottom: 8, color: colors.text },
  emptySubtext: { textAlign: 'center', color: colors.textSecondary, marginBottom: 24 },
  createButton: { marginTop: 8 },
  summaryCard: { marginBottom: 16, backgroundColor: colors.surface },
  sectionTitle: { marginBottom: 16, fontWeight: 'bold', color: colors.text },
  stats: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNumber: { fontWeight: 'bold', color: MD3Colors.primary40 },
  bodyText: { color: colors.text },
  planCard: { marginBottom: 12, backgroundColor: colors.surface },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  planName: { flex: 1, marginRight: 8, fontWeight: 'bold', color: colors.text },
  planDetails: { marginBottom: 12 },
  divider: { marginVertical: 8, backgroundColor: colors.divider },
  planActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  planActionButton: { minWidth: 100 },
});

export default SavedPlansScreen;
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
  Chip,
  Divider,
  List,
  MD3Colors,
  Menu,
} from 'react-native-paper';
import { useApp } from '../context/AppContext';

const SavedPlansScreen = ({ navigation }) => {
  const { savedPlans, deletePlan, clearAllPlans } = useApp();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleDeletePlan = (plan) => {
    Alert.alert(
      'Eliminar Plan',
      `¿Estás seguro de que quieres eliminar el plan "${plan.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const result = await deletePlan(plan.id);
            if (result.success) {
              Alert.alert('✅ Plan Eliminado', `"${plan.name}" ha sido eliminado.`);
            } else {
              Alert.alert('Error', result.error || 'No se pudo eliminar el plan.');
            }
          },
        },
      ]
    );
  };

  const handleClearAllPlans = () => {
    if (savedPlans.length === 0) return;

    Alert.alert(
      'Eliminar Todos los Planes',
      `¿Estás seguro de que quieres eliminar todos los planes (${savedPlans.length})?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar Todos',
          style: 'destructive',
          onPress: async () => {
            const result = await clearAllPlans();
            if (result.success) {
              Alert.alert('✅ Planes Eliminados', 'Todos los planes han sido eliminados.');
            } else {
              Alert.alert('Error', result.error || 'No se pudieron eliminar los planes.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const viewPlanDetails = (plan) => {
    Alert.alert(
      `📋 ${plan.name}`,
      `Materias: ${plan.subjectCount}\nCréditos: ${plan.totalCredits}\nCreado: ${formatDate(plan.createdAt)}`,
      [
        { text: 'Cerrar', style: 'cancel' },
        {
          text: 'Ver Detalles',
          onPress: () => {
            // Aquí podríamos navegar a una pantalla de detalles del plan
            Alert.alert(
              'Materias en este plan:',
              plan.subjects.map(subject => 
                `• ${subject.code} - ${subject.name} (${subject.credits} créditos)`
              ).join('\n')
            );
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Planes Guardados" />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Appbar.Action 
              icon="dots-vertical" 
              onPress={() => setMenuVisible(true)} 
            />
          }
        >
          <Menu.Item
            leadingIcon="delete-sweep"
            onPress={() => {
              setMenuVisible(false);
              handleClearAllPlans();
            }}
            title="Eliminar Todos"
            disabled={savedPlans.length === 0}
          />
        </Menu>
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        {savedPlans.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text variant="titleLarge" style={styles.emptyText}>
                No hay planes guardados
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtext}>
                Crea tu primer plan en la pantalla de planificación
              </Text>
              <Button
                mode="contained"
                icon="plus"
                onPress={() => navigation.navigate('Planning')}
                style={styles.createButton}
              >
                Crear Plan
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <>
            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Resumen
                </Text>
                <View style={styles.stats}>
                  <View style={styles.statItem}>
                    <Text variant="headlineMedium" style={styles.statNumber}>
                      {savedPlans.length}
                    </Text>
                    <Text variant="bodyMedium">Planes</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text variant="headlineMedium" style={styles.statNumber}>
                      {savedPlans.reduce((max, plan) => Math.max(max, plan.totalCredits), 0)}
                    </Text>
                    <Text variant="bodyMedium">Máx. créditos</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {savedPlans.map((plan, index) => (
              <Card key={plan.id} style={styles.planCard}>
                <Card.Content>
                  <View style={styles.planHeader}>
                    <Text variant="titleMedium" style={styles.planName}>
                      {plan.name}
                    </Text>
                    <Chip mode="outlined" compact>
                      {plan.totalCredits} cr
                    </Chip>
                  </View>
                  
                  <View style={styles.planDetails}>
                    <Text variant="bodyMedium">
                      {plan.subjectCount} materias • {formatDate(plan.createdAt)}
                    </Text>
                  </View>

                  <Divider style={styles.divider} />

                  <View style={styles.planActions}>
                    <Button
                      mode="outlined"
                      compact
                      onPress={() => viewPlanDetails(plan)}
                      style={styles.planActionButton}
                    >
                      Ver Detalles
                    </Button>
                    <Button
                      mode="outlined"
                      compact
                      textColor="red"
                      onPress={() => handleDeletePlan(plan)}
                      style={styles.planActionButton}
                    >
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  emptyCard: {
    marginTop: 40,
  },
  emptyContent: {
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
  createButton: {
    marginTop: 8,
  },
  summaryCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: 'bold',
    color: MD3Colors.primary40,
  },
  planCard: {
    marginBottom: 12,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  planName: {
    flex: 1,
    marginRight: 8,
    fontWeight: 'bold',
  },
  planDetails: {
    marginBottom: 12,
  },
  divider: {
    marginVertical: 8,
  },
  planActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  planActionButton: {
    minWidth: 100,
  },
});

export default SavedPlansScreen;
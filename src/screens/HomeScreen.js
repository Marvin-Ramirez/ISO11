import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Appbar,
  Card,
  Text,
  ProgressBar,
  Button,
  Chip,
  Divider,
  List,
  MD3Colors,
} from 'react-native-paper';
import { useApp } from '../context/AppContext';

const HomeScreen = ({ navigation }) => {
  const { 
    subjects, 
    getStatistics, 
    getSubjectsBySemester, 
    toggleSubjectCompletion 
  } = useApp();
  
  const [currentSemester, setCurrentSemester] = useState(1);
  const [statistics, setStatistics] = useState({
    totalSubjects: 0,
    completedSubjects: 0,
    totalCredits: 0,
    completedCredits: 0,
  });

  useEffect(() => {
    calculateStatistics();
  }, [subjects, currentSemester]);

  const calculateStatistics = () => {
    const stats = getStatistics();
    setStatistics(stats);
  };

  const getProgressPercentage = () => {
    if (statistics.totalSubjects === 0) return 0;
    return statistics.completedSubjects / statistics.totalSubjects;
  };

  const getCreditsProgressPercentage = () => {
    if (statistics.totalCredits === 0) return 0;
    return statistics.completedCredits / statistics.totalCredits;
  };

  const getCurrentSemesterProgress = () => {
    const currentSemesterSubjects = getSubjectsBySemester(currentSemester);
    if (currentSemesterSubjects.length === 0) return 0;
    const completed = currentSemesterSubjects.filter(s => s.completed).length;
    return completed / currentSemesterSubjects.length;
  };

  const getNextSemesterRecommendation = () => {
    const nextSemester = currentSemester + 1;
    const nextSemesterSubjects = getSubjectsBySemester(nextSemester);
    
    if (nextSemesterSubjects.length === 0) return null;

    const availableSubjects = nextSemesterSubjects.filter(subject => {
      return subject.prerequisites.every(prereqCode => {
        const prereqSubject = subjects.find(s => s.code === prereqCode);
        return prereqSubject && prereqSubject.completed;
      });
    });

    return {
      semester: nextSemester,
      subjects: availableSubjects,
      totalCredits: availableSubjects.reduce((sum, subject) => sum + subject.credits, 0)
    };
  };

  const nextSemesterRecommendation = getNextSemesterRecommendation();
  const currentSemesterSubjects = getSubjectsBySemester(currentSemester);
  const currentSemesterCompleted = currentSemesterSubjects.filter(s => s.completed).length;

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Mi Progreso ISO11" />
        <Appbar.Action 
          icon="pencil" 
          onPress={() => navigation.navigate('EditPensum')} 
        />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        <Card style={styles.semesterSelectorCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Cuatrimestre Actual
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.semesterScroll}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(semester => (
                <Chip
                  key={semester}
                  selected={currentSemester === semester}
                  onPress={() => setCurrentSemester(semester)}
                  style={styles.semesterChip}
                  showSelectedOverlay
                >
                  {semester}
                </Chip>
              ))}
            </ScrollView>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Progreso General
            </Text>
            
            <View style={styles.progressSection}>
              <View style={styles.progressItem}>
                <Text variant="bodyMedium">Materias</Text>
                <Text variant="bodyLarge" style={styles.progressText}>
                  {statistics.completedSubjects} / {statistics.totalSubjects}
                </Text>
                <ProgressBar 
                  progress={getProgressPercentage()} 
                  color={MD3Colors.primary70}
                  style={styles.progressBar}
                />
              </View>

              <View style={styles.progressItem}>
                <Text variant="bodyMedium">Créditos</Text>
                <Text variant="bodyLarge" style={styles.progressText}>
                  {statistics.completedCredits} / {statistics.totalCredits}
                </Text>
                <ProgressBar 
                  progress={getCreditsProgressPercentage()} 
                  color={MD3Colors.secondary70}
                  style={styles.progressBar}
                />
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text variant="headlineSmall" style={styles.statNumber}>
                  {statistics.completedSubjects}
                </Text>
                <Text variant="bodySmall">Aprobadas</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineSmall" style={styles.statNumber}>
                  {statistics.totalSubjects - statistics.completedSubjects}
                </Text>
                <Text variant="bodySmall">Faltantes</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineSmall" style={styles.statNumber}>
                  {statistics.completedCredits}
                </Text>
                <Text variant="bodySmall">Créditos</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineSmall" style={styles.statNumber}>
                  {statistics.totalCredits - statistics.completedCredits}
                </Text>
                <Text variant="bodySmall">Faltan</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Cuatrimestre {currentSemester}
            </Text>
            <Text variant="bodyMedium" style={styles.progressText}>
              {currentSemesterCompleted} de {currentSemesterSubjects.length} materias
            </Text>
            <ProgressBar 
              progress={getCurrentSemesterProgress()} 
              color={MD3Colors.tertiary70}
              style={styles.progressBar}
            />

            <Divider style={styles.divider} />

            <Text variant="titleSmall" style={styles.subsectionTitle}>
              Materias del Cuatrimestre
            </Text>
            {currentSemesterSubjects.map(subject => (
              <List.Item
                key={subject.id}
                title={subject.name}
                description={`${subject.code} - ${subject.credits} créditos`}
                left={props => (
                  <List.Icon 
                    {...props} 
                    icon={subject.completed ? "check-circle" : "circle-outline"}
                    color={subject.completed ? MD3Colors.primary70 : MD3Colors.neutral70}
                  />
                )}
                right={props => (
                  <Button
                    mode={subject.completed ? "contained-tonal" : "outlined"}
                    compact
                    onPress={() => toggleSubjectCompletion(subject.id)}
                  >
                    {subject.completed ? "Aprobada" : "Marcar"}
                  </Button>
                )}
                style={styles.listItem}
              />
            ))}

            {currentSemesterSubjects.length === 0 && (
              <Text variant="bodyMedium" style={styles.emptyText}>
                No hay materias en este cuatrimestre
              </Text>
            )}
          </Card.Content>
        </Card>

        {nextSemesterRecommendation && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Próximo Cuatrimestre ({nextSemesterRecommendation.semester})
              </Text>
              <Text variant="bodyMedium">
                Materias disponibles basadas en prerrequisitos completados:
              </Text>
              
              {nextSemesterRecommendation.subjects.map(subject => (
                <List.Item
                  key={subject.id}
                  title={subject.name}
                  description={`${subject.code} - ${subject.credits} créditos`}
                  left={props => <List.Icon {...props} icon="book" />}
                  style={styles.listItem}
                />
              ))}

              <View style={styles.creditsSummary}>
                <Chip mode="outlined" icon="calculator">
                  Total: {nextSemesterRecommendation.totalCredits} créditos
                </Chip>
              </View>

              <Button 
                mode="contained" 
                icon="plus"
                onPress={() => navigation.navigate('Planning', { 
                  recommendedSubjects: nextSemesterRecommendation.subjects 
                })}
                style={styles.planButton}
              >
                Planificar Próximo Cuatrimestre
              </Button>
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Acciones Rápidas
            </Text>
            <View style={styles.actionsGrid}>
              <Button 
                mode="outlined" 
                icon="calculator"
                onPress={() => navigation.navigate('Calculator')}
                style={styles.actionButton}
                contentStyle={styles.actionButtonContent}
              >
                Calculadora
              </Button>
              <Button 
                mode="outlined" 
                icon="chart-bar"
                onPress={() => navigation.navigate('Finance')}
                style={styles.actionButton}
                contentStyle={styles.actionButtonContent}
              >
                Pagos
              </Button>
              <Button 
                mode="outlined" 
                icon="calendar"
                onPress={() => navigation.navigate('Planning')}
                style={styles.actionButton}
                contentStyle={styles.actionButtonContent}
              >
                Planificación
              </Button>
              <Button 
                mode="outlined" 
                icon="calendar-clock"
                onPress={() => navigation.navigate('Schedule')}
                style={styles.actionButton}
                contentStyle={styles.actionButtonContent}
              >
                Horario
              </Button>
            </View>
          </Card.Content>
        </Card>
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
  semesterSelectorCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  semesterScroll: {
    marginHorizontal: -4,
  },
  semesterChip: {
    marginHorizontal: 4,
    marginBottom: 4,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressItem: {
    marginBottom: 16,
  },
  progressText: {
    marginBottom: 8,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontWeight: 'bold',
    color: MD3Colors.primary40,
  },
  divider: {
    marginVertical: 16,
  },
  subsectionTitle: {
    marginBottom: 12,
    color: MD3Colors.neutral50,
  },
  listItem: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  emptyText: {
    textAlign: 'center',
    color: MD3Colors.neutral50,
    fontStyle: 'italic',
    marginVertical: 16,
  },
  creditsSummary: {
    alignItems: 'center',
    marginVertical: 12,
  },
  planButton: {
    marginTop: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minWidth: '48%',
    marginBottom: 8,
  },
  actionButtonContent: {
    height: 80,
  },
});

export default HomeScreen;
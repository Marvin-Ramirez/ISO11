import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
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
import { useAppTheme } from '../context/ThemeContext';

const HomeScreen = ({ navigation }) => {
  const { subjects, getStatistics, getSubjectsBySemester, toggleSubjectCompletion } = useApp();
  const { isDark, toggleTheme, colors } = useAppTheme();

  const [currentSemester, setCurrentSemester] = useState(1);
  const [statistics, setStatistics] = useState({
    totalSubjects: 0,
    completedSubjects: 0,
    totalCredits: 0,
    completedCredits: 0,
  });

  useEffect(() => {
    setStatistics(getStatistics());
  }, [subjects, currentSemester]);

  const getProgressPercentage = () =>
    statistics.totalSubjects === 0 ? 0 : statistics.completedSubjects / statistics.totalSubjects;

  const getCreditsProgressPercentage = () =>
    statistics.totalCredits === 0 ? 0 : statistics.completedCredits / statistics.totalCredits;

  const getCurrentSemesterProgress = () => {
    const subs = getSubjectsBySemester(currentSemester);
    if (subs.length === 0) return 0;
    return subs.filter(s => s.completed).length / subs.length;
  };

  const getNextSemesterRecommendation = () => {
    const nextSemester = currentSemester + 1;
    const nextSubs = getSubjectsBySemester(nextSemester);
    if (nextSubs.length === 0) return null;
    const available = nextSubs.filter(s =>
      s.prerequisites.every(code => {
        const pre = subjects.find(x => x.code === code);
        return pre && pre.completed;
      })
    );
    return {
      semester: nextSemester,
      subjects: available,
      totalCredits: available.reduce((sum, s) => sum + s.credits, 0),
    };
  };

  const nextRec = getNextSemesterRecommendation();
  const currentSubs = getSubjectsBySemester(currentSemester);
  const currentCompleted = currentSubs.filter(s => s.completed).length;

  const styles = makeStyles(colors);

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Mi Progreso ISO11" />
        <Appbar.Action
          icon={isDark ? 'weather-sunny' : 'weather-night'}
          onPress={toggleTheme}
        />
        <Appbar.Action
          icon="pencil"
          onPress={() => navigation.navigate('EditPensum')}
        />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        {/* Selector de cuatrimestre */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Cuatrimestre Actual
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.semesterScroll}>
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(sem => (
                <Chip
                  key={sem}
                  selected={currentSemester === sem}
                  onPress={() => setCurrentSemester(sem)}
                  style={styles.semesterChip}
                  showSelectedOverlay
                >
                  {sem}
                </Chip>
              ))}
            </ScrollView>
          </Card.Content>
        </Card>

        {/* Progreso General */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Progreso General
            </Text>

            <View style={styles.progressSection}>
              <View style={styles.progressItem}>
                <Text variant="bodyMedium" style={styles.progressLabel}>Materias</Text>
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
                <Text variant="bodyMedium" style={styles.progressLabel}>Créditos</Text>
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
              {[
                { value: statistics.completedSubjects, label: 'Aprobadas' },
                { value: statistics.totalSubjects - statistics.completedSubjects, label: 'Faltantes' },
                { value: statistics.completedCredits, label: 'Créditos' },
                { value: statistics.totalCredits - statistics.completedCredits, label: 'Faltan' },
              ].map((item, i) => (
                <View key={i} style={styles.statItem}>
                  <Text variant="headlineSmall" style={styles.statNumber}>{item.value}</Text>
                  <Text variant="bodySmall" style={styles.statLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Cuatrimestre actual */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Cuatrimestre {currentSemester}
            </Text>
            <Text variant="bodyMedium" style={styles.progressText}>
              {currentCompleted} de {currentSubs.length} materias
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

            {currentSubs.map(subject => (
              <List.Item
                key={subject.id}
                title={subject.name}
                titleStyle={styles.listTitle}
                description={`${subject.code} - ${subject.credits} créditos`}
                descriptionStyle={styles.listDesc}
                left={props => (
                  <List.Icon
                    {...props}
                    icon={subject.completed ? 'check-circle' : 'circle-outline'}
                    color={subject.completed ? MD3Colors.primary70 : colors.textTertiary}
                  />
                )}
                right={() => (
                  <Button
                    mode={subject.completed ? 'contained-tonal' : 'outlined'}
                    compact
                    onPress={() => toggleSubjectCompletion(subject.id)}
                  >
                    {subject.completed ? 'Aprobada' : 'Marcar'}
                  </Button>
                )}
                style={styles.listItem}
              />
            ))}

            {currentSubs.length === 0 && (
              <Text variant="bodyMedium" style={styles.emptyText}>
                No hay materias en este cuatrimestre
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Próximo cuatrimestre */}
        {nextRec && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Próximo Cuatrimestre ({nextRec.semester})
              </Text>
              <Text variant="bodyMedium" style={styles.bodyText}>
                Materias disponibles basadas en prerrequisitos completados:
              </Text>

              {nextRec.subjects.map(subject => (
                <List.Item
                  key={subject.id}
                  title={subject.name}
                  titleStyle={styles.listTitle}
                  description={`${subject.code} - ${subject.credits} créditos`}
                  descriptionStyle={styles.listDesc}
                  left={props => <List.Icon {...props} icon="book" />}
                  style={styles.listItem}
                />
              ))}

              <View style={styles.creditsSummary}>
                <Chip mode="outlined" icon="calculator">
                  Total: {nextRec.totalCredits} créditos
                </Chip>
              </View>

              <Button
                mode="contained"
                icon="plus"
                onPress={() => navigation.navigate('Planning', { recommendedSubjects: nextRec.subjects })}
                style={styles.planButton}
              >
                Planificar Próximo Cuatrimestre
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Acciones Rápidas */}
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

const makeStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    backgroundColor: colors.surface,
  },
  cardTitle: {
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: 'bold',
    color: colors.text,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
    color: colors.text,
  },
  subsectionTitle: {
    marginBottom: 12,
    color: colors.textSecondary,
  },
  bodyText: {
    color: colors.textSecondary,
    marginBottom: 8,
  },
  semesterScroll: {
    marginHorizontal: -4,
  },
  semesterChip: {
    marginHorizontal: 4,
    marginBottom: 4,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressItem: {
    marginBottom: 16,
  },
  progressLabel: {
    color: colors.textSecondary,
  },
  progressText: {
    marginBottom: 8,
    fontWeight: '500',
    color: colors.text,
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
  statLabel: {
    color: colors.textSecondary,
  },
  divider: {
    marginVertical: 16,
    backgroundColor: colors.divider,
  },
  listItem: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  listTitle: {
    color: colors.text,
  },
  listDesc: {
    color: colors.textSecondary,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textTertiary,
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
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { AppProvider } from './src/context/AppContext';
import HomeScreen from './src/screens/HomeScreen';
import EditPensumScreen from './src/screens/EditPensumScreen';
import PlanningScreen from './src/screens/PlanningScreen';
import SavedPlansScreen from './src/screens/SavedPlansScreen';
import CalculatorScreen from './src/screens/CalculatorScreen';
import FinanceScreen from './src/screens/FinanceScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';

const Stack = createNativeStackNavigator();

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2196F3',
    secondary: '#03A9F4',
    tertiary: '#4CAF50',
  },
};

export default function App() {
  return (
    <AppProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: 'Mi Progreso ISO11' }}
            />
            <Stack.Screen
              name="EditPensum"
              component={EditPensumScreen}
              options={{ title: 'Editar Pensum' }}
            />
            <Stack.Screen
              name="Planning"
              component={PlanningScreen}
              options={{ title: 'Planificación' }}
            />
            <Stack.Screen
              name="SavedPlans"
              component={SavedPlansScreen}
              options={{ title: 'Planes Guardados' }}
            />
            <Stack.Screen
              name="Calculator"
              component={CalculatorScreen}
              options={{ title: 'Calculadora' }}
            />
            <Stack.Screen
              name="Finance"
              component={FinanceScreen}
              options={{ title: 'Control de Pagos' }}
            />
            <Stack.Screen
              name="Schedule"
              component={ScheduleScreen}
              options={{ title: 'Horario' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </AppProvider>
  );
}

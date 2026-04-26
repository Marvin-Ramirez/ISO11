import React from 'react';
import { NavigationContainer, DefaultTheme as NavLight, DarkTheme as NavDark } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { AppProvider } from './src/context/AppContext';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import HomeScreen from './src/screens/HomeScreen';
import EditPensumScreen from './src/screens/EditPensumScreen';
import PlanningScreen from './src/screens/PlanningScreen';
import SavedPlansScreen from './src/screens/SavedPlansScreen';
import CalculatorScreen from './src/screens/CalculatorScreen';
import FinanceScreen from './src/screens/FinanceScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';

const Stack = createNativeStackNavigator();

// Tema claro Paper
const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2196F3',
    secondary: '#03A9F4',
    tertiary: '#4CAF50',
  },
};

// Tema oscuro Paper
const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#64B5F6',
    secondary: '#4FC3F7',
    tertiary: '#81C784',
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#252525',
    onSurface: '#ECEFF1',
    onBackground: '#ECEFF1',
  },
};

// Componente interno que consume el tema
function AppContent() {
  const { isDark } = useAppTheme();
  const paperTheme = isDark ? darkTheme : lightTheme;
  const navTheme = isDark ? NavDark : NavLight;

  return (
    <AppProvider>
      <PaperProvider theme={paperTheme}>
        <NavigationContainer theme={navTheme}>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="EditPensum"
              component={EditPensumScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Planning"
              component={PlanningScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SavedPlans"
              component={SavedPlansScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Calculator"
              component={CalculatorScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Finance"
              component={FinanceScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Schedule"
              component={ScheduleScreen}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </AppProvider>
  );
}

// Raíz: ThemeProvider envuelve todo
export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
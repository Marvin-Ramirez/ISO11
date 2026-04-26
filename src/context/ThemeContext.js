import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@pensum_theme';

// ─── Paletas ─────────────────────────────────────────────────
export const LIGHT_COLORS = {
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#555555',
  textTertiary: '#888888',
  border: '#E0E0E0',
  divider: '#EEEEEE',
  subtleBg: '#F5F5F5',
  subtleBg2: '#F8F9FA',
  blueBg: '#E3F2FD',
  greenBg: '#E8F5E9',
  orangeBg: '#FFF3E0',
  financeSummaryBg: '#E8F5E9',
  financeSummaryBorder: '#C8E6C9',
  financeSummaryTotal: '#2E7D32',
  financeTitleColor: '#1B5E20',
  counterSeparator: '#C8E6C9',
  scheduleHeader: '#1565C0',
  scheduleHeaderText: '#FFFFFF',
  scheduleTimeCell: '#EEF2FF',
  scheduleTimeCellBorder: '#C5CAE9',
  scheduleTimeText: '#5C6BC0',
  scheduleCellBorder: '#E0E0E0',
  suggestBg: '#FFFFFF',
  suggestBorder: '#C5CAE9',
  suggestSeparator: '#F3F4F6',
  suggCodeColor: '#1565C0',
  suggNameColor: '#333333',
  legendBg: '#FFFFFF',
  legendBorderTop: '#E0E0E0',
  selectedItemBg: '#EFF6FF',
  calcSummaryBg: '#E3F2FD',
  discountToggleBg: '#F5F5F5',
  tabActiveBg: '#1565C0',
  tabActiveText: '#FFFFFF',
  dayTimeSectionBg: '#F0F4FF',
  dayTimeSectionBorder: '#C5CAE9',
};

export const DARK_COLORS = {
  background: '#121212',
  surface: '#1E1E1E',
  text: '#ECEFF1',
  textSecondary: '#90A4AE',
  textTertiary: '#607D8B',
  border: '#37474F',
  divider: '#2C2C2C',
  subtleBg: '#252525',
  subtleBg2: '#2A2A2A',
  blueBg: '#0D1B3E',
  greenBg: '#1B3A2B',
  orangeBg: '#3E2B14',
  financeSummaryBg: '#1B3A2B',
  financeSummaryBorder: '#2D6A4F',
  financeSummaryTotal: '#4CAF50',
  financeTitleColor: '#A5D6A7',
  counterSeparator: '#2D6A4F',
  scheduleHeader: '#0D47A1',
  scheduleHeaderText: '#ECEFF1',
  scheduleTimeCell: '#1A1F3A',
  scheduleTimeCellBorder: '#283593',
  scheduleTimeText: '#7986CB',
  scheduleCellBorder: '#2C2C2C',
  suggestBg: '#252525',
  suggestBorder: '#37474F',
  suggestSeparator: '#2A2A2A',
  suggCodeColor: '#64B5F6',
  suggNameColor: '#ECEFF1',
  legendBg: '#1E1E1E',
  legendBorderTop: '#37474F',
  selectedItemBg: '#1A2744',
  calcSummaryBg: '#0D1B3E',
  discountToggleBg: '#252525',
  tabActiveBg: '#1565C0',
  tabActiveText: '#FFFFFF',
  dayTimeSectionBg: '#1A1F3A',
  dayTimeSectionBorder: '#283593',
};

// ─── Contexto ─────────────────────────────────────────────────
const ThemeContext = createContext();

export const useAppTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme debe usarse dentro de ThemeProvider');
  return ctx;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        if (saved !== null) setIsDark(JSON.parse(saved));
      } catch {}
      finally { setThemeLoaded(true); }
    })();
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    try { await AsyncStorage.setItem(THEME_KEY, JSON.stringify(next)); } catch {}
  };

  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors, themeLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
};
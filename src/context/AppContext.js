import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storageService } from '../services/storageService';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [subjects, setSubjects] = useState([]);
  const [savedPlans, setSavedPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar materias y planes al iniciar
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const loadedSubjects = await storageService.loadSubjects();
      setSubjects(loadedSubjects);
      
      const plans = await loadPlans();
      setSavedPlans(plans);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ===== FUNCIONES PARA MATERIAS =====
  const saveSubjects = async (newSubjects) => {
    try {
      const success = await storageService.saveSubjects(newSubjects);
      if (success) {
        setSubjects(newSubjects);
      }
      return success;
    } catch (error) {
      console.error('Error saving subjects:', error);
      return false;
    }
  };

  const updateSubject = async (subjectId, updates) => {
    const updatedSubjects = subjects.map(subject =>
      subject.id === subjectId ? { ...subject, ...updates } : subject
    );
    return await saveSubjects(updatedSubjects);
  };

  const toggleSubjectCompletion = async (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (subject) {
      return await updateSubject(subjectId, { completed: !subject.completed });
    }
    return false;
  };

  const resetToDefault = async () => {
    const defaultSubjects = await storageService.resetToDefault();
    setSubjects(defaultSubjects);
    return defaultSubjects;
  };

  const clearAllSubjects = async () => {
    const emptySubjects = await storageService.clearAllSubjects();
    setSubjects(emptySubjects);
    return emptySubjects;
  };

  const getStatistics = () => {
    const totalSubjects = subjects.length;
    const completedSubjects = subjects.filter(s => s.completed).length;
    const totalCredits = subjects.reduce((sum, subject) => sum + subject.credits, 0);
    const completedCredits = subjects
      .filter(s => s.completed)
      .reduce((sum, subject) => sum + subject.credits, 0);

    return {
      totalSubjects,
      completedSubjects,
      totalCredits,
      completedCredits,
    };
  };

  const getSubjectsBySemester = (semester) => {
    return subjects.filter(s => s.semester === semester);
  };

  // ===== FUNCIONES PARA PLANES =====
  const PLANS_STORAGE_KEY = '@pensum_saved_plans';

  const loadPlans = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(PLANS_STORAGE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Error loading plans:', error);
      return [];
    }
  };

  const savePlan = async (planData) => {
    try {
      const newPlan = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        ...planData
      };

      const updatedPlans = [...savedPlans, newPlan];
      const jsonValue = JSON.stringify(updatedPlans);
      
      await AsyncStorage.setItem(PLANS_STORAGE_KEY, jsonValue);
      setSavedPlans(updatedPlans);
      
      return { success: true, plan: newPlan };
    } catch (error) {
      console.error('Error saving plan:', error);
      return { success: false, error: 'No se pudo guardar el plan' };
    }
  };

  const updatePlan = async (planId, updatedData) => {
    try {
      const updatedPlans = savedPlans.map(plan =>
        plan.id === planId ? { ...plan, ...updatedData, updatedAt: new Date().toISOString() } : plan
      );
      
      const jsonValue = JSON.stringify(updatedPlans);
      await AsyncStorage.setItem(PLANS_STORAGE_KEY, jsonValue);
      setSavedPlans(updatedPlans);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating plan:', error);
      return { success: false, error: 'No se pudo actualizar el plan' };
    }
  };

  const deletePlan = async (planId) => {
    try {
      const updatedPlans = savedPlans.filter(plan => plan.id !== planId);
      const jsonValue = JSON.stringify(updatedPlans);
      
      await AsyncStorage.setItem(PLANS_STORAGE_KEY, jsonValue);
      setSavedPlans(updatedPlans);
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting plan:', error);
      return { success: false, error: 'No se pudo eliminar el plan' };
    }
  };

  const clearAllPlans = async () => {
    try {
      await AsyncStorage.removeItem(PLANS_STORAGE_KEY);
      setSavedPlans([]);
      return { success: true };
    } catch (error) {
      console.error('Error clearing plans:', error);
      return { success: false, error: 'No se pudieron eliminar los planes' };
    }
  };

  const value = {
    // Materias
    subjects,
    loading,
    saveSubjects,
    updateSubject,
    toggleSubjectCompletion,
    resetToDefault,
    clearAllSubjects,
    getStatistics,
    getSubjectsBySemester,
    
    // Planes
    savedPlans,
    savePlan,
    updatePlan,
    deletePlan,
    clearAllPlans,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
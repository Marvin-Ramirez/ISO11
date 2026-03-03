import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultSubjects } from '../data/defaultSubjects';

const SUBJECTS_KEY = '@pensum_subjects';

export const storageService = {
  // Guardar materias
  saveSubjects: async (subjects) => {
    try {
      const jsonValue = JSON.stringify(subjects);
      await AsyncStorage.setItem(SUBJECTS_KEY, jsonValue);
      return true;
    } catch (error) {
      console.error('Error saving subjects:', error);
      return false;
    }
  },

  // Cargar materias
  loadSubjects: async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(SUBJECTS_KEY);
      if (jsonValue !== null) {
        return JSON.parse(jsonValue);
      } else {
        // Si no hay datos, retornar los por defecto sin guardar
        return defaultSubjects;
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
      return defaultSubjects;
    }
  },

  // Restablecer a valores por defecto
  resetToDefault: async () => {
    try {
      await storageService.saveSubjects(defaultSubjects);
      return defaultSubjects;
    } catch (error) {
      console.error('Error resetting to default:', error);
      return defaultSubjects;
    }
  },

  // Eliminar todas las materias
  clearAllSubjects: async () => {
    try {
      await AsyncStorage.removeItem(SUBJECTS_KEY);
      return [];
    } catch (error) {
      console.error('Error clearing subjects:', error);
      return [];
    }
  },

  updateSubjectCompletion: async (subjectId, completed) => {
    try {
      const subjects = await storageService.loadSubjects();
      const updatedSubjects = subjects.map(subject =>
        subject.id === subjectId ? { ...subject, completed } : subject
      );
      return await storageService.saveSubjects(updatedSubjects);
    } catch (error) {
      console.error('Error updating subject completion:', error);
      return false;
    }
  },

  // Función para obtener estadísticas
  getStatistics: async () => {
    try {
      const subjects = await storageService.loadSubjects();
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
    } catch (error) {
      console.error('Error getting statistics:', error);
      return {
        totalSubjects: 0,
        completedSubjects: 0,
        totalCredits: 0,
        completedCredits: 0,
      };
    }
  },

}; 
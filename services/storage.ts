
import { AppState } from '../types';
import { MOCK_DATA } from '../constants';

const STORAGE_KEY = 'pravaasi_shramik_data';

export const saveState = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const loadState = (): AppState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load state', e);
    }
  }
  return {
    years: MOCK_DATA.years as any,
    currentYearId: 'y2',
    establishments: MOCK_DATA.establishments as any,
    yearlyEstablishments: MOCK_DATA.yearlyEstablishments as any,
    workers: MOCK_DATA.workers as any,
    familyMembers: MOCK_DATA.familyMembers as any,
    advances: MOCK_DATA.advances as any,
  };
};

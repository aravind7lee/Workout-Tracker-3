import api from '../utils/api';

const SPLIT_PREVIEWS = {
  1: { splitName: 'Full Body (1x)', splitType: 'full_body', days: ['Full Body'] },
  2: { splitName: 'Full Body (2x)', splitType: 'full_body', days: ['Full Body A', 'Full Body B'] },
  4: { splitName: 'Upper / Lower (2x)', splitType: 'upper_lower', days: ['Upper A', 'Lower A', 'Upper B', 'Lower B'] },
  6: { splitName: 'Push / Pull / Legs (2x)', splitType: 'ppl', days: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs'] },
  7: { splitName: 'PPL (2x) + Active Recovery', splitType: 'ppl_recovery', days: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs', 'Active Recovery'] }
};

export const getSplitRecommendation = (frequency, experienceLevel = 'beginner') => {
  const days = Number(frequency);
  if (days === 3) {
    return experienceLevel === 'beginner'
      ? { splitName: 'Full Body (3x)', splitType: 'full_body', days: ['Full Body A', 'Full Body B', 'Full Body C'] }
      : { splitName: 'Push / Pull / Legs (1x)', splitType: 'ppl', days: ['Push', 'Pull', 'Legs'] };
  }
  if (days === 5) {
    return experienceLevel === 'advanced'
      ? { splitName: 'Bro Split (5-Day)', splitType: 'bro_split', days: ['Chest', 'Back', 'Shoulders', 'Legs', 'Arms'] }
      : { splitName: 'Upper / Lower + Full Body', splitType: 'upper_lower_full', days: ['Upper', 'Lower', 'Upper', 'Lower', 'Full Body'] };
  }
  return SPLIT_PREVIEWS[days] || SPLIT_PREVIEWS[4];
};

export const submitOnboarding = async (payload) => {
  const response = await api.post('/users/onboarding', payload);
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Unable to complete onboarding');
  }
  return response.data;
};

export const resetOnboarding = async () => {
  const response = await api.post('/users/onboarding/reset');
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Unable to reset fitness setup');
  }
  return response.data;
};

export const recalculateTDEE = async (payload = {}) => {
  const response = await api.post('/users/recalculate-tdee', payload);
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Unable to recalculate nutrition targets');
  }
  return response.data;
};

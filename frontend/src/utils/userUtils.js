// User utility functions to prevent null reference errors
export const getUserInitials = (user) => {
  if (!user || !user.name) return 'U';
  return user.name.charAt(0).toUpperCase();
};

export const getUserName = (user) => {
  if (!user || !user.name) return 'User';
  return user.name;
};

export const getUserEmail = (user) => {
  if (!user || !user.email) return '';
  return user.email;
};

export const isValidUser = (user) => {
  return user && user.id && user.name && user.email;
};

export const safeUserAccess = (user, property, defaultValue = '') => {
  try {
    if (!user || typeof user !== 'object') return defaultValue;
    return user[property] || defaultValue;
  } catch (error) {
    console.error('Error accessing user property:', error);
    return defaultValue;
  }
};
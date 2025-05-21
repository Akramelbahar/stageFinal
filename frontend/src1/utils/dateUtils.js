/**
 * Date and time utility functions
 */

/**
 * Format date as string (DD/MM/YYYY)
 * @param {Date|String} date - Date to format
 * @returns {String} Formatted date
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj)) return 'Date invalide';
  
  return dateObj.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Format date with time (DD/MM/YYYY HH:MM)
 * @param {Date|String} date - Date to format
 * @returns {String} Formatted date with time
 */
export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj)) return 'Date invalide';
  
  return dateObj.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format date in a friendly way (le 5 janvier 2023)
 * @param {Date|String} date - Date to format
 * @returns {String} Formatted date
 */
export const formatDateFriendly = (date) => {
  if (!date) return 'N/A';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj)) return 'Date invalide';
  
  const formatted = dateObj.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  return `le ${formatted}`;
};

/**
 * Format date for input fields (YYYY-MM-DD)
 * @param {Date|String} date - Date to format
 * @returns {String} Formatted date for input
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj)) return '';
  
  return dateObj.toISOString().split('T')[0];
};

/**
 * Get relative time string (e.g., "il y a 2 jours")
 * @param {Date|String} date - Date to format
 * @returns {String} Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return 'N/A';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj)) return 'Date invalide';
  
  const now = new Date();
  const diffInMs = now - dateObj;
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInSecs < 60) {
    return 'à l\'instant';
  } else if (diffInMins < 60) {
    return `il y a ${diffInMins} minute${diffInMins > 1 ? 's' : ''}`;
  } else if (diffInHours < 24) {
    return `il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
  } else if (diffInDays < 30) {
    return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  } else {
    return formatDate(date);
  }
};

/**
 * Check if date is in the past
 * @param {Date|String} date - Date to check
 * @returns {Boolean} True if date is in the past
 */
export const isDateInPast = (date) => {
  if (!date) return false;
  
  const dateObj = new Date(date);
  if (isNaN(dateObj)) return false;
  
  const now = new Date();
  return dateObj < now;
};

/**
 * Check if date is in the future
 * @param {Date|String} date - Date to check
 * @returns {Boolean} True if date is in the future
 */
export const isDateInFuture = (date) => {
  if (!date) return false;
  
  const dateObj = new Date(date);
  if (isNaN(dateObj)) return false;
  
  const now = new Date();
  return dateObj > now;
};

/**
 * Check if date is within a given range
 * @param {Date|String} date - Date to check
 * @param {Date|String} startDate - Start date of range
 * @param {Date|String} endDate - End date of range
 * @returns {Boolean} True if date is within range
 */
export const isDateInRange = (date, startDate, endDate) => {
  if (!date || !startDate || !endDate) return false;
  
  const dateObj = new Date(date);
  const startObj = new Date(startDate);
  const endObj = new Date(endDate);
  
  if (isNaN(dateObj) || isNaN(startObj) || isNaN(endObj)) return false;
  
  return dateObj >= startObj && dateObj <= endObj;
};

/**
 * Add days to a date
 * @param {Date|String} date - Date to add days to
 * @param {Number} days - Number of days to add
 * @returns {Date} New date
 */
export const addDays = (date, days) => {
  if (!date) return null;
  
  const dateObj = new Date(date);
  if (isNaN(dateObj)) return null;
  
  dateObj.setDate(dateObj.getDate() + days);
  return dateObj;
};

/**
 * Get days between two dates
 * @param {Date|String} startDate - Start date
 * @param {Date|String} endDate - End date
 * @returns {Number} Number of days
 */
export const getDaysBetween = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  const startObj = new Date(startDate);
  const endObj = new Date(endDate);
  
  if (isNaN(startObj) || isNaN(endObj)) return 0;
  
  const diffInMs = endObj - startObj;
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
};

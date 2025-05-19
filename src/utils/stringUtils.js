/**
 * String utility functions
 */

/**
 * Capitalize first letter of a string
 * @param {String} str - String to capitalize
 * @returns {String} Capitalized string
 */
export const capitalizeFirstLetter = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Capitalize first letter of each word
 * @param {String} str - String to capitalize
 * @returns {String} String with capitalized words
 */
export const capitalizeWords = (str) => {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => capitalizeFirstLetter(word))
    .join(' ');
};

/**
 * Truncate string if it exceeds max length
 * @param {String} str - String to truncate
 * @param {Number} maxLength - Maximum length
 * @param {String} suffix - Suffix to add (default: "...")
 * @returns {String} Truncated string
 */
export const truncate = (str, maxLength, suffix = '...') => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Convert string to slug (URL-friendly string)
 * @param {String} str - String to convert
 * @returns {String} URL-friendly slug
 */
export const slugify = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Format number as French currency (€)
 * @param {Number} value - Number to format
 * @returns {String} Formatted currency string
 */
export const formatCurrency = (value) => {
  if (value === undefined || value === null) return '0,00 €';
  
  return Number(value).toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  });
};

/**
 * Format number with thousands separator
 * @param {Number} value - Number to format
 * @returns {String} Formatted number
 */
export const formatNumber = (value) => {
  if (value === undefined || value === null) return '0';
  
  return Number(value).toLocaleString('fr-FR');
};

/**
 * Convert HTML to plain text
 * @param {String} html - HTML string
 * @returns {String} Plain text
 */
export const htmlToPlainText = (html) => {
  if (!html) return '';
  
  // Create a temporary element
  const tempElement = document.createElement('div');
  tempElement.innerHTML = html;
  
  // Get text content
  return tempElement.textContent || tempElement.innerText || '';
};

/**
 * Generate initials from name
 * @param {String} name - Full name
 * @param {Number} maxLength - Maximum number of initials (default: 2)
 * @returns {String} Initials
 */
export const getInitials = (name, maxLength = 2) => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .slice(0, maxLength)
    .join('')
    .toUpperCase();
};

/**
 * Format file size to human-readable string
 * @param {Number} bytes - Size in bytes
 * @returns {String} Formatted size (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if string is a valid email
 * @param {String} email - Email to validate
 * @returns {Boolean} True if valid email
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Escape HTML special characters
 * @param {String} str - String to escape
 * @returns {String} Escaped string
 */
export const escapeHtml = (str) => {
  if (!str) return '';
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Get file extension from filename
 * @param {String} filename - Filename
 * @returns {String} File extension (lowercase)
 */
export const getFileExtension = (filename) => {
  if (!filename) return '';
  
  return filename
    .split('.')
    .pop()
    .toLowerCase();
};

/**
 * Normalize string (remove accents, diacritics)
 * @param {String} str - String to normalize
 * @returns {String} Normalized string
 */
export const normalizeString = (str) => {
  if (!str) return '';
  
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

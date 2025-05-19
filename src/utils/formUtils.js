/**
 * Form handling utility functions
 */

/**
 * Validate form inputs based on rules
 * @param {Object} values - Form values
 * @param {Object} rules - Validation rules
 * @returns {Object} Object with errors
 */
export const validateForm = (values, rules) => {
  const errors = {};
  
  for (const field in rules) {
    const value = values[field];
    const fieldRules = rules[field];
    
    // Required field validation
    if (fieldRules.includes('required') && 
        (value === undefined || value === null || value === '')) {
      errors[field] = 'Ce champ est obligatoire';
      continue; // Skip other validations if required check fails
    }
    
    // Skip other validations if value is empty and not required
    if (value === undefined || value === null || value === '') continue;
    
    // Email validation
    if (fieldRules.includes('email') && !/\S+@\S+\.\S+/.test(value)) {
      errors[field] = 'Format d\'email invalide';
    }
    
    // Number validation
    if (fieldRules.includes('number') && isNaN(Number(value))) {
      errors[field] = 'Ce champ doit être un nombre';
    }
    
    // Integer validation
    if (fieldRules.includes('integer') && !Number.isInteger(Number(value))) {
      errors[field] = 'Ce champ doit être un nombre entier';
    }
    
    // Date validation
    if (fieldRules.includes('date') && isNaN(Date.parse(value))) {
      errors[field] = 'Format de date invalide';
    }
    
    // Min length validation
    const minRule = fieldRules.find(rule => rule.startsWith('min:'));
    if (minRule) {
      const minLength = parseInt(minRule.split(':')[1]);
      if (String(value).length < minLength) {
        errors[field] = `Ce champ doit contenir au moins ${minLength} caractères`;
      }
    }
    
    // Max length validation
    const maxRule = fieldRules.find(rule => rule.startsWith('max:'));
    if (maxRule) {
      const maxLength = parseInt(maxRule.split(':')[1]);
      if (String(value).length > maxLength) {
        errors[field] = `Ce champ ne peut pas dépasser ${maxLength} caractères`;
      }
    }
  }
  
  return errors;
};

/**
 * Format form data for API submission
 * @param {Object} formData - Form data object
 * @param {Object} options - Options for formatting
 * @returns {Object} Formatted data for API
 */
export const formatFormData = (formData, options = {}) => {
  const { dateFields = [], booleanFields = [], numberFields = [] } = options;
  const formattedData = { ...formData };
  
  // Format date fields (YYYY-MM-DD)
  dateFields.forEach(field => {
    if (formattedData[field]) {
      if (formattedData[field] instanceof Date) {
        formattedData[field] = formattedData[field].toISOString().split('T')[0];
      } else if (typeof formattedData[field] === 'string' && !formattedData[field].includes('-')) {
        // Convert string date to ISO format if it's not already in that format
        const date = new Date(formattedData[field]);
        if (!isNaN(date.getTime())) {
          formattedData[field] = date.toISOString().split('T')[0];
        }
      }
    }
  });
  
  // Format boolean fields
  booleanFields.forEach(field => {
    if (formattedData[field] !== undefined) {
      formattedData[field] = Boolean(formattedData[field]);
    }
  });
  
  // Format number fields
  numberFields.forEach(field => {
    if (formattedData[field] !== undefined && formattedData[field] !== null && formattedData[field] !== '') {
      formattedData[field] = Number(formattedData[field]);
    }
  });
  
  return formattedData;
};

/**
 * Create initial form data with default values
 * @param {Object} fields - Field definitions with default values
 * @returns {Object} Initial form data
 */
export const createInitialFormData = (fields) => {
  const initialData = {};
  
  for (const [field, defaultValue] of Object.entries(fields)) {
    initialData[field] = defaultValue;
  }
  
  return initialData;
};

/**
 * Extract field errors from API error response
 * @param {Object} error - API error response
 * @returns {Object} Field errors
 */
export const extractFieldErrors = (error) => {
  if (!error || !error.errors) return {};
  
  return error.errors;
};

/**
 * Check if form has any errors
 * @param {Object} errors - Form errors object
 * @returns {Boolean} True if form has errors
 */
export const hasFormErrors = (errors) => {
  return Object.keys(errors).length > 0;
};

/**
 * Get form field error message
 * @param {Object} errors - Form errors object
 * @param {String} field - Field name
 * @returns {String|null} Error message or null
 */
export const getFieldError = (errors, field) => {
  if (!errors || !errors[field]) return null;
  
  return errors[field];
};

/**
 * Reset form values to initial state
 * @param {Object} initialValues - Initial form values
 * @param {Function} setValues - Function to set form values
 */
export const resetForm = (initialValues, setValues) => {
  setValues({ ...initialValues });
};

/**
 * Populate form with data from API
 * @param {Object} data - Data from API
 * @param {Object} initialValues - Initial form values
 * @param {Function} setValues - Function to set form values
 */
export const populateForm = (data, initialValues, setValues) => {
  const formattedData = {};
  
  // Only use fields that exist in initialValues
  for (const field in initialValues) {
    if (data[field] !== undefined) {
      formattedData[field] = data[field];
    } else {
      formattedData[field] = initialValues[field];
    }
  }
  
  setValues(formattedData);
};

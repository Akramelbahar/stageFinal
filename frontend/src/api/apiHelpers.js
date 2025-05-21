/**
 * Safely extract data from API responses
 * Handles different API response formats:
 * - { data: [...] }
 * - { data: { data: [...] } }
 * - [...] (direct array)
 * 
 * @param {Object|Array} response - The API response
 * @returns {Array} - Normalized array of data
 */
export const extractApiData = (response) => {
    if (!response) return [];
    
    // Case: Direct array
    if (Array.isArray(response)) {
      return response;
    }
    
    // Case: { data: [...] }
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    // Case: { data: { data: [...] } }
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    
    // Fallback: empty array
    console.warn('Unexpected API response format:', response);
    return [];
  };
  
  /**
   * Process API response to ensure consistent data structure
   * 
   * @param {Object} response - The API response 
   * @param {String} defaultMessage - Default error message
   * @returns {Object} - Processed response object
   */
  export const processApiResponse = (response, defaultMessage = 'Une erreur est survenue') => {
    try {
      // If response is already formatted correctly
      if (response && (response.data !== undefined || response.error !== undefined)) {
        return response;
      }
      
      // Format the response
      return {
        data: extractApiData(response),
        success: true
      };
    } catch (error) {
      console.error('Error processing API response:', error);
      return {
        data: [],
        error: defaultMessage,
        success: false
      };
    }
  };
  
  /**
   * Check if an API response contains actual data
   * 
   * @param {Object} response - The API response
   * @returns {Boolean} - True if the response contains data, false otherwise
   */
  export const hasApiData = (response) => {
    const data = extractApiData(response);
    return Array.isArray(data) && data.length > 0;
  };
  
  /**
   * Helper function to ensure consistent error handling for API calls
   * 
   * @param {Function} apiCall - The API function to call
   * @param {String} errorMessage - Default error message
   * @returns {Promise} - Promise that resolves to a normalized response
   */
  export const safeApiCall = async (apiCall, errorMessage) => {
    try {
      const response = await apiCall();
      return processApiResponse(response);
    } catch (error) {
      console.error(errorMessage, error);
      return {
        data: [],
        error: error.message || errorMessage,
        success: false
      };
    }
  };
  
  /**
   * Extract renovation or maintenance data with proper intervention links
   * Handles the specific structure of these entities in the database
   * 
   * @param {Array} items - Array of renovation or maintenance items
   * @returns {Array} - Processed items with proper links
   */
  export const processInterventionEntities = (items) => {
    if (!Array.isArray(items)) return [];
    
    return items.map(item => {
      // Ensure intervention_id is properly set
      if (item.intervention && !item.intervention_id) {
        item.intervention_id = item.intervention.id;
      }
      
      return item;
    });
  };
  
  /**
   * Fix missing or improperly formatted IDs in API response data
   * For Renovation and Maintenance, the primary key is intervention_id
   * 
   * @param {Array} items - The items from API response
   * @param {String} type - The type of items ('renovations', 'maintenances', 'prestataires')
   * @returns {Array} - Items with fixed IDs
   */
  export const fixEntityIds = (items, type) => {
    if (!Array.isArray(items)) return [];
    
    return items.map(item => {
      let fixedItem = { ...item };
      
      if (type === 'renovations' || type === 'maintenances') {
        // For renovations and maintenances, the primary key is intervention_id
        if (item.intervention && item.intervention.id && !item.intervention_id) {
          fixedItem.intervention_id = item.intervention.id;
        } else if (!item.intervention_id && item.id) {
          // Some APIs might return id instead of intervention_id
          fixedItem.intervention_id = item.id;
        }
      }
      
      return fixedItem;
    });
  };
  
  /**
   * Debug function to log API response structure
   * Useful for debugging unexpected API formats
   * 
   * @param {Object} response - The API response
   * @param {String} name - Name for the log
   */
  export const debugApiResponse = (response, name = 'API Response') => {
    console.group(`Debug: ${name}`);
    console.log('Raw response:', response);
    
    if (response && response.data) {
      console.log('response.data:', response.data);
      
      if (Array.isArray(response.data)) {
        console.log('First item:', response.data[0]);
      } else if (response.data.data && Array.isArray(response.data.data)) {
        console.log('response.data.data (first item):', response.data.data[0]);
      }
    }
    
    console.log('Extracted data:', extractApiData(response));
    console.groupEnd();
  };
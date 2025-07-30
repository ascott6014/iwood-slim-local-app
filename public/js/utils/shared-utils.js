/**
 * Shared utility functions to reduce code duplication across the application
 */

/**
 * Debounce function - delays execution until after wait time has elapsed
 * @param {Function} func - Function to debounce
 * @param {number} wait - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Fetch customers from the backend with search query
 * @param {string} query - Search query string
 * @returns {Promise<Array>} Array of customer objects
 */
async function fetchCustomers(query = '') {
  try {
    const url = query 
      ? `/customers/search?q=${encodeURIComponent(query)}`
      : '/customers';
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.customers || [];
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
}

/**
 * Format date to readable string
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString();
}

/**
 * Format currency amount
 * @param {number} amount - Numeric amount
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
  return `$${parseFloat(amount || 0).toFixed(2)}`;
}

/**
 * Show notification message to user
 * @param {string} message - Message to display
 * @param {string} type - Message type: 'success', 'error', 'warning', 'info'
 */
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // Style the notification
  Object.assign(notification.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '15px 20px',
    borderRadius: '5px',
    color: 'white',
    fontWeight: 'bold',
    zIndex: '10000',
    backgroundColor: type === 'success' ? '#28a745' : 
                    type === 'error' ? '#dc3545' :
                    type === 'warning' ? '#ffc107' : '#007bff'
  });
  
  document.body.appendChild(notification);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

/**
 * Validate required form fields
 * @param {Array<string>} fieldIds - Array of field IDs to validate
 * @returns {boolean} True if all fields are valid
 */
function validateRequiredFields(fieldIds) {
  let isValid = true;
  
  fieldIds.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field && !field.value.trim()) {
      field.style.borderColor = '#dc3545';
      isValid = false;
    } else if (field) {
      field.style.borderColor = '';
    }
  });
  
  return isValid;
}

/**
 * Clear form fields
 * @param {Array<string>} fieldIds - Array of field IDs to clear
 */
function clearFormFields(fieldIds) {
  fieldIds.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.value = '';
      field.style.borderColor = '';
    }
  });
}

/**
 * Export functions for use in other modules
 */
if (typeof window !== 'undefined') {
  // Browser environment - attach to window
  window.SharedUtils = {
    debounce,
    fetchCustomers,
    formatDate,
    formatCurrency,
    showNotification,
    validateRequiredFields,
    clearFormFields
  };
}

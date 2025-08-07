/**
 * Shared customer search utilities to reduce code duplication
 * Handles customer search, selection, and form management
 */

/**
 * Customer search handler class
 */
class CustomerSearchHandler {
  constructor(options = {}) {
    this.searchInputId = options.searchInputId || 'customerSearch';
    this.resultsContainerId = options.resultsContainerId || 'customerResults';
    this.selectedCustomerDisplayId = options.selectedCustomerDisplayId || 'selectedCustomerInfo';
    this.newCustomerFormId = options.newCustomerFormId || 'newCustomerForm';
    this.onCustomerSelected = options.onCustomerSelected || null;
    this.debounceDelay = options.debounceDelay || 300;
    
    this.selectedCustomer = null;
    
    this.init();
  }

  /**
   * Initialize the customer search functionality
   */
  init() {
    const searchInput = document.getElementById(this.searchInputId);
    if (searchInput && window.SharedUtils) {
      searchInput.addEventListener('input', 
        window.SharedUtils.debounce(this.searchCustomers.bind(this), this.debounceDelay)
      );
    }

    // Hide results when clicking elsewhere
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.customer-search')) {
        this.hideResults();
      }
    });
  }

  /**
   * Search for customers
   * @param {Event} event - Input event
   */
  async searchCustomers(event) {
    const query = event.target.value.trim();
    const resultsContainer = document.getElementById(this.resultsContainerId);
    
    if (!resultsContainer) return;

    if (query.length < 2) {
      resultsContainer.style.display = 'none';
      return;
    }

    try {
      const customers = await window.SharedUtils.fetchCustomers(query);
      this.displayResults(customers, resultsContainer);
    } catch (error) {
      console.error('Error searching customers:', error);
      window.SharedUtils.showNotification('Error searching customers', 'error');
    }
  }

  /**
   * Display search results
   * @param {Array} customers - Array of customer objects
   * @param {HTMLElement} container - Results container element
   */
  displayResults(customers, container) {
    container.innerHTML = '';

    if (customers.length === 0) {
      container.innerHTML = '<div class="customer-result">No customers found</div>';
      container.style.display = 'block';
      return;
    }

    customers.forEach(customer => {
      const customerDiv = document.createElement('div');
      customerDiv.className = 'customer-result';
      customerDiv.innerHTML = `
        <div><strong>${customer.first_name} ${customer.last_name}</strong></div>
        <div>Phone: ${customer.phone}</div>
        <div>Email: ${customer.email || 'N/A'}</div>
      `;
      
      customerDiv.addEventListener('click', () => {
        this.selectCustomer(customer);
      });
      
      container.appendChild(customerDiv);
    });

    container.style.display = 'block';
  }

  /**
   * Select a customer
   * @param {Object} customer - Customer object
   */
  selectCustomer(customer) {
    this.selectedCustomer = customer;
    
    // Update search input
    const searchInput = document.getElementById(this.searchInputId);
    if (searchInput) {
      searchInput.value = `${customer.first_name} ${customer.last_name}`;
    }

    // Hide results
    this.hideResults();

    // Update display
    this.updateSelectedCustomerDisplay(customer);

    // Hide new customer form if visible
    this.hideNewCustomerForm();

    // Call callback if provided
    if (this.onCustomerSelected) {
      this.onCustomerSelected(customer);
    }

    window.SharedUtils.showNotification(`Customer ${customer.first_name} ${customer.last_name} selected`, 'success');
  }

  /**
   * Update the selected customer display
   * @param {Object} customer - Customer object
   */
  updateSelectedCustomerDisplay(customer) {
    const displayContainer = document.getElementById(this.selectedCustomerDisplayId);
    if (!displayContainer) return;

    displayContainer.innerHTML = `
      <div class="selected-customer">
        <h4>Selected Customer:</h4>
        <p><strong>Name:</strong> ${customer.first_name} ${customer.last_name}</p>
        <p><strong>Phone:</strong> ${customer.phone}</p>
        <p><strong>Email:</strong> ${customer.email || 'N/A'}</p>
        <p><strong>Address:</strong> ${customer.address || 'N/A'}, ${customer.city || 'N/A'}, ${customer.state || 'N/A'} ${customer.zip || 'N/A'}</p>
        <button type="button" onclick="customerSearchHandler.changeCustomer()" class="btn btn-secondary btn-sm">
          Change Customer
        </button>
      </div>
    `;
    displayContainer.style.display = 'block';
  }

  /**
   * Show new customer form
   */
  showNewCustomerForm() {
    const newCustomerForm = document.getElementById(this.newCustomerFormId);
    if (newCustomerForm) {
      newCustomerForm.style.display = 'block';
    }

    this.selectedCustomer = 'new';
    this.hideResults();

    // Clear search input
    const searchInput = document.getElementById(this.searchInputId);
    if (searchInput) {
      searchInput.value = '';
    }

    // Hide selected customer display
    const displayContainer = document.getElementById(this.selectedCustomerDisplayId);
    if (displayContainer) {
      displayContainer.style.display = 'none';
    }

    window.SharedUtils.showNotification('New customer form displayed', 'info');
  }

  /**
   * Hide new customer form
   */
  hideNewCustomerForm() {
    const newCustomerForm = document.getElementById(this.newCustomerFormId);
    if (newCustomerForm) {
      newCustomerForm.style.display = 'none';
    }
  }

  /**
   * Change customer - reset selection
   */
  changeCustomer() {
    this.selectedCustomer = null;
    
    // Clear search input
    const searchInput = document.getElementById(this.searchInputId);
    if (searchInput) {
      searchInput.value = '';
      searchInput.focus();
    }

    // Hide selected customer display
    const displayContainer = document.getElementById(this.selectedCustomerDisplayId);
    if (displayContainer) {
      displayContainer.style.display = 'none';
    }

    // Hide new customer form
    this.hideNewCustomerForm();

    // Hide results
    this.hideResults();

    window.SharedUtils.showNotification('Customer selection cleared', 'info');
  }

  /**
   * Hide search results
   */
  hideResults() {
    const resultsContainer = document.getElementById(this.resultsContainerId);
    if (resultsContainer) {
      resultsContainer.style.display = 'none';
    }
  }

  /**
   * Get selected customer data for forms
   * @returns {Object|string|null} Selected customer object, 'new', or null
   */
  getSelectedCustomer() {
    return this.selectedCustomer;
  }

  /**
   * Validate customer selection
   * @returns {boolean} True if customer is selected or new customer form is filled
   */
  validateCustomerSelection() {
    if (this.selectedCustomer === 'new') {
      // Validate new customer form
      const requiredFields = ['firstName', 'lastName', 'phone'];
      return window.SharedUtils.validateRequiredFields(requiredFields);
    }
    
    return this.selectedCustomer !== null;
  }

  /**
   * Get customer data for submission
   * @returns {Object} Customer data object
   */
  getCustomerData() {
    if (this.selectedCustomer === 'new') {
      return {
        first_name: document.getElementById('firstName')?.value || '',
        last_name: document.getElementById('lastName')?.value || '',
        phone: document.getElementById('phone')?.value || '',
        email: document.getElementById('email')?.value || '',
        address: document.getElementById('address')?.value || '',
        city: document.getElementById('city')?.value || '',
        state: document.getElementById('state')?.value || '',
        zip: document.getElementById('zip')?.value || ''
      };
    }
    
    return this.selectedCustomer;
  }
}

/**
 * Export for use in other modules
 */
if (typeof window !== 'undefined') {
  window.CustomerSearchHandler = CustomerSearchHandler;
}

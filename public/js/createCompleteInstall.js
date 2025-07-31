let selectedCustomer = null;
let selectedItems = [];

function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Customer Search Functions (reused from createCompleteOrder.js)
async function searchCustomers() {
  const searchInput = document.getElementById('customerSearch');
  const resultsDiv = document.getElementById('customerResults');
  
  const query = searchInput.value.trim();
  if (query.length < 2) {
    resultsDiv.style.display = 'none';
    return;
  }

  try {
    const response = await fetch(`/api/customers/search?q=${encodeURIComponent(query)}`);
    const customers = await response.json();

    if (customers.length === 0) {
      resultsDiv.innerHTML = '<div class="search-result-item">No customers found</div>';
    } else {
      resultsDiv.innerHTML = customers.map(customer => `
        <div class="search-result-item" onclick="selectCustomer(${customer.customer_id}, '${customer.first_name}', '${customer.last_name}', '${customer.phone}', '${customer.email}', '${customer.address}', '${customer.city}', '${customer.state}', '${customer.zip}')">
          <strong>${customer.first_name} ${customer.last_name}</strong><br>
          <span>${customer.phone} | ${customer.email}</span><br>
          <span style="color: #666;">${customer.address}, ${customer.city}, ${customer.state} ${customer.zip}</span>
        </div>
      `).join('');
    }
    resultsDiv.style.display = 'block';
  } catch (error) {
    console.error('Error searching customers:', error);
    resultsDiv.innerHTML = '<div class="search-result-item">Error searching customers</div>';
    resultsDiv.style.display = 'block';
  }
}

function selectCustomer(id, firstName, lastName, phone, email, address, city, state, zip) {
  selectedCustomer = {
    customer_id: id,
    first_name: firstName,
    last_name: lastName,
    phone: phone,
    email: email,
    address: address,
    city: city,
    state: state,
    zip: zip
  };

  // Hide search and show selected customer
  document.getElementById('customerSearch').value = '';
  document.getElementById('customerResults').style.display = 'none';
  document.getElementById('newCustomerForm').style.display = 'none';
  
  const customerInfo = document.getElementById('customerInfo');
  customerInfo.innerHTML = `
    <div class="customer-display">
      <strong>${firstName} ${lastName}</strong><br>
      <span>${phone} | ${email}</span><br>
      <span style="color: #666;">${address}, ${city}, ${state} ${zip}</span>
    </div>
  `;
  
  document.getElementById('selectedCustomer').style.display = 'block';
  document.getElementById('itemSelectionSection').style.display = 'block';
  updateCreateButton();
}

function showNewCustomerForm() {
  document.getElementById('newCustomerForm').style.display = 'block';
  document.getElementById('customerResults').style.display = 'none';
  selectedCustomer = 'new'; // Flag to indicate new customer
  document.getElementById('itemSelectionSection').style.display = 'block';
  updateCreateButton();
}

function changeCustomer() {
  selectedCustomer = null;
  selectedItems = [];
  document.getElementById('selectedCustomer').style.display = 'none';
  document.getElementById('newCustomerForm').style.display = 'none';
  document.getElementById('itemSelectionSection').style.display = 'none';
  document.getElementById('installDetailsSection').style.display = 'none';
  document.getElementById('customerSearch').value = '';
  updateItemsTable();
  updateCreateButton();
}

function updateCreateButton() {
  const createBtn = document.getElementById('previewBtn');
  const description = document.getElementById('installDescription').value.trim();
  const estimate = document.getElementById('installEstimate').value;
  
  createBtn.disabled = !selectedCustomer || !description || !estimate;
}

// Item Management Functions
async function searchItems() {
  const searchInput = document.getElementById('itemSearch');
  const resultsSelect = document.getElementById('itemResults');
  
  const query = searchInput.value.trim();
  if (query.length < 2) {
    resultsSelect.innerHTML = '<option value="">Select an item...</option>';
    return;
  }

  try {
    const response = await fetch(`/api/items/search?q=${encodeURIComponent(query)}&type=install`);
    const items = await response.json();

    resultsSelect.innerHTML = '<option value="">Select an item...</option>';
    items.forEach(item => {
      const option = document.createElement('option');
      option.value = JSON.stringify({
        item_id: item.item_id,
        item_name: item.item_name,
        item_color: item.item_color,
        item_model: item.item_model,
        price: item.price
      });
      const price = parseFloat(item.price) || 0;
      option.textContent = `${item.item_name} - ${item.item_color} - ${item.item_model} ($${price.toFixed(2)})`;
      resultsSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error searching items:', error);
    resultsSelect.innerHTML = '<option value="">Error loading items</option>';
  }
}

function addItemToInstall() {
  const itemSelect = document.getElementById('itemResults');
  const quantityInput = document.getElementById('itemQuantity');
  
  if (!itemSelect.value || !quantityInput.value || parseInt(quantityInput.value) <= 0) {
    alert('Please select an item and enter a valid quantity');
    return;
  }

  const itemData = JSON.parse(itemSelect.value);
  const quantity = parseInt(quantityInput.value);

  // Check if item already exists
  const existingIndex = selectedItems.findIndex(item => item.item_id === itemData.item_id);
  if (existingIndex !== -1) {
    selectedItems[existingIndex].quantity += quantity;
  } else {
    selectedItems.push({
      item_id: itemData.item_id,
      item_name: itemData.item_name,
      item_color: itemData.item_color,
      item_model: itemData.item_model,
      price: itemData.price,
      quantity: quantity
    });
  }

  // Reset form
  itemSelect.value = '';
  quantityInput.value = '1';
  document.getElementById('itemSearch').value = '';

  updateItemsTable();
  updateTotalCosts();
  
  // Show install details section after adding first item
  document.getElementById('installDetailsSection').style.display = 'block';
}

function removeItem(index) {
  selectedItems.splice(index, 1);
  updateItemsTable();
  updateTotalCosts();
}

function updateItemsTable() {
  const tbody = document.getElementById('selectedItemsBody');
  const noItemsRow = document.getElementById('noItemsRow');

  if (selectedItems.length === 0) {
    tbody.innerHTML = '<tr id="noItemsRow"><td colspan="7" style="text-align: center; color: #666;">No items added yet</td></tr>';
    document.getElementById('installItemsTotal').textContent = '$0.00';
    return;
  }

  tbody.innerHTML = selectedItems.map((item, index) => {
    const price = parseFloat(item.price) || 0;
    const total = price * item.quantity;
    return `
      <tr>
        <td>${item.item_name}</td>
        <td>${item.item_color}</td>
        <td>${item.item_model}</td>
        <td>$${price.toFixed(2)}</td>
        <td>${item.quantity}</td>
        <td>$${total.toFixed(2)}</td>
        <td><button onclick="removeItem(${index})" class="remove-btn" style="background-color: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Remove</button></td>
      </tr>
    `;
  }).join('');

  const itemsTotal = selectedItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  document.getElementById('installItemsTotal').textContent = `$${itemsTotal.toFixed(2)}`;
}

function updateTotalCosts() {
  const itemsTotal = selectedItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const laborCost = parseFloat(document.getElementById('installEstimate').value) || 0;
  const totalCost = itemsTotal + laborCost;

  document.getElementById('displayItemsTotal').value = `$${itemsTotal.toFixed(2)}`;
  document.getElementById('displayTotalCost').value = `$${totalCost.toFixed(2)}`;
}

async function createInstall() {
  console.log('createInstall function called');
  
  if (!selectedCustomer) {
    alert('Please select a customer');
    return;
  }

  const description = document.getElementById('installDescription').value.trim();
  const estimate = document.getElementById('installEstimate').value;
  const installDate = document.getElementById('installDate').value;

  console.log('Form data:', { description, estimate, installDate, selectedCustomer, selectedItems });

  if (!description || !estimate) {
    alert('Please fill in the install description and estimated cost');
    return;
  }

  const previewBtn = document.getElementById('previewBtn');
  previewBtn.disabled = true;
  previewBtn.textContent = 'Creating Install...';

  try {
    let installData = {
      install_description: description,
      estimate: parseFloat(estimate),
      install_date: installDate || new Date().toISOString().split('T')[0], // Use today if no date provided
      items: selectedItems
    };

    let endpoint;
    if (selectedCustomer === 'new') {
      // Validate new customer form
      const firstName = document.getElementById('firstName').value.trim();
      const lastName = document.getElementById('lastName').value.trim();
      const phone = document.getElementById('phone').value.trim();
      
      if (!firstName || !lastName || !phone) {
        alert('Please fill in first name, last name, and phone number for the new customer');
        previewBtn.disabled = false;
        previewBtn.textContent = 'Complete Install';
        return;
      }

      installData = {
        ...installData,
        first_name: firstName,
        last_name: lastName,
        address: document.getElementById('address').value.trim(),
        city: document.getElementById('city').value.trim(),
        state: document.getElementById('state').value.trim(),
        zip: document.getElementById('zip').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim()
      };
      endpoint = '/installs/create-customer-install';
    } else {
      installData.customer_id = selectedCustomer.customer_id;
      endpoint = '/create-install';
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(installData)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const result = await response.json();
    console.log('Response result:', result);

    if (response.ok) {
      // Show success message with summary and print option
      showInstallSuccessWithSummary(result);
    } else {
      alert(`Error creating install: ${result.message}`);
      previewBtn.disabled = false;
      previewBtn.textContent = 'Complete Install';
    }

  } catch (error) {
    console.error('Error creating install:', error);
    alert('Failed to create install. Please try again.');
    previewBtn.disabled = false;
    previewBtn.textContent = 'Complete Install';
  }
}

function reviewInstall() {
  if (!selectedCustomer) {
    alert('Please select a customer');
    return;
  }

  const description = document.getElementById('installDescription').value.trim();
  const estimate = document.getElementById('installEstimate').value;
  const installDate = document.getElementById('installDate').value;

  if (!description || !estimate) {
    alert('Please fill in the install description and estimated cost');
    return;
  }

  // Validate new customer form if needed
  if (selectedCustomer === 'new') {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    
    if (!firstName || !lastName || !phone) {
      alert('Please fill in first name, last name, and phone number for the new customer');
      return;
    }
  }

  // Call submitInstall directly instead of showing popup
  submitInstall();
}

function submitInstall() {
  createInstall();
}

function closeInstallReview() {
  const summaryDiv = document.getElementById('installReviewPopup');
  if (summaryDiv) {
    document.body.removeChild(summaryDiv);
  }
}

function printInstallReview() {
  const summary = document.getElementById('installReviewPopup');
  if (summary) {
    document.body.removeChild(summary); // Temporarily remove popup
  }

  window.print();

  if (summary) {
    document.body.appendChild(summary); // Restore popup
  }
}

function showInstallSuccessWithSummary(result) {
  console.log('showInstallSuccessWithSummary called with:', result);
  
  // Don't hide the form sections - just show the success message at the bottom
  const successSection = document.getElementById('successMessage');
  const detailsDiv = document.getElementById('installDetails');
  
  console.log('Success section:', successSection);
  console.log('Details div:', detailsDiv);
  
  const installDescription = document.getElementById('installDescription').value;
  const installEstimate = parseFloat(document.getElementById('installEstimate').value);
  const installDate = document.getElementById('installDate').value ? new Date(document.getElementById('installDate').value) : new Date();
  
  // Get customer info
  const customerInfo = selectedCustomer === 'new' ? {
    name: `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}`,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value || 'N/A',
    address: `${document.getElementById('address').value || ''}, ${document.getElementById('city').value || ''}, ${document.getElementById('state').value || ''} ${document.getElementById('zip').value || ''}`.trim()
  } : {
    name: `${selectedCustomer.first_name} ${selectedCustomer.last_name}`,
    phone: selectedCustomer.phone,
    email: selectedCustomer.email || 'N/A',
    address: `${selectedCustomer.address || ''}, ${selectedCustomer.city || ''}, ${selectedCustomer.state || ''} ${selectedCustomer.zip || ''}`.trim()
  };
  
  // Calculate totals
  const itemsTotal = selectedItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const totalCost = itemsTotal + installEstimate;
  
  // Build items HTML
  let itemsHTML = '';
  if (selectedItems.length > 0) {
    itemsHTML = `
      <h3 style="color: #333; margin-top: 20px;">Install Items:</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Item</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Qty</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Price</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${selectedItems.map(item => {
            const price = parseFloat(item.price);
            const total = price * item.quantity;
            return `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.item_name} - ${item.item_color} - ${item.item_model}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${price.toFixed(2)}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${total.toFixed(2)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
        <tfoot>
          <tr style="background-color: #f8f9fa; font-weight: bold;">
            <td colspan="3" style="border: 1px solid #ddd; padding: 8px; text-align: right;">Items Subtotal:</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${itemsTotal.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    `;
  }
  
  detailsDiv.innerHTML = `
    <p><strong>Install ID:</strong> ${result.install_id}</p>
    <p><strong>Customer:</strong> ${customerInfo.name}</p>
    <p><strong>Total Items:</strong> ${selectedItems.length}</p>
    <p><strong>Total Amount:</strong> $${totalCost.toFixed(2)}</p>
    <div style="margin-top: 20px;">
      <button type="button" onclick="printInstallTicket({install_id: ${result.install_id}})" class="submit-button" style="background-color: #28a745; margin-right: 10px;">
        Print Install Ticket
      </button>
      <br><br>
      <button type="button" onclick="location.href='index.html'">Back to Home</button>
    </div>
  `;
  
  successSection.style.display = 'block';
  console.log('Success section display set to block');
}

function printInstallSummary() {
  // Get the current success message content
  const summaryContent = document.getElementById('installDetails').innerHTML;
  
  // Create print-friendly version
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Install Summary</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          color: #333;
        }
        h2, h3 { 
          color: #333; 
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 10px 0;
        }
        th, td { 
          border: 1px solid #ddd; 
          padding: 8px; 
          text-align: left;
        }
        th { 
          background-color: #f8f9fa; 
        }
        .cost-breakdown {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin-top: 20px;
        }
        .total {
          font-size: 18px;
          font-weight: bold;
          color: #28a745;
        }
        @media print {
          button, a { display: none; }
        }
      </style>
    </head>
    <body>
      ${summaryContent}
      <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
        Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
  
  // Auto-print after content loads
  printWindow.onload = function() {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
}

function showInstallSuccess(result) {
  // Hide the install form sections
  document.querySelector('.container').style.display = 'none';
  
  const successSection = document.getElementById('successMessage');
  const detailsDiv = document.getElementById('installDetails');
  
  const installDescription = document.getElementById('installDescription').value;
  const installEstimate = parseFloat(document.getElementById('installEstimate').value);
  const installDate = new Date(document.getElementById('installDate').value);
  
  detailsDiv.innerHTML = `
    <p><strong>Install ID:</strong> ${result.install_id}</p>
    <p><strong>Customer:</strong> ${selectedCustomer === 'new' ? 
      `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}` : 
      `${selectedCustomer.first_name} ${selectedCustomer.last_name}`}</p>
    <p><strong>Description:</strong> ${installDescription}</p>
    <p><strong>Estimate:</strong> $${installEstimate.toFixed(2)}</p>
    <p><strong>Scheduled Date:</strong> ${installDate.toLocaleDateString()}</p>
    <div style="margin-top: 20px;">
      <button onclick="printInstallTicket(${JSON.stringify(result).replace(/"/g, '&quot;')})" class="submit-button" style="background-color: #28a745; margin-right: 10px;">
        Print Install Ticket
      </button>
    </div>
  `;
  
  successSection.style.display = 'block';
}

function printInstallTicket(result) {
  // Use the new enhanced print function
  printInstallWithItems(result);
}

async function printInstallWithItems(result) {
  // Get current data
  const customerName = selectedCustomer === 'new' ? 
    `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}` : 
    `${selectedCustomer.first_name} ${selectedCustomer.last_name}`;
  
  const customerPhone = selectedCustomer === 'new' ? 
    document.getElementById('phone').value : 
    selectedCustomer.phone;
    
  const customerEmail = selectedCustomer === 'new' ? 
    document.getElementById('email').value : 
    selectedCustomer.email;

  const installDescription = document.getElementById('installDescription').value;
  const installEstimate = parseFloat(document.getElementById('installEstimate').value) || 0;
  const installDateValue = document.getElementById('installDate').value;
  const installDate = installDateValue ? new Date(installDateValue) : new Date();

  // Fetch install items
  let items = [];
  try {
    const response = await fetch(`/installs/${result.install_id}/items`);
    items = await response.json();
  } catch (error) {
    console.error('Error loading install items:', error);
  }

  const install = {
    install_id: result.install_id,
    first_name: customerName.split(' ')[0],
    last_name: customerName.split(' ').slice(1).join(' '),
    phone: customerPhone,
    email: customerEmail,
    description: installDescription,
    install_date: !isNaN(installDate.getTime()) ? installDate.toISOString() : new Date().toISOString(),
    estimate: installEstimate,
    install_items_total: items.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0),
    subtotal: installEstimate + items.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0),
    notes: document.getElementById('installNotes')?.value || '',
    items: items
  };

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Install Report - ${new Date().toLocaleDateString()}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .install-section { margin-bottom: 40px; page-break-inside: avoid; }
        .install-header { 
          background-color: #e9ecef; 
          padding: 10px; 
          margin-bottom: 15px; 
          border: 2px solid #ddd;
          font-weight: bold;
          font-size: 16px;
        }
        .install-info { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 10px; 
          margin-bottom: 15px; 
          padding: 10px;
          border: 1px solid #ddd;
        }
        .install-info div { margin: 5px 0; }
        .items-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 15px; 
        }
        .items-table th, .items-table td { 
          border: 1px solid #ddd; 
          padding: 8px; 
          text-align: left; 
        }
        .items-table th { 
          background-color: #f5f5f5; 
          font-weight: bold; 
        }
        .items-total { 
          background-color: #f8f9fa; 
          font-weight: bold; 
        }
        .no-items { 
          text-align: center; 
          color: #666; 
          font-style: italic; 
          padding: 20px; 
        }
        @media print { 
          body { margin: 0; } 
          .install-section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>iWoodFix-IT Detailed Install Report</h1>
        <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
        <p>Install Created Successfully</p>
      </div>
      
      <div class="install-section">
        <div class="install-header">
          Install #${install.install_id} - ${install.first_name} ${install.last_name}
        </div>
        
        <div class="install-info">
          <div><strong>Customer Name:</strong> ${install.first_name} ${install.last_name}</div>
          <div><strong>Phone:</strong> ${install.phone || 'N/A'}</div>
          <div><strong>Email:</strong> ${install.email || 'N/A'}</div>
          <div><strong>Install Date:</strong> ${new Date(install.install_date).toLocaleDateString()}</div>
          <div><strong>Description:</strong> ${install.description || 'N/A'}</div>
          <div><strong>Estimate:</strong> $${install.estimate.toFixed(2)}</div>
          <div><strong>Item Total:</strong> $${install.install_items_total.toFixed(2)}</div>
          <div><strong>Subtotal:</strong> $${install.subtotal.toFixed(2)}</div>
          <div style="grid-column: 1 / -1;"><strong>Notes:</strong> ${install.notes || 'N/A'}</div>
        </div>
        
        ${install.items && install.items.length > 0 ? `
          <table class="items-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Color/Model</th>
                <th>Unit Price</th>
                <th>Quantity</th>
                <th>Total Price</th>
              </tr>
            </thead>
            <tbody>
              ${install.items.map(item => `
                <tr>
                  <td>${item.item_name}</td>
                  <td>${item.item_color} ${item.item_model}</td>
                  <td>$${parseFloat(item.price).toFixed(2)}</td>
                  <td>${item.install_item_quantity}</td>
                  <td>$${parseFloat(item.total_price).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="items-total">
                <td colspan="4"><strong>Items Total:</strong></td>
                <td><strong>$${install.items.reduce((sum, item) => sum + parseFloat(item.total_price), 0).toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
        ` : '<div class="no-items">No items added to this install</div>'}
      </div>
      
      <script>
        window.onload = function() { 
          window.print(); 
          setTimeout(() => window.close(), 1000);
        }
      </script>
    </body>
    </html>
  `;
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(printContent);
  printWindow.document.close();
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
  const customerSearchInput = document.getElementById('customerSearch');
  const installDescription = document.getElementById('installDescription');
  const installEstimate = document.getElementById('installEstimate');
  const itemSearchInput = document.getElementById('itemSearch');
  
  customerSearchInput.addEventListener('input', debounce(searchCustomers, 300));
  installDescription.addEventListener('input', updateCreateButton);
  installEstimate.addEventListener('input', () => {
    updateCreateButton();
    updateTotalCosts();
  });
  
  // Item search and management
  itemSearchInput.addEventListener('input', debounce(searchItems, 300));
  document.getElementById('addItemBtn').addEventListener('click', addItemToInstall);
  
  document.getElementById('newCustomerBtn').addEventListener('click', showNewCustomerForm);
  document.getElementById('changeCustomerBtn').addEventListener('click', changeCustomer);
  document.getElementById('previewBtn').addEventListener('click', reviewInstall);

  // Hide customer results when clicking elsewhere
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.customer-search')) {
      document.getElementById('customerResults').style.display = 'none';
    }
  });
});

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

    const result = await response.json();

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

function createAnotherInstall() {
  // Reset everything
  selectedCustomer = null;
  selectedItems = [];
  
  // Reset forms
  document.getElementById('newCustomerForm').style.display = 'none';
  document.getElementById('selectedCustomer').style.display = 'none';
  document.getElementById('itemSelectionSection').style.display = 'none';
  document.getElementById('installDetailsSection').style.display = 'none';
  document.getElementById('successMessage').style.display = 'none';
  document.querySelector('.container').style.display = 'block';
  
  // Clear form inputs
  document.getElementById('customerSearch').value = '';
  document.getElementById('firstName').value = '';
  document.getElementById('lastName').value = '';
  document.getElementById('address').value = '';
  document.getElementById('city').value = '';
  document.getElementById('state').value = '';
  document.getElementById('zip').value = '';
  document.getElementById('phone').value = '';
  document.getElementById('email').value = '';
  document.getElementById('installDescription').value = '';
  document.getElementById('installEstimate').value = '';
  document.getElementById('installDate').value = '';
  document.getElementById('itemSearch').value = '';
  document.getElementById('itemResults').value = '';
  document.getElementById('itemQuantity').value = '1';
  
  // Update displays
  updateItemsTable();
  updateTotalCosts();
  
  updateCreateButton();
}

function showInstallSuccessWithSummary(result) {
  console.log('showInstallSuccessWithSummary called with:', result);
  
  // Hide the install form sections individually instead of the entire container
  const sections = document.querySelectorAll('.section');
  sections.forEach((section, index) => {
    // Hide all sections except the success message (which is the last one)
    if (section.id !== 'successMessage') {
      section.style.display = 'none';
    }
  });
  
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
    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <h2 style="color: #28a745; text-align: center; margin-bottom: 20px;">✅ Install Created Successfully!</h2>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
        <div>
          <h3 style="color: #333; border-bottom: 2px solid #28a745; padding-bottom: 5px;">Install Information</h3>
          <p><strong>Install ID:</strong> #${result.install_id}</p>
          <p><strong>Description:</strong> ${installDescription}</p>
          <p><strong>Scheduled Date:</strong> ${installDate.toLocaleDateString()}</p>
          <p><strong>Status:</strong> <span style="background: #ffc107; padding: 2px 8px; border-radius: 4px; color: black;">Scheduled</span></p>
        </div>
        
        <div>
          <h3 style="color: #333; border-bottom: 2px solid #17a2b8; padding-bottom: 5px;">Customer Details</h3>
          <p><strong>Name:</strong> ${customerInfo.name}</p>
          <p><strong>Phone:</strong> ${customerInfo.phone}</p>
          <p><strong>Email:</strong> ${customerInfo.email}</p>
          <p><strong>Address:</strong> ${customerInfo.address}</p>
        </div>
      </div>
      
      ${itemsHTML}
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px;">
        <h3 style="color: #333; margin-bottom: 10px;">Cost Breakdown:</h3>
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span>Labor Cost:</span>
          <span><strong>$${installEstimate.toFixed(2)}</strong></span>
        </div>
        ${selectedItems.length > 0 ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>Items Total:</span>
            <span><strong>$${itemsTotal.toFixed(2)}</strong></span>
          </div>
        ` : ''}
        <hr style="margin: 10px 0;">
        <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #28a745;">
          <span>Total Install Cost:</span>
          <span>$${totalCost.toFixed(2)}</span>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <button onclick="printInstallSummary()" style="background-color: #17a2b8; color: white; border: none; padding: 12px 24px; border-radius: 5px; cursor: pointer; margin-right: 10px; font-size: 16px;">
          🖨️ Print Install Summary
        </button>
        <button onclick="createAnotherInstall()" style="background-color: #28a745; color: white; border: none; padding: 12px 24px; border-radius: 5px; cursor: pointer; margin-right: 10px; font-size: 16px;">
          ➕ Create Another Install
        </button>
        <a href="install-summary.html" style="background-color: #6c757d; color: white; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-size: 16px;">
          📋 View All Installs
        </a>
      </div>
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

  const customerAddress = selectedCustomer === 'new' ? 
    `${document.getElementById('address').value}, ${document.getElementById('city').value}, ${document.getElementById('state').value} ${document.getElementById('zip').value}` : 
    `${selectedCustomer.address}, ${selectedCustomer.city}, ${selectedCustomer.state} ${selectedCustomer.zip}`;

  const installDescription = document.getElementById('installDescription').value;
  const installEstimate = parseFloat(document.getElementById('installEstimate').value);
  const installDate = new Date(document.getElementById('installDate').value);

  // Create customer copy (full detailed version)
  const customerCopy = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Install Ticket #${result.install_id} - Customer Copy</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          line-height: 1.4;
          font-size: 12px;
        }
        .header { 
          text-align: center; 
          border-bottom: 2px solid #333; 
          padding-bottom: 10px; 
          margin-bottom: 20px;
        }
        .company-name { 
          font-size: 18px; 
          font-weight: bold; 
          margin-bottom: 5px;
        }
        .ticket-title { 
          font-size: 16px; 
          font-weight: bold; 
          margin-bottom: 20px;
        }
        .copy-type {
          text-align: center;
          font-size: 14px;
          font-weight: bold;
          color: #007bff;
          margin-bottom: 15px;
        }
        .section { 
          margin-bottom: 15px; 
          padding: 10px;
          border: 1px solid #ccc;
        }
        .section-title { 
          font-weight: bold; 
          font-size: 14px; 
          margin-bottom: 8px;
          border-bottom: 1px solid #666;
          padding-bottom: 3px;
        }
        .info-row { 
          margin: 5px 0; 
        }
        .label { 
          font-weight: bold; 
          display: inline-block; 
          width: 120px;
        }
        .total-section {
          margin-top: 15px;
          padding: 10px;
          border: 2px solid #333;
          background-color: #f9f9f9;
        }
        .footer {
          margin-top: 30px;
          border-top: 1px solid #333;
          padding-top: 10px;
          text-align: center;
          font-size: 10px;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">iWoodFix-IT</div>
        <div>Professional Installation Services</div>
      </div>
      
      <div class="copy-type">CUSTOMER COPY</div>
      <div class="ticket-title">INSTALLATION TICKET #${result.install_id}</div>
      
      <div class="section">
        <div class="section-title">Customer Information</div>
        <div class="info-row"><span class="label">Name:</span> ${customerName}</div>
        <div class="info-row"><span class="label">Phone:</span> ${customerPhone}</div>
        <div class="info-row"><span class="label">Email:</span> ${customerEmail || 'N/A'}</div>
        <div class="info-row"><span class="label">Address:</span> ${customerAddress}</div>
      </div>
      
      <div class="section">
        <div class="section-title">Installation Details</div>
        <div class="info-row"><span class="label">Description:</span> ${installDescription}</div>
        <div class="info-row"><span class="label">Scheduled Date:</span> ${installDate.toLocaleDateString()} ${installDate.toLocaleTimeString()}</div>
        <div class="info-row"><span class="label">Created:</span> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
      </div>
      
      <div class="total-section">
        <div class="section-title">Cost Summary</div>
        <div class="info-row" style="font-size: 16px; font-weight: bold; margin-top: 10px;">
          <span class="label">TOTAL ESTIMATE:</span> $${installEstimate.toFixed(2)}
        </div>
      </div>
      
      <div class="footer">
        <p>Thank you for choosing iWoodFix-IT!</p>
        <p>This is an estimate. Final charges may vary based on actual work performed.</p>
        <p>Please keep this ticket for your records.</p>
      </div>
      
      <div class="no-print" style="margin-top: 20px; text-align: center;">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px;">Print Both Copies</button>
        <button onclick="window.close()" style="padding: 10px 20px; font-size: 14px; margin-left: 10px;">Close</button>
      </div>
    </body>
    </html>
    
    <div style="page-break-before: always;"></div>
    
    <!DOCTYPE html>
    <html>
    <head>
      <title>Install Ticket #${result.install_id} - Business Copy</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 10px; 
          line-height: 1.2;
          font-size: 10px;
        }
        .header { 
          text-align: center; 
          border-bottom: 1px solid #333; 
          padding-bottom: 5px; 
          margin-bottom: 10px;
        }
        .company-name { 
          font-size: 14px; 
          font-weight: bold; 
          margin-bottom: 2px;
        }
        .ticket-title { 
          font-size: 12px; 
          font-weight: bold; 
          margin-bottom: 10px;
        }
        .copy-type {
          text-align: center;
          font-size: 10px;
          font-weight: bold;
          color: #dc3545;
          margin-bottom: 8px;
        }
        .compact-section { 
          margin-bottom: 8px; 
          padding: 5px;
          border: 1px solid #ccc;
        }
        .compact-title { 
          font-weight: bold; 
          font-size: 10px; 
          margin-bottom: 3px;
          text-decoration: underline;
        }
        .compact-row { 
          margin: 2px 0;
          font-size: 9px; 
        }
        .compact-label { 
          font-weight: bold; 
          display: inline-block; 
          width: 60px;
        }
        .total-compact {
          background-color: #f0f0f0;
          padding: 5px;
          border: 1px solid #333;
          text-align: center;
          font-weight: bold;
          margin-top: 8px;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">iWoodFix-IT</div>
      </div>
      
      <div class="copy-type">BUSINESS COPY</div>
      <div class="ticket-title">INSTALL #${result.install_id}</div>
      
      <div class="compact-section">
        <div class="compact-title">Customer</div>
        <div class="compact-row"><span class="compact-label">Name:</span> ${customerName}</div>
        <div class="compact-row"><span class="compact-label">Phone:</span> ${customerPhone}</div>
      </div>
      
      <div class="compact-section">
        <div class="compact-title">Installation</div>
        <div class="compact-row"><span class="compact-label">Work:</span> ${installDescription.length > 50 ? installDescription.substring(0, 50) + '...' : installDescription}</div>
        <div class="compact-row"><span class="compact-label">Scheduled:</span> ${installDate.toLocaleDateString()}</div>
        <div class="compact-row"><span class="compact-label">Created:</span> ${new Date().toLocaleDateString()}</div>
      </div>
      
      <div class="total-compact">
        ESTIMATE: $${installEstimate.toFixed(2)}
      </div>
      
      <div style="margin-top: 10px; text-align: center; font-size: 8px;">
        Created: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
      </div>
    </body>
    </html>
  `;

  // Open print window with both copies
  const printWindow = window.open('', '_blank');
  printWindow.document.write(customerCopy);
  printWindow.document.close();
  
  // Auto-print after content loads
  printWindow.onload = function() {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
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
  document.getElementById('createAnotherBtn').addEventListener('click', createAnotherInstall);

  // Hide customer results when clicking elsewhere
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.customer-search')) {
      document.getElementById('customerResults').style.display = 'none';
    }
  });
});

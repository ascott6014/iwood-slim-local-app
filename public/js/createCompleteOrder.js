let selectedCustomer = null;
let selectedItems = [];

// Function to update form data for preview and submit
function updateFormAndPreview() {
  // Validate first
  if (!selectedCustomer || selectedItems.length === 0) {
    alert('Please select a customer and add items to the order');
    return;
  }

  // If new customer, validate required fields
  if (selectedCustomer === 'new') {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    
    if (!firstName || !lastName || !phone) {
      alert('Please fill in first name, last name, and phone number for the new customer');
      return;
    }
  }

  // Call the createOrder function directly
  createOrder();
}

function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Customer Search Functions
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
}

function showNewCustomerForm() {
  document.getElementById('newCustomerForm').style.display = 'block';
  document.getElementById('customerResults').style.display = 'none';
  selectedCustomer = 'new'; // Flag to indicate new customer
  document.getElementById('itemSelectionSection').style.display = 'block';
}

function changeCustomer() {
  selectedCustomer = null;
  document.getElementById('selectedCustomer').style.display = 'none';
  document.getElementById('newCustomerForm').style.display = 'none';
  document.getElementById('itemSelectionSection').style.display = 'none';
  document.getElementById('customerSearch').value = '';
}

// Item Search Functions
async function searchItems() {
  const searchInput = document.getElementById('itemSearch');
  const resultsSelect = document.getElementById('itemResults');
  
  const query = searchInput.value.trim();
  if (query.length < 2) {
    resultsSelect.innerHTML = '<option value="">Select an item...</option>';
    return;
  }

  try {
    const response = await fetch(`/api/items/search?q=${encodeURIComponent(query)}`);
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
      // Convert price to number before using toFixed
      const price = parseFloat(item.price) || 0;
      option.textContent = `${item.item_name} - ${item.item_color} - ${item.item_model} ($${price.toFixed(2)})`;
      resultsSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error searching items:', error);
    resultsSelect.innerHTML = '<option value="">Error loading items</option>';
  }
}

function addItemToOrder() {
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
  document.getElementById('itemSearch').value = '';
  document.getElementById('itemResults').innerHTML = '<option value="">Select an item...</option>';
  document.getElementById('itemQuantity').value = '1';

  updateItemsTable();
}

function removeItem(index) {
  selectedItems.splice(index, 1);
  updateItemsTable();
}

function updateQuantity(index, newQuantity) {
  const quantity = parseInt(newQuantity);
  if (quantity <= 0) {
    removeItem(index);
  } else {
    selectedItems[index].quantity = quantity;
    updateItemsTable();
  }
}

function updateItemsTable() {
  const tbody = document.getElementById('selectedItemsBody');
  const noItemsRow = document.getElementById('noItemsRow');
  const previewBtn = document.getElementById('previewBtn');

  if (selectedItems.length === 0) {
    tbody.innerHTML = '<tr id="noItemsRow"><td colspan="7" style="text-align: center; color: #666;">No items added yet</td></tr>';
    document.getElementById('orderTotal').textContent = '$0.00';
    previewBtn.disabled = true;
    return;
  }

  let total = 0;
  tbody.innerHTML = selectedItems.map((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    return `
      <tr>
        <td>${item.item_name}</td>
        <td>${item.item_color}</td>
        <td>${item.item_model}</td>
        <td>$${parseFloat(item.price).toFixed(2)}</td>
        <td>
          <input type="number" value="${item.quantity}" min="1" 
                 onchange="updateQuantity(${index}, this.value)"
                 style="width: 60px;" />
        </td>
        <td>$${itemTotal.toFixed(2)}</td>
        <td>
          <button onclick="removeItem(${index})" class="summary-table button" 
                  style="background-color: #dc3545;">Remove</button>
        </td>
      </tr>
    `;
  }).join('');

  document.getElementById('orderTotal').textContent = `$${total.toFixed(2)}`;
  previewBtn.disabled = !selectedCustomer || selectedItems.length === 0;
}

async function createOrder() {
  console.log('selectedCustomer:', selectedCustomer);
  console.log('selectedItems:', selectedItems);
  
  if (!selectedCustomer || selectedItems.length === 0) {
    alert('Please select a customer and add items to the order');
    return;
  }

  const previewBtn = document.getElementById('previewBtn');
  previewBtn.disabled = true;
  previewBtn.textContent = 'Creating Order...';

  try {
    let orderData = {
      items: selectedItems.map(item => ({
        item_id: item.item_id,
        quantity: item.quantity
      }))
    };

    if (selectedCustomer === 'new') {
      // Validate new customer form
      const firstName = document.getElementById('firstName').value.trim();
      const lastName = document.getElementById('lastName').value.trim();
      const phone = document.getElementById('phone').value.trim();
      
      if (!firstName || !lastName || !phone) {
        alert('Please fill in first name, last name, and phone number for the new customer');
        previewBtn.disabled = false;
        previewBtn.textContent = 'Complete Order';
        return;
      }

      orderData.customer = {
        first_name: firstName,
        last_name: lastName,
        address: document.getElementById('address').value.trim(),
        city: document.getElementById('city').value.trim(),
        state: document.getElementById('state').value.trim(),
        zip: document.getElementById('zip').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim()
      };
    } else {
      orderData.customer_id = selectedCustomer.customer_id;
    }

    console.log('Sending orderData:', JSON.stringify(orderData, null, 2));

    const response = await fetch('/orders/create-complete-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();

    if (response.ok) {
      // Show success message instead of redirecting immediately
      showOrderSuccess(result);
    } else {
      alert(`Error creating order: ${result.message}`);
      previewBtn.disabled = false;
      previewBtn.textContent = 'Complete Order';
    }

  } catch (error) {
    console.error('Error creating order:', error);
    alert('Failed to create order. Please try again.');
    previewBtn.disabled = false;
    previewBtn.textContent = 'Complete Order';
  }
}

function reviewOrder() {
  if (!selectedCustomer || selectedItems.length === 0) {
    alert('Please select a customer and add items to the order');
    return;
  }

  // Prepare customer info
  let customerInfo;
  if (selectedCustomer === 'new') {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    
    if (!firstName || !lastName || !phone) {
      alert('Please fill in first name, last name, and phone number for the new customer');
      return;
    }

    customerInfo = {
      name: `${firstName} ${lastName}`,
      address: document.getElementById('address').value.trim(),
      city: document.getElementById('city').value.trim(),
      state: document.getElementById('state').value.trim(),
      zip: document.getElementById('zip').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      email: document.getElementById('email').value.trim()
    };
  } else {
    customerInfo = {
      name: `${selectedCustomer.first_name} ${selectedCustomer.last_name}`,
      address: selectedCustomer.address,
      city: selectedCustomer.city,
      state: selectedCustomer.state,
      zip: selectedCustomer.zip,
      phone: selectedCustomer.phone,
      email: selectedCustomer.email
    };
  }

  // Create summary HTML
  let summaryHTML = `
    <h2>Order Review</h2>
    <div style="text-align: left;">
      <h3>Customer Information:</h3>
      <p><strong>Name:</strong> ${customerInfo.name}</p>
      <p><strong>Phone:</strong> ${customerInfo.phone}</p>
      <p><strong>Email:</strong> ${customerInfo.email}</p>
      <p><strong>Address:</strong> ${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zip}</p>
      
      <h3>Order Items:</h3>
      <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Item</th>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Qty</th>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Price</th>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
  `;

  let orderTotal = 0;
  selectedItems.forEach(item => {
    const itemTotal = item.price * item.quantity;
    orderTotal += itemTotal;
    summaryHTML += `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.item_name} - ${item.item_color} - ${item.item_model}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${parseFloat(item.price).toFixed(2)}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${itemTotal.toFixed(2)}</td>
      </tr>
    `;
  });

  summaryHTML += `
        </tbody>
        <tfoot>
          <tr style="background-color: #f8f9fa; font-weight: bold;">
            <td colspan="3" style="padding: 8px; border: 1px solid #ddd; text-align: right;">Order Total:</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${orderTotal.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      
      <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
    </div>
    <div style="margin-top: 20px; text-align: center;">
      <button onclick="printOrderReview()" style="padding: 10px 20px; margin: 5px; background-color: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer;">🖨️ Print</button>
      <button onclick="submitOrder()" style="padding: 10px 20px; margin: 5px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">✅ Confirm & Submit</button>
      <button onclick="closeOrderReview()" style="padding: 10px 20px; margin: 5px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">❌ Cancel</button>
    </div>
  `;

  const summaryDiv = document.createElement('div');
  summaryDiv.id = 'orderReviewPopup';
  summaryDiv.innerHTML = summaryHTML;
  document.body.appendChild(summaryDiv);

  Object.assign(summaryDiv.style, {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: '30px',
    background: '#fff',
    boxShadow: '0 0 15px rgba(0,0,0,0.2)',
    zIndex: '9999',
    maxHeight: '90vh',
    overflowY: 'auto',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '700px',
  });
}

function submitOrder() {
  closeOrderReview();
  createOrder();
}

function closeOrderReview() {
  const summaryDiv = document.getElementById('orderReviewPopup');
  if (summaryDiv) {
    document.body.removeChild(summaryDiv);
  }
}

function printOrderReview() {
  const summary = document.getElementById('orderReviewPopup');
  if (summary) {
    document.body.removeChild(summary); // Temporarily remove popup
  }

  window.print();

  if (summary) {
    document.body.appendChild(summary); // Restore popup
  }
}

function showOrderSuccess(result) {
  // Don't hide the form sections - just show the success message at the bottom
  const successSection = document.getElementById('successMessage');
  const detailsDiv = document.getElementById('orderDetails');
  
  // Calculate total
  let totalAmount = 0;
  selectedItems.forEach(item => {
    totalAmount += (parseFloat(item.price) * item.quantity);
  });
  
  detailsDiv.innerHTML = `
    <p><strong>Order ID:</strong> ${result.order_id}</p>
    <p><strong>Customer:</strong> ${selectedCustomer === 'new' ? 
      `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}` : 
      `${selectedCustomer.first_name} ${selectedCustomer.last_name}`}</p>
    <p><strong>Total Items:</strong> ${selectedItems.length}</p>
    <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
    <div style="margin-top: 20px;">
      <button type="button" onclick="printOrderTicket({order_id: ${result.order_id}, customer_id: ${result.customer_id}})" class="submit-button" style="background-color: #28a745; margin-right: 10px;">
        Print Order Ticket
      </button>
      <br><br>
      <button type="button" onclick="location.href='index.html'">⬅️ Back to Home</button>
    </div>
  `;
  
  successSection.style.display = 'block';
}

function printOrderTicket(result) {
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

  // Calculate total
  let totalAmount = 0;
  selectedItems.forEach(item => {
    totalAmount += (parseFloat(item.price) * item.quantity);
  });

  // Create customer copy (full detailed version)
  const customerCopy = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Order Ticket #${result.order_id} - Customer Copy</title>
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
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        .items-table th, .items-table td {
          border: 1px solid #333;
          padding: 5px;
          text-align: left;
        }
        .items-table th {
          background-color: #f0f0f0;
          font-weight: bold;
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
      </div>
      
      <div class="copy-type">CUSTOMER COPY</div>
      <div class="ticket-title">ORDER TICKET #${result.order_id}</div>
      
      <div class="section">
        <div class="section-title">Customer Information</div>
        <div class="info-row"><span class="label">Name:</span> ${customerName}</div>
        <div class="info-row"><span class="label">Phone:</span> ${customerPhone}</div>
        <div class="info-row"><span class="label">Email:</span> ${customerEmail || 'N/A'}</div>
        <div class="info-row"><span class="label">Address:</span> ${customerAddress}</div>
      </div>
      
      <div class="section">
        <div class="section-title">Order Items</div>
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Color/Model</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${selectedItems.map(item => `
              <tr>
                <td>${item.item_name}</td>
                <td>${item.item_color} ${item.item_model}</td>
                <td>$${parseFloat(item.price).toFixed(2)}</td>
                <td>${item.quantity}</td>
                <td>$${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="total-section">
        <div class="section-title">Order Summary</div>
        <div class="info-row"><span class="label">Total Items:</span> ${selectedItems.length}</div>
        <div class="info-row"><span class="label">Order Date:</span> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
        <div class="info-row" style="font-size: 16px; font-weight: bold; margin-top: 10px;">
          <span class="label">TOTAL AMOUNT:</span> $${totalAmount.toFixed(2)}
        </div>
      </div>
      
      <div class="footer">
        <p>Thank you for choosing iWoodFix-IT!</p>
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
      <title>Order Ticket #${result.order_id} - Business Copy</title>
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
        .items-compact {
          font-size: 8px;
          max-height: 60px;
          overflow: hidden;
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
      <div class="ticket-title">ORDER #${result.order_id}</div>
      
      <div class="compact-section">
        <div class="compact-title">Customer</div>
        <div class="compact-row"><span class="compact-label">Name:</span> ${customerName}</div>
        <div class="compact-row"><span class="compact-label">Phone:</span> ${customerPhone}</div>
      </div>
      
      <div class="compact-section">
        <div class="compact-title">Order Items (${selectedItems.length} items)</div>
        <div class="items-compact">
          ${selectedItems.slice(0, 3).map(item => `
            <div class="compact-row">${item.item_name} - ${item.quantity}x</div>
          `).join('')}
          ${selectedItems.length > 3 ? `<div class="compact-row">... +${selectedItems.length - 3} more items</div>` : ''}
        </div>
        <div class="compact-row"><span class="compact-label">Date:</span> ${new Date().toLocaleDateString()}</div>
      </div>
      
      <div class="total-compact">
        TOTAL: $${totalAmount.toFixed(2)}
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
  const itemSearchInput = document.getElementById('itemSearch');
  
  customerSearchInput.addEventListener('input', debounce(searchCustomers, 300));
  itemSearchInput.addEventListener('input', debounce(searchItems, 300));
  
  document.getElementById('newCustomerBtn').addEventListener('click', showNewCustomerForm);
  document.getElementById('changeCustomerBtn').addEventListener('click', changeCustomer);
  document.getElementById('addItemBtn').addEventListener('click', addItemToOrder);
  document.getElementById('previewBtn').addEventListener('click', updateFormAndPreview);

  // Hide customer results when clicking elsewhere
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.customer-search')) {
      document.getElementById('customerResults').style.display = 'none';
    }
  });
});

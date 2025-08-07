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
          <span class="contact-info">${customer.address}, ${customer.city}, ${customer.state} ${customer.zip}</span>
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
      <span class="contact-info">${address}, ${city}, ${state} ${zip}</span>
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
    tbody.innerHTML = '<tr id="noItemsRow"><td colspan="7" class="empty-state-table">No items added yet</td></tr>';
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
          <button onclick="removeItem(${index})" class="remove-item-btn">Remove</button>
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
    <div class="text-left">
      <h3>Customer Information:</h3>
      <p><strong>Name:</strong> ${customerInfo.name}</p>
      <p><strong>Phone:</strong> ${customerInfo.phone}</p>
      <p><strong>Email:</strong> ${customerInfo.email}</p>
      <p><strong>Address:</strong> ${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zip}</p>
      
      <h3>Order Items:</h3>
      <table class="success-items-table">
        <thead>
          <tr>
            <th class="text-left">Item</th>
            <th class="text-center">Qty</th>
            <th class="text-right">Price</th>
            <th class="text-right">Total</th>
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
        <td>${item.item_name} - ${item.item_color} - ${item.item_model}</td>
        <td class="text-center">${item.quantity}</td>
        <td class="text-right">$${parseFloat(item.price).toFixed(2)}</td>
        <td class="text-right">$${itemTotal.toFixed(2)}</td>
      </tr>
    `;
  });

  summaryHTML += `
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" class="text-right">Order Total:</td>
            <td class="text-right">$${orderTotal.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      
      <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
    </div>
    <div class="success-actions">
      <button onclick="printOrderReview()" class="success-print-btn">Print</button>
      <button onclick="submitOrder()" class="success-print-btn" style="background-color: #28a745;">Confirm & Submit</button>
      <button onclick="closeOrderReview()" class="success-home-btn">Cancel</button>
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
  // Use the new enhanced print function
  printOrderWithItems(result);
}

async function printOrderWithItems(result) {
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

  // Fetch order items
  let items = [];
  try {
    const response = await fetch(`/api/orders/${result.order_id}/items`);
    items = await response.json();
  } catch (error) {
    console.error('Error loading order items:', error);
  }

  const order = {
    order_id: result.order_id,
    first_name: customerName.split(' ')[0],
    last_name: customerName.split(' ').slice(1).join(' '),
    phone: customerPhone,
    email: customerEmail,
    order_date: new Date().toISOString(),
    subtotal: items.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0),
    items: items
  };

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Order Report - ${new Date().toLocaleDateString()}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .order-section { margin-bottom: 40px; page-break-inside: avoid; }
        .order-header { 
          background-color: #e9ecef; 
          padding: 10px; 
          margin-bottom: 15px; 
          border: 2px solid #ddd;
          font-weight: bold;
          font-size: 16px;
        }
        .order-info { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 10px; 
          margin-bottom: 15px; 
          padding: 10px;
          border: 1px solid #ddd;
        }
        .order-info div { margin: 5px 0; }
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
          .order-section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>iWoodFix-IT Detailed Order Report</h1>
        <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
        <p>Order Created Successfully</p>
      </div>
      
      <div class="order-section">
        <div class="order-header">
          Order #${order.order_id} - ${order.first_name} ${order.last_name}
        </div>
        
        <div class="order-info">
          <div><strong>Customer Name:</strong> ${order.first_name} ${order.last_name}</div>
          <div><strong>Phone:</strong> ${order.phone || 'N/A'}</div>
          <div><strong>Email:</strong> ${order.email || 'N/A'}</div>
          <div><strong>Order Date:</strong> ${new Date(order.order_date).toLocaleDateString()}</div>
          <div><strong>Subtotal:</strong> $${order.subtotal.toFixed(2)}</div>
          <div style="grid-column: 1 / -1;"><strong>Order Created Successfully!</strong></div>
        </div>
        
        ${order.items && order.items.length > 0 ? `
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
              ${order.items.map(item => `
                <tr>
                  <td>${item.item_name}</td>
                  <td>${item.item_color} ${item.item_model}</td>
                  <td>$${parseFloat(item.price).toFixed(2)}</td>
                  <td>${item.order_item_quantity}</td>
                  <td>$${parseFloat(item.total_price).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="items-total">
                <td colspan="4"><strong>Items Total:</strong></td>
                <td><strong>$${order.items.reduce((sum, item) => sum + parseFloat(item.total_price), 0).toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
        ` : '<div class="no-items">No items added to this order</div>'}
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

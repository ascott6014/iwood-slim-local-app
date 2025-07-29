let selectedCustomer = null;
let selectedItems = [];

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
      option.textContent = `${item.item_name} - ${item.item_color} - ${item.item_model} ($${item.price.toFixed(2)})`;
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
  const reviewOrderBtn = document.getElementById('reviewOrderBtn');

  if (selectedItems.length === 0) {
    tbody.innerHTML = '<tr id="noItemsRow"><td colspan="7" style="text-align: center; color: #666;">No items added yet</td></tr>';
    document.getElementById('orderTotal').textContent = '$0.00';
    reviewOrderBtn.disabled = true;
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
  reviewOrderBtn.disabled = !selectedCustomer;
}

async function createOrder() {
  if (!selectedCustomer || selectedItems.length === 0) {
    alert('Please select a customer and add items to the order');
    return;
  }

  const reviewOrderBtn = document.getElementById('reviewOrderBtn');
  reviewOrderBtn.disabled = true;
  reviewOrderBtn.textContent = 'Creating Order...';

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
        reviewOrderBtn.disabled = false;
        reviewOrderBtn.textContent = 'Review & Submit Order';
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

    const response = await fetch('/orders/create-complete-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();

    if (response.ok) {
      // Redirect to homepage after successful order creation
      alert(`Order created successfully! Order ID: ${result.order_id}`);
      window.location.href = 'index.html';
    } else {
      alert(`Error creating order: ${result.message}`);
      reviewOrderBtn.disabled = false;
      reviewOrderBtn.textContent = 'Review & Submit Order';
    }

  } catch (error) {
    console.error('Error creating order:', error);
    alert('Failed to create order. Please try again.');
    reviewOrderBtn.disabled = false;
    reviewOrderBtn.textContent = 'Review & Submit Order';
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

function createAnotherOrder() {
  // Reset everything
  selectedCustomer = null;
  selectedItems = [];
  
  // Reset forms
  document.getElementById('newCustomerForm').style.display = 'none';
  document.getElementById('selectedCustomer').style.display = 'none';
  document.getElementById('itemSelectionSection').style.display = 'none';
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
  
  updateItemsTable();
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
  document.getElementById('reviewOrderBtn').addEventListener('click', reviewOrder);
  document.getElementById('createAnotherBtn').addEventListener('click', createAnotherOrder);

  // Hide customer results when clicking elsewhere
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.customer-search')) {
      document.getElementById('customerResults').style.display = 'none';
    }
  });
});

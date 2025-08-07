function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Global variables
let allOrders = [];
let filteredOrders = [];

// Select/Print functionality
function selectAll() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"].order-select');
  checkboxes.forEach(cb => cb.checked = true);
  updatePrintButton();
}

function selectNone() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"].order-select');
  checkboxes.forEach(cb => cb.checked = false);
  updatePrintButton();
}

function updatePrintButton() {
  const selectedCheckboxes = document.querySelectorAll('input[type="checkbox"].order-select:checked');
  const printBtn = document.getElementById('printSelectedBtn');
  const countSpan = document.getElementById('selectedCount');
  
  if (selectedCheckboxes.length > 0) {
    printBtn.disabled = false;
    countSpan.textContent = selectedCheckboxes.length;
  } else {
    printBtn.disabled = true;
    countSpan.textContent = '0';
  }
}

function toggleSelectAll(type) {
  const selectAllCheckbox = document.getElementById('selectAllOrders');
  const orderCheckboxes = document.querySelectorAll('input[type="checkbox"].order-select');
  
  orderCheckboxes.forEach(cb => {
    cb.checked = selectAllCheckbox.checked;
  });
  
  updatePrintButton();
}

function printSelectedOrders() {
  const selectedOrders = [];
  const checkboxes = document.querySelectorAll('input[type="checkbox"].order-select:checked');
  
  checkboxes.forEach(cb => {
    const orderId = cb.value;
    const order = allOrders.find(o => o.order_id == orderId);
    if (order) selectedOrders.push(order);
  });
  
  if (selectedOrders.length === 0) {
    alert('Please select at least one order to print.');
    return;
  }
  
  printOrderListWithItems(selectedOrders);
}

async function printOrderListWithItems(orders) {
  // Fetch items for each order
  const ordersWithItems = await Promise.all(
    orders.map(async (order) => {
      try {
        const response = await fetch(`/api/orders/${order.order_id}/items`);
        const items = await response.json();
        return { ...order, items };
      } catch (error) {
        console.error(`Error loading items for order ${order.order_id}:`, error);
        return { ...order, items: [] };
      }
    })
  );

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
        <p>Total Orders: ${ordersWithItems.length}</p>
      </div>
      
      ${ordersWithItems.map(order => `
        <div class="order-section">
          <div class="order-header">
            Order #${order.order_id} - ${order.first_name} ${order.last_name}
          </div>
          
          <div class="order-info">
            <div><strong>Customer ID:</strong> ${order.customer_id || 'N/A'}</div>
            <div><strong>Phone:</strong> ${order.phone || 'N/A'}</div>
            <div><strong>Email:</strong> ${order.email || 'N/A'}</div>
            <div><strong>Order Date:</strong> ${new Date(order.order_date).toLocaleDateString()}</div>
            <div><strong>Subtotal:</strong> $${order.subtotal ? parseFloat(order.subtotal).toFixed(2) : '0.00'}</div>
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
          ` : '<div class="no-items">No items found for this order</div>'}
        </div>
      `).join('')}
      
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

function printOrderList(orders) {
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Order Report - ${new Date().toLocaleDateString()}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .order-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .order-table th, .order-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .order-table th { background-color: #f5f5f5; font-weight: bold; }
        .order-header { background-color: #e9ecef; font-weight: bold; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>iWoodFix-IT Order Report</h1>
        <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
        <p>Total Orders: ${orders.length}</p>
      </div>
      
      <table class="order-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Items</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${orders.map(order => `
            <tr>
              <td>${order.order_id}</td>
              <td>${order.first_name} ${order.last_name}</td>
              <td>${new Date(order.order_date).toLocaleDateString()}</td>
              <td>${order.item_count || 0}</td>
              <td>$${order.subtotal ? parseFloat(order.subtotal).toFixed(2) : '0.00'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
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

// Sorting functionality
function applySorting() {
  const activeSort = document.querySelector('.filter-btn[data-sort].active');
  if (!activeSort || activeSort.getAttribute('data-sort') === 'none') {
    filteredOrders = [...allOrders];
  } else {
    const sortType = activeSort.getAttribute('data-sort');
    filteredOrders = [...allOrders].sort((a, b) => {
      switch (sortType) {
        case 'customer-asc':
          return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
        case 'customer-desc':
          return `${b.first_name} ${b.last_name}`.localeCompare(`${a.first_name} ${a.last_name}`);
        case 'date-newest':
          return new Date(b.order_date) - new Date(a.order_date);
        case 'date-oldest':
          return new Date(a.order_date) - new Date(b.order_date);
        default:
          return 0;
      }
    });
  }
  renderOrders();
}

// Item expansion functionality
async function expandRow(orderId) {
  const existingRow = document.getElementById(`items-${orderId}`);
  if (existingRow) {
    existingRow.remove();
    return;
  }

  try {
    const response = await fetch(`/api/orders/${orderId}/items`);
    const items = await response.json();
    
    const orderRow = document.querySelector(`tr[data-order-id="${orderId}"]`);
    const itemsRow = document.createElement('tr');
    itemsRow.id = `items-${orderId}`;
    itemsRow.className = 'items-breakdown';
    
    const itemsHtml = items.length > 0 ? `
      <div class="items-container item-container-padding">
        <h4>Order Items:</h4>
        <table class="success-items-table">
          <thead>
            <tr>
              <th class="text-left">Item</th>
              <th class="text-left">Color/Model</th>
              <th class="text-right">Price</th>
              <th class="text-center">Qty</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td>${item.item_name}</td>
                <td>${item.item_color} ${item.item_model}</td>
                <td class="text-right">$${parseFloat(item.price).toFixed(2)}</td>
                <td class="text-center">${item.order_item_quantity}</td>
                <td class="text-right">$${parseFloat(item.total_price).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" class="text-right">Total:</td>
              <td class="text-right">$${items.reduce((sum, item) => sum + parseFloat(item.total_price), 0).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    ` : '<div class="items-breakdown-no-items">No items found for this order</div>';

    itemsRow.innerHTML = `<td colspan="10" class="items-breakdown-container">${itemsHtml}</td>`;
    orderRow.insertAdjacentElement('afterend', itemsRow);
    
  } catch (error) {
    console.error('Error loading order items:', error);
    alert('Failed to load order items');
  }
}

async function loadOrders() {
  const customerId = document.getElementById('customer_id').value;
  try {
    const res = await fetch(`/summary/orders${customerId ? `?customer_id=${customerId}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch order summary');
    
    allOrders = await res.json();
    applySorting();
  } catch (err) {
    console.error(err);
    alert('Could not load orders. Try again later.');
  }
}

function renderOrders() {
  const tbody = document.getElementById('order-body');
  tbody.innerHTML = '';

  filteredOrders.forEach(order => {
    const tr = document.createElement('tr');
    tr.setAttribute('data-order-id', order.order_id);
    tr.innerHTML = `
      <td><input type="checkbox" class="order-select" value="${order.order_id}" onchange="updatePrintButton()"></td>
      <td>${order.order_id}</td>
      <td>${order.customer_id || 'N/A'}</td>
      <td>${order.first_name} ${order.last_name}</td>
      <td>${order.email || 'N/A'}</td>
      <td>${order.phone || 'N/A'}</td>
      <td>${new Date(order.order_date).toLocaleDateString()}</td>
      <td>$${order.subtotal ? parseFloat(order.subtotal).toFixed(2) : '0.00'}</td>
      <td>
        <button class="expand-btn" onclick="expandRow(${order.order_id})" title="View order items">
          Expand
        </button>
      </td>
      <td>
        <button onclick="modifyOrder(${order.order_id})" class="summary-table button">Modify</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  
  // Update print button state after rendering
  updatePrintButton();
}

function printOrder(orderId) {
  // Implementation for printing individual order
  window.open(`/orders/print/${orderId}`, '_blank');
}

function editOrder(orderId) {
  // Use the modal functionality instead of separate page
  modifyOrder(orderId);
}

// Modal functionality for comprehensive order editing
async function modifyOrder(orderId) {
  try {
    // Fetch order details
    const orderResponse = await fetch(`/api/orders/${orderId}`);
    if (!orderResponse.ok) throw new Error('Failed to fetch order details');
    const order = await orderResponse.json();
    
    // Populate the modal with order data
    populateOrderModal(order);
    
    // Load current order items
    await loadCurrentOrderItems(orderId);
    
    // Load available items for adding
    await loadAvailableItems();
    
    // Show the modal
    document.getElementById('editOrderModal').style.display = 'block';
    
  } catch (error) {
    console.error('Error loading order details:', error);
    alert('Failed to load order details. Please try again.');
  }
}

function populateOrderModal(order) {
  document.getElementById('edit_order_id').value = order.order_id;
  document.getElementById('edit_order_date').value = order.order_date ? order.order_date.split('T')[0] : '';
  document.getElementById('edit_customer_name').value = `${order.first_name} ${order.last_name}`;
}

async function loadCurrentOrderItems(orderId) {
  try {
    const response = await fetch(`/api/orders/${orderId}/items`);
    if (!response.ok) throw new Error('Failed to fetch order items');
    const items = await response.json();
    
    const tbody = document.getElementById('current_order_items');
    tbody.innerHTML = '';
    
    let total = 0;
    
    items.forEach(item => {
      const itemTotal = parseFloat(item.total_price);
      total += itemTotal;
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.item_name}</td>
        <td>${item.item_color} ${item.item_model}</td>
        <td>$${parseFloat(item.price).toFixed(2)}</td>
        <td>
          <input type="number" value="${item.order_item_quantity}" min="1" 
                 onchange="updateItemQuantity(${item.order_item_id}, this.value)" 
                 style="width: 60px; text-align: center;">
        </td>
        <td>$${itemTotal.toFixed(2)}</td>
        <td>
          <button onclick="removeItemFromOrder(${item.order_item_id})" class="delete-btn" style="padding: 4px 8px; font-size: 12px;">Remove</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
    
    document.getElementById('order_total').textContent = total.toFixed(2);
    
  } catch (error) {
    console.error('Error loading order items:', error);
    alert('Failed to load order items.');
  }
}

async function loadAvailableItems() {
  try {
    const response = await fetch('/api/items/sell');
    if (!response.ok) throw new Error('Failed to fetch available items');
    const items = await response.json();
    
    const select = document.getElementById('available_items');
    select.innerHTML = '<option value="">Select an item...</option>';
    
    items.forEach(item => {
      const option = document.createElement('option');
      option.value = item.item_id;
      option.textContent = `${item.item_name} - ${item.item_color} ${item.item_model}`;
      option.dataset.price = item.price;
      option.dataset.quantity = item.quantity;
      select.appendChild(option);
    });
    
    // Store items for search functionality
    window.availableItems = items;
    
  } catch (error) {
    console.error('Error loading available items:', error);
    alert('Failed to load available items.');
  }
}

function searchAvailableItems() {
  const searchTerm = document.getElementById('item_search').value.toLowerCase();
  const select = document.getElementById('available_items');
  
  if (!window.availableItems) return;
  
  select.innerHTML = '<option value="">Select an item...</option>';
  
  const filteredItems = window.availableItems.filter(item => 
    item.item_name.toLowerCase().includes(searchTerm) ||
    item.item_color.toLowerCase().includes(searchTerm) ||
    item.item_model.toLowerCase().includes(searchTerm)
  );
  
  filteredItems.forEach(item => {
    const option = document.createElement('option');
    option.value = item.item_id;
    option.textContent = `${item.item_name} - ${item.item_color} ${item.item_model}`;
    option.dataset.price = item.price;
    option.dataset.quantity = item.quantity;
    select.appendChild(option);
  });
}

function populateItemDetails() {
  const select = document.getElementById('available_items');
  const selectedOption = select.options[select.selectedIndex];
  const detailsDiv = document.getElementById('item_details');
  
  if (selectedOption.value) {
    document.getElementById('item_price').textContent = parseFloat(selectedOption.dataset.price).toFixed(2);
    document.getElementById('item_available').textContent = selectedOption.dataset.quantity;
    detailsDiv.style.display = 'block';
  } else {
    detailsDiv.style.display = 'none';
  }
}

async function addItemToOrder() {
  const orderId = document.getElementById('edit_order_id').value;
  const itemId = document.getElementById('available_items').value;
  const quantity = parseInt(document.getElementById('item_quantity').value);
  
  if (!itemId || !quantity || quantity < 1) {
    alert('Please select an item and enter a valid quantity.');
    return;
  }
  
  try {
    const response = await fetch('/api/order-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: orderId,
        item_id: itemId,
        quantity: quantity
      })
    });
    
    if (!response.ok) throw new Error('Failed to add item to order');
    
    // Reload the order items
    await loadCurrentOrderItems(orderId);
    
    // Reset the form
    document.getElementById('available_items').value = '';
    document.getElementById('item_quantity').value = '1';
    document.getElementById('item_search').value = '';
    document.getElementById('item_details').style.display = 'none';
    
    // Reload available items in case quantities changed
    await loadAvailableItems();
    
  } catch (error) {
    console.error('Error adding item to order:', error);
    alert('Failed to add item to order. Please try again.');
  }
}

async function removeItemFromOrder(orderItemId) {
  if (!confirm('Are you sure you want to remove this item from the order?')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/order-items/${orderItemId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Failed to remove item from order');
    
    const orderId = document.getElementById('edit_order_id').value;
    await loadCurrentOrderItems(orderId);
    await loadAvailableItems(); // Refresh in case quantities changed
    
  } catch (error) {
    console.error('Error removing item from order:', error);
    alert('Failed to remove item from order. Please try again.');
  }
}

async function updateItemQuantity(orderItemId, newQuantity) {
  if (newQuantity < 1) {
    alert('Quantity must be at least 1.');
    return;
  }
  
  try {
    const response = await fetch(`/api/order-items/${orderItemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: newQuantity })
    });
    
    if (!response.ok) throw new Error('Failed to update item quantity');
    
    const orderId = document.getElementById('edit_order_id').value;
    await loadCurrentOrderItems(orderId);
    await loadAvailableItems(); // Refresh in case quantities changed
    
  } catch (error) {
    console.error('Error updating item quantity:', error);
    alert('Failed to update item quantity. Please try again.');
  }
}

async function updateOrder() {
  const orderId = document.getElementById('edit_order_id').value;
  const orderDate = document.getElementById('edit_order_date').value;
  
  try {
    const response = await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_date: orderDate
      })
    });
    
    if (!response.ok) throw new Error('Failed to update order');
    
    alert('Order updated successfully!');
    closeEditOrderModal();
    loadOrders(); // Refresh the orders list
    
  } catch (error) {
    console.error('Error updating order:', error);
    alert('Failed to update order. Please try again.');
  }
}

function closeEditOrderModal() {
  document.getElementById('editOrderModal').style.display = 'none';
  
  // Reset form
  document.getElementById('editOrderForm').reset();
  document.getElementById('current_order_items').innerHTML = '';
  document.getElementById('order_total').textContent = '0.00';
  document.getElementById('available_items').innerHTML = '<option value="">Select an item...</option>';
  document.getElementById('item_details').style.display = 'none';
}

async function fetchCustomers() {
  const searchInput = document.getElementById('customerSearch');
  const resultsSelect = document.getElementById('customerResults');
  
  const query = searchInput.value.trim();
  if (query.length < 2) return;

  try {
    const response = await fetch(`/api/customers/search?q=${encodeURIComponent(query)}`);
    const customers = await response.json();

    resultsSelect.innerHTML = '<option value="">Select a customer...</option>';
    customers.forEach(c => {
      const option = document.createElement('option');
      option.value = c.customer_id;
      option.textContent = `${c.first_name} ${c.last_name} - ${c.phone}`;
      resultsSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  loadOrders();
  
  // Customer search
  document.getElementById('customerSearch').addEventListener('input', debounce(fetchCustomers, 300));
  
  // Customer selection
  document.getElementById('customerResults').addEventListener('change', (e) => {
    document.getElementById('customer_id').value = e.target.value;
    loadOrders();
  });
  
  // Sort filter buttons
  document.querySelectorAll('.filter-btn[data-sort]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn[data-sort]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applySorting();
    });
  });
  
  // Select all orders checkbox
  const selectAllCheckbox = document.getElementById('selectAllOrders');
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', () => toggleSelectAll('orders'));
  }
});

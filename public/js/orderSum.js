function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

async function loadOrders() {
  const customerId = document.getElementById('customer_id').value;
  
  // Get active sort option from buttons
  const sortOption = document.querySelector('.filter-btn[data-sort].active')?.dataset.sort || 'none';
  
  try {
    const res = await fetch(`/summary/orders${customerId ? `?customer_id=${customerId}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch order summary');
    
    let orders = await res.json();
    
    // Sort orders based on selected option
    const sortedOrders = sortOrders(orders, sortOption);
    
    const tbody = document.getElementById('order-body');
    tbody.innerHTML = '';
    
    // Clear previous selections when loading new data
    if (window.SelectionManager) {
      window.SelectionManager.clearSelection();
    }

    sortedOrders.forEach(order => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input type="checkbox" data-item-id="${order.order_id}" onchange="toggleItemSelection('${order.order_id}', this)" style="transform: scale(1.2); margin: 0;"></td>
        <td>${order.order_id}</td>
        <td>${order.customer_id}</td>
        <td>${order.first_name} ${order.last_name}</td>
        <td>${order.email || 'N/A'}</td>
        <td>${order.phone}</td>
        <td>${new Date(order.order_date).toLocaleDateString()}</td>
        <td>$${order.subtotal ? parseFloat(order.subtotal).toFixed(2) : '0.00'}</td>
        <td><button onclick="toggleOrderItems(${order.order_id}, this)" class="expand-btn">Expand</button></td>
        <td><button onclick="editOrder(${order.order_id})">Modify</button></td>
      `;
      
      // Store order data on the checkbox for easy access
      const checkbox = tr.querySelector('input[type="checkbox"]');
      if (checkbox) {
        checkbox.dataset.itemData = JSON.stringify({
          order_id: order.order_id,
          first_name: order.first_name,
          last_name: order.last_name,
          phone: order.phone,
          email: order.email || '',
          order_date: order.order_date,
          subtotal: order.subtotal || 0
        });
      }
      
      tbody.appendChild(tr);
      
      // Add hidden row for order items breakdown
      const itemsRow = document.createElement('tr');
      itemsRow.id = `items-${order.order_id}`;
      itemsRow.style.display = 'none';
      itemsRow.className = 'items-breakdown';
      itemsRow.innerHTML = `
        <td colspan="9">
          <div class="loading" id="loading-${order.order_id}">Loading order items...</div>
          <div class="items-container" id="items-container-${order.order_id}" style="display: none;"></div>
        </td>
      `;
      tbody.appendChild(itemsRow);
    });
  } catch (err) {
    console.error(err);
    alert('Could not load orders. Try again later.');
  }
}

function handleFilterButtonClick(button) {
  // Get the button group (sort)
  const buttonGroup = button.parentElement;
  
  // Remove active class from all buttons in this group
  buttonGroup.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Add active class to clicked button
  button.classList.add('active');
  
  // Reload orders with new sort option
  loadOrders();
}

function sortOrders(orders, sortOption) {
  const sortedOrders = [...orders]; // Create a copy to avoid mutating original array
  
  switch (sortOption) {
    case 'customer-asc':
      return sortedOrders.sort((a, b) => {
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
    case 'customer-desc':
      return sortedOrders.sort((a, b) => {
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
        return nameB.localeCompare(nameA);
      });
    case 'date-newest':
      return sortedOrders.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
    case 'date-oldest':
      return sortedOrders.sort((a, b) => new Date(a.order_date) - new Date(b.order_date));
    case 'amount-highest':
      return sortedOrders.sort((a, b) => {
        const amountA = parseFloat(a.subtotal) || 0;
        const amountB = parseFloat(b.subtotal) || 0;
        return amountB - amountA;
      });
    case 'amount-lowest':
      return sortedOrders.sort((a, b) => {
        const amountA = parseFloat(a.subtotal) || 0;
        const amountB = parseFloat(b.subtotal) || 0;
        return amountA - amountB;
      });
    default:
      return sortedOrders; // No sorting
  }
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
      option.text = `${c.first_name} ${c.last_name} (${c.phone})`;
      resultsSelect.appendChild(option);
    });
  } catch (err) {
    resultsSelect.innerHTML = '<option value="">Error loading results</option>';
  }
}

function editOrder(id) {
  window.location.href = `/orders/edit?id=${id}`;
}

async function toggleOrderItems(orderId, button) {
  const itemsRow = document.getElementById(`items-${orderId}`);
  const loadingDiv = document.getElementById(`loading-${orderId}`);
  const itemsContainer = document.getElementById(`items-container-${orderId}`);
  
  if (itemsRow.style.display === 'none') {
    // Show the breakdown
    itemsRow.style.display = 'table-row';
    button.textContent = 'Collapse';
    
    // Check if items are already loaded
    if (itemsContainer.innerHTML === '') {
      loadingDiv.style.display = 'block';
      try {
        const response = await fetch(`/api/orders/${orderId}/items`);
        if (!response.ok) throw new Error('Failed to fetch order items');
        
        const items = await response.json();
        loadingDiv.style.display = 'none';
        
        if (items.length === 0) {
          itemsContainer.innerHTML = '<p style="padding: 10px; color: #666;">No items found for this order.</p>';
        } else {
          let itemsHtml = `
            <div style="padding: 10px;">
              <h4>Order Items Breakdown:</h4>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                  <tr style="background-color: #f8f9fa;">
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Item Name</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Color</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Model</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Price</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Quantity</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
          `;
          
          let totalAmount = 0;
          items.forEach(item => {
            const itemTotal = parseFloat(item.total_price) || 0;
            totalAmount += itemTotal;
            itemsHtml += `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.item_name}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.item_color}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.item_model}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${parseFloat(item.price).toFixed(2)}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.order_item_quantity}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${itemTotal.toFixed(2)}</td>
              </tr>
            `;
          });
          
          itemsHtml += `
                </tbody>
                <tfoot>
                  <tr style="background-color: #f8f9fa; font-weight: bold;">
                    <td colspan="5" style="border: 1px solid #ddd; padding: 8px; text-align: right;">Order Total:</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${totalAmount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          `;
          itemsContainer.innerHTML = itemsHtml;
        }
        
        itemsContainer.style.display = 'block';
      } catch (error) {
        console.error('Error fetching order items:', error);
        loadingDiv.style.display = 'none';
        itemsContainer.innerHTML = '<p style="padding: 10px; color: #dc3545;">Error loading order items. Please try again.</p>';
        itemsContainer.style.display = 'block';
      }
    } else {
      itemsContainer.style.display = 'block';
    }
  } else {
    // Hide the breakdown
    itemsRow.style.display = 'none';
    button.textContent = 'Expand';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('customerSearch').addEventListener('input', debounce(fetchCustomers, 300));
  document.getElementById('customerResults').addEventListener('change', () => {
    document.getElementById('customer_id').value = document.getElementById('customerResults').value;
    loadOrders();
  });
  
  // Add event listeners for filter buttons
  document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', () => handleFilterButtonClick(button));
  });
  
  // Initialize selection manager for orders
  if (window.SelectionManager) {
    window.SelectionManager.init('orders');
  }
  
  loadOrders();
});

async function printSelectedOrders() {
  const selectedIds = window.SelectionManager.getSelectedItems();
  
  if (selectedIds.length === 0) {
    window.SharedUtils.showNotification('Please select at least one order to print', 'warning');
    return;
  }
  
  // Get the order data for selected items
  const selectedOrders = [];
  selectedIds.forEach(orderId => {
    const checkbox = document.querySelector(`input[data-item-id="${orderId}"]`);
    if (checkbox && checkbox.dataset.itemData) {
      try {
        selectedOrders.push(JSON.parse(checkbox.dataset.itemData));
      } catch (e) {
        console.error('Error parsing order data:', e);
      }
    }
  });
  
  if (selectedOrders.length === 0) {
    window.SharedUtils.showNotification('No order data found for selected items', 'error');
    return;
  }
  
  // Print each selected order using the existing individual print function
  for (const order of selectedOrders) {
    await printIndividualOrderTicket(
      order.order_id,
      order.first_name,
      order.last_name,
      order.phone,
      order.email,
      order.order_date,
      order.subtotal
    );
    
    // Small delay between prints to prevent browser issues
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  window.SharedUtils.showNotification(`Printing ${selectedOrders.length} order ticket(s)`, 'success');
}

function printOrderTicket() {
  alert('Please select orders using the checkboxes and use the "Print Selected" button at the bottom.');
}

async function printIndividualOrderTicket(orderId, firstName, lastName, phone, email, orderDate, subtotal) {
  const customerName = `${firstName} ${lastName}`;
  const orderDateObj = new Date(orderDate);
  const orderTotal = parseFloat(subtotal) || 0;
  
  // Fetch order items for this order
  let orderItems = [];
  try {
    const response = await fetch(`/summary/order-items/${orderId}`);
    if (response.ok) {
      orderItems = await response.json();
    }
  } catch (error) {
    console.error('Error fetching order items:', error);
  }
  
  // Create customer copy (full detailed version)
  const customerCopy = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Order Ticket #${orderId} - Customer Copy</title>
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
        <div>Professional Wood Services</div>
      </div>
      
      <div class="copy-type">CUSTOMER COPY</div>
      <div class="ticket-title">ORDER RECEIPT #${orderId}</div>
      
      <div class="section">
        <div class="section-title">Customer Information</div>
        <div class="info-row"><span class="label">Name:</span> ${customerName}</div>
        <div class="info-row"><span class="label">Phone:</span> ${phone}</div>
        <div class="info-row"><span class="label">Email:</span> ${email || 'N/A'}</div>
      </div>
      
      <div class="section">
        <div class="section-title">Order Details</div>
        <div class="info-row"><span class="label">Order Date:</span> ${orderDateObj.toLocaleDateString()} ${orderDateObj.toLocaleTimeString()}</div>
        <div class="info-row"><span class="label">Order Status:</span> Completed</div>
      </div>
      
      ${orderItems.length > 0 ? `
      <div class="section">
        <div class="section-title">Items Ordered</div>
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
            ${orderItems.map(item => `
              <tr>
                <td>${item.item_name}</td>
                <td>${item.item_color} ${item.item_model}</td>
                <td>$${parseFloat(item.price).toFixed(2)}</td>
                <td>${item.quantity}</td>
                <td>$${(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}
      
      <div class="total-section">
        <div class="section-title">Order Summary</div>
        <div class="info-row" style="font-size: 16px; font-weight: bold; margin-top: 10px;">
          <span class="label">TOTAL PAID:</span> $${orderTotal.toFixed(2)}
        </div>
      </div>
      
      <div class="footer">
        <p>Thank you for choosing iWoodFix-IT!</p>
        <p>Please keep this receipt for your records.</p>
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
      <title>Order Ticket #${orderId} - Business Copy</title>
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
      <div class="ticket-title">ORDER #${orderId}</div>
      
      <div class="compact-section">
        <div class="compact-title">Customer</div>
        <div class="compact-row"><span class="compact-label">Name:</span> ${customerName}</div>
        <div class="compact-row"><span class="compact-label">Phone:</span> ${phone}</div>
      </div>
      
      <div class="compact-section">
        <div class="compact-title">Order Info</div>
        <div class="compact-row"><span class="compact-label">Date:</span> ${orderDateObj.toLocaleDateString()}</div>
        <div class="compact-row"><span class="compact-label">Items:</span> ${orderItems.length} item(s)</div>
        <div class="compact-row"><span class="compact-label">Status:</span> Completed</div>
      </div>
      
      <div class="total-compact">
        TOTAL: $${orderTotal.toFixed(2)}
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

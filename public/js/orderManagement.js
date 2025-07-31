let currentOrderId = null;

function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

async function loadOrder() {
  const orderIdInput = document.getElementById('orderIdInput');
  const orderId = parseInt(orderIdInput.value);
  
  if (isNaN(orderId) || orderId <= 0) {
    alert('Please enter a valid Order ID');
    return;
  }

  try {
    // Load order info from the summary view
    const orderResponse = await fetch(`/summary/orders`);
    const orders = await orderResponse.json();
    const order = orders.find(o => o.order_id === orderId);
    
    if (!order) {
      alert('Order not found');
      return;
    }

    // Display order info
    currentOrderId = orderId;
    document.getElementById('orderNumber').textContent = orderId;
    document.getElementById('customerName').textContent = `${order.first_name} ${order.last_name}`;
    document.getElementById('orderDate').textContent = new Date(order.order_date).toLocaleDateString();
    
    // Show sections
    document.getElementById('orderInfo').style.display = 'block';
    document.getElementById('addItemSection').style.display = 'block';
    document.getElementById('orderItemsSection').style.display = 'block';
    
    // Load order items
    await loadOrderItems();
    
  } catch (error) {
    console.error('Error loading order:', error);
    alert('Failed to load order. Please try again.');
  }
}

async function loadOrderItems() {
  if (!currentOrderId) return;
  
  try {
    const response = await fetch(`/api/orders/${currentOrderId}/items`);
    const items = await response.json();
    
    const tbody = document.getElementById('orderItemsBody');
    tbody.innerHTML = '';
    
    let total = 0;
    
    items.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.item_name}</td>
        <td>${item.item_color}</td>
        <td>${item.item_model}</td>
        <td>$${parseFloat(item.price).toFixed(2)}</td>
        <td>
          <input type="number" value="${item.order_item_quantity}" min="1" 
                 onchange="updateItemQuantity(${item.order_item_id}, this.value)"
                 style="width: 60px;" />
        </td>
        <td>$${parseFloat(item.total_price).toFixed(2)}</td>
        <td>
          <button onclick="removeItem(${item.order_item_id})" class="remove-item-btn">Remove</button>
        </td>
      `;
      tbody.appendChild(tr);
      total += parseFloat(item.total_price);
    });
    
    document.getElementById('orderTotal').textContent = total.toFixed(2);
    
  } catch (error) {
    console.error('Error loading order items:', error);
    alert('Failed to load order items.');
  }
}

async function searchItems() {
  const searchInput = document.getElementById('itemSearch');
  const resultsSelect = document.getElementById('itemResults');
  
  const query = searchInput.value.trim();
  if (query.length < 2) {
    resultsSelect.innerHTML = '<option value="">Select an item...</option>';
    return;
  }

  // Show loading state
  resultsSelect.innerHTML = '<option value="">Searching...</option>';

  try {
    const response = await fetch(`/api/items/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const items = await response.json();

    resultsSelect.innerHTML = '<option value="">Select an item...</option>';
    
    if (items.length === 0) {
      resultsSelect.innerHTML = '<option value="">No items found</option>';
      return;
    }
    
    items.forEach(item => {
      const option = document.createElement('option');
      option.value = item.item_id;
      // Convert price to number before using toFixed
      const price = parseFloat(item.price) || 0;
      option.textContent = `${item.item_name} - ${item.item_color} - ${item.item_model} ($${price.toFixed(2)})`;
      option.dataset.price = item.price;
      resultsSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error searching items:', error);
    resultsSelect.innerHTML = '<option value="">Error loading items</option>';
  }
}

async function addItemToOrder() {
  const itemSelect = document.getElementById('itemResults');
  const quantityInput = document.getElementById('itemQuantity');
  
  const itemId = parseInt(itemSelect.value);
  const quantity = parseInt(quantityInput.value);
  
  if (!itemId || !quantity || quantity <= 0) {
    alert('Please select an item and enter a valid quantity');
    return;
  }
  
  try {
    const response = await fetch('/api/order-items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_id: currentOrderId,
        item_id: itemId,
        quantity: quantity
      })
    });
    
    if (response.ok) {
      // Reset form
      document.getElementById('itemSearch').value = '';
      document.getElementById('itemResults').innerHTML = '<option value="">Select an item...</option>';
      document.getElementById('itemQuantity').value = '1';
      
      // Reload items
      await loadOrderItems();
    } else {
      alert('Failed to add item to order');
    }
    
  } catch (error) {
    console.error('Error adding item:', error);
    alert('Failed to add item to order');
  }
}

async function updateItemQuantity(orderItemId, newQuantity) {
  const quantity = parseInt(newQuantity);
  if (quantity <= 0) {
    alert('Quantity must be greater than 0');
    return;
  }
  
  try {
    const response = await fetch(`/api/order-items/${orderItemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quantity: quantity })
    });
    
    if (response.ok) {
      await loadOrderItems();
    } else {
      alert('Failed to update item quantity');
    }
    
  } catch (error) {
    console.error('Error updating item:', error);
    alert('Failed to update item quantity');
  }
}

async function removeItem(orderItemId) {
  if (!confirm('Are you sure you want to remove this item?')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/order-items/${orderItemId}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      await loadOrderItems();
    } else {
      alert('Failed to remove item');
    }
    
  } catch (error) {
    console.error('Error removing item:', error);
    alert('Failed to remove item');
  }
}

// Initialize search functionality
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('itemSearch');
  
  if (searchInput) {
    // Add input event listener with debounce
    searchInput.addEventListener('input', debounce(searchItems, 300));
    
    // Also add a manual trigger for testing
    console.log('Search input event listener attached');
  } else {
    console.error('itemSearch input not found');
  }
  
  // Check if there's an order ID in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('orderId');
  if (orderId) {
    document.getElementById('orderIdInput').value = orderId;
    loadOrder();
  }
});

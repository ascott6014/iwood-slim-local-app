function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
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
      <td><input type="checkbox" class="order-select" value="${order.order_id}"></td>
      <td>${order.order_id}</td>
      <td>${order.first_name} ${order.last_name}</td>
      <td>${new Date(order.order_date).toLocaleDateString()}</td>
      <td>
        <button class="expand-btn" onclick="expandRow(${order.order_id})" title="View order items">
          ${order.item_count || 0} items
        </button>
      </td>
      <td>$${order.subtotal ? parseFloat(order.subtotal).toFixed(2) : '0.00'}</td>
      <td>
        <button onclick="editOrder(${order.order_id})" class="summary-table button">Edit</button>
        <button onclick="printOrder(${order.order_id})" class="summary-table button">Print</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function printOrder(orderId) {
  // Implementation for printing individual order
  window.open(`/orders/print/${orderId}`, '_blank');
}

function editOrder(orderId) {
  // Implementation for editing order
  window.location.href = `/manage-order.html?id=${orderId}`;
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
});

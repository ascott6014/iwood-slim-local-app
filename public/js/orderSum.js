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
    
    const orders = await res.json();
    const tbody = document.getElementById('order-body');
    tbody.innerHTML = '';

    orders.forEach(order => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${order.order_id}</td>
        <td>${order.first_name} ${order.last_name}</td>
        <td>${new Date(order.order_date).toLocaleDateString()}</td>
        <td>$${order.order_items_total ? parseFloat(order.order_items_total).toFixed(2) : '0.00'}</td>
        <td>$${order.tax_amount ? parseFloat(order.tax_amount).toFixed(2) : '0.00'}</td>
        <td>$${order.final_price ? parseFloat(order.final_price).toFixed(2) : '0.00'}</td>
        <td><button onclick="editOrder(${order.order_id})">Modify</button></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    alert('Could not load orders. Try again later.');
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

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('customerSearch').addEventListener('input', debounce(fetchCustomers, 300));
  document.getElementById('customerResults').addEventListener('change', () => {
    document.getElementById('customer_id').value = document.getElementById('customerResults').value;
    loadOrders();
  });
  loadOrders();
});

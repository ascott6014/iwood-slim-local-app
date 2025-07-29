function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

async function loadInstalls() {
  const customerId = document.getElementById('customer_id').value;
  try {
    const res = await fetch(`/summary/installs${customerId ? `?customer_id=${customerId}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch install summary');
    
    const installs = await res.json();
    const tbody = document.getElementById('install-body');
    tbody.innerHTML = '';

    installs.forEach(inst => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${inst.install_id}</td>
        <td>${inst.first_name} ${inst.last_name}</td>
        <td>$${inst.estimate ? parseFloat(inst.estimate).toFixed(2) : '0.00'}</td>
        <td>$${inst.install_items_total ? parseFloat(inst.install_items_total).toFixed(2) : '0.00'}</td>
        <td>$${inst.tax_amount ? parseFloat(inst.tax_amount).toFixed(2) : '0.00'}</td>
        <td>$${inst.final_price ? parseFloat(inst.final_price).toFixed(2) : '0.00'}</td>
        <td><button onclick="editInstall(${inst.install_id})">Modify</button></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    alert('Could not load installs. Try again later.');
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

async function fetchCustomers() {
  const searchInput = document.getElementById('customerSearch');
  const resultsSelect = document.getElementById('customerResults');
  
  const query = searchInput.value.trim();
  if (query.length < 2) return;

  try {
    const response = await fetch(`/api/customers/search?q=${encodeURIComponent(query)}`);
    const customers = await response.json();

    resultsSelect.innerHTML = '<option value="">All Customers</option>';
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

function editInstall(id) {
  window.location.href = `/installs/edit?id=${id}`;
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('customerSearch').addEventListener('input', debounce(fetchCustomers, 300));
  document.getElementById('customerResults').addEventListener('change', () => {
    document.getElementById('customer_id').value = document.getElementById('customerResults').value;
    loadInstalls();
  });
  loadInstalls();
});

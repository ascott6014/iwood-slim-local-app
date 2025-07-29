function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

async function loadRepairs() {
  const customerId = document.getElementById('customer_id')?.value;
  try {
    const res = await fetch(`/summary/repairs${customerId ? `?customer_id=${customerId}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch repair summary');

    const repairs = await res.json();
    const tbody = document.getElementById('repair-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    repairs.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.customer_id}</td>
        <td>${r.first_name} ${r.last_name}</td>
        <td>${r.address}, ${r.city}, ${r.state} ${r.zip}</td>
        <td>${r.phone}</td>
        <td>${r.email}</td>
        <td>${r.repair_id}</td>
        <td>${r.items_brought}</td>
        <td>${r.problem}</td>
        <td>${r.solution || 'N/A'}</td>
        <td>$${r.estimate ? parseFloat(r.estimate).toFixed(2) : '0.00'}</td>
        <td>${r.status}</td>
        <td>${r.notes || 'N/A'}</td>
        <td>${new Date(r.drop_off_date).toLocaleDateString()}</td>
        <td>${r.pickup_date ? new Date(r.pickup_date).toLocaleDateString() : 'N/A'}</td>
        <td><button onclick="editRepair(${r.repair_id})">Modify</button></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    alert('Could not load repairs. Try again later.');
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

function editRepair(id) {
  window.location.href = `/repairs/edit?id=${id}`;
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('customerSearch').addEventListener('input', debounce(fetchCustomers, 300));
  document.getElementById('customerResults').addEventListener('change', () => {
    document.getElementById('customer_id').value = document.getElementById('customerResults').value;
    loadRepairs();
  });
  loadRepairs();
});

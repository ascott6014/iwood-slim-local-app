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
    
    allInstalls = await res.json();
    applyFiltering();
  } catch (err) {
    console.error(err);
    alert('Could not load installs. Try again later.');
  }
}

function renderInstalls() {
  const tbody = document.getElementById('install-body');
  tbody.innerHTML = '';

  filteredInstalls.forEach(install => {
    const tr = document.createElement('tr');
    tr.setAttribute('data-install-id', install.install_id);
    tr.innerHTML = `
      <td><input type="checkbox" class="install-select" value="${install.install_id}"></td>
      <td>${install.install_id}</td>
      <td>${install.first_name} ${install.last_name}</td>
      <td>${new Date(install.install_date).toLocaleDateString()}</td>
      <td>
        <button class="expand-btn" onclick="expandRow(${install.install_id})" title="View install items">
          ${install.item_count || 0} items
        </button>
      </td>
      <td>$${install.estimate ? parseFloat(install.estimate).toFixed(2) : '0.00'}</td>
      <td>$${install.subtotal ? parseFloat(install.subtotal).toFixed(2) : '0.00'}</td>
      <td>
        <span class="status-badge status-scheduled">
          Scheduled
        </span>
      </td>
      <td>
        <button onclick="editInstall(${install.install_id})" class="summary-table button">Edit</button>
        <button onclick="printInstall(${install.install_id})" class="summary-table button">Print</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function printInstall(installId) {
  // Implementation for printing individual install
  window.open(`/installs/print/${installId}`, '_blank');
}

function editInstall(installId) {
  // Implementation for editing install
  window.location.href = `/manage-install.html?id=${installId}`;
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
  loadInstalls();
  
  // Customer search
  document.getElementById('customerSearch').addEventListener('input', debounce(fetchCustomers, 300));
  
  // Customer selection
  document.getElementById('customerResults').addEventListener('change', (e) => {
    document.getElementById('customer_id').value = e.target.value;
    loadInstalls();
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

function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Global variables
let allInstalls = [];
let filteredInstalls = [];

// Select/Print functionality
function selectAll() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"].install-select');
  checkboxes.forEach(cb => cb.checked = true);
  updatePrintButton();
}

function selectNone() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"].install-select');
  checkboxes.forEach(cb => cb.checked = false);
  updatePrintButton();
}

function updatePrintButton() {
  const selectedCheckboxes = document.querySelectorAll('input[type="checkbox"].install-select:checked');
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
  const selectAllCheckbox = document.getElementById('selectAllInstalls');
  const installCheckboxes = document.querySelectorAll('input[type="checkbox"].install-select');
  
  installCheckboxes.forEach(cb => {
    cb.checked = selectAllCheckbox.checked;
  });
  
  updatePrintButton();
}

function printSelectedInstalls() {
  const selectedInstalls = [];
  const checkboxes = document.querySelectorAll('input[type="checkbox"].install-select:checked');
  
  checkboxes.forEach(cb => {
    const installId = cb.value;
    const install = allInstalls.find(i => i.install_id == installId);
    if (install) selectedInstalls.push(install);
  });
  
  if (selectedInstalls.length === 0) {
    alert('Please select at least one install to print.');
    return;
  }
  
  printInstallListWithItems(selectedInstalls);
}

async function printInstallListWithItems(installs) {
  // Fetch items for each install
  const installsWithItems = await Promise.all(
    installs.map(async (install) => {
      try {
        const response = await fetch(`/installs/${install.install_id}/items`);
        const items = await response.json();
        return { ...install, items };
      } catch (error) {
        console.error(`Error loading items for install ${install.install_id}:`, error);
        return { ...install, items: [] };
      }
    })
  );

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Install Report - ${new Date().toLocaleDateString()}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .install-section { margin-bottom: 40px; page-break-inside: avoid; }
        .install-header { 
          background-color: #e9ecef; 
          padding: 10px; 
          margin-bottom: 15px; 
          border: 2px solid #ddd;
          font-weight: bold;
          font-size: 16px;
        }
        .install-info { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 10px; 
          margin-bottom: 15px; 
          padding: 10px;
          border: 1px solid #ddd;
        }
        .install-info div { margin: 5px 0; }
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
          .install-section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>iWoodFix-IT Detailed Install Report</h1>
        <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
        <p>Total Installs: ${installsWithItems.length}</p>
      </div>
      
      ${installsWithItems.map(install => `
        <div class="install-section">
          <div class="install-header">
            Install #${install.install_id} - ${install.first_name} ${install.last_name}
          </div>
          
          <div class="install-info">
            <div><strong>Customer ID:</strong> ${install.customer_id || 'N/A'}</div>
            <div><strong>Phone:</strong> ${install.phone || 'N/A'}</div>
            <div><strong>Install Date:</strong> ${new Date(install.install_date).toLocaleDateString()}</div>
            <div><strong>Description:</strong> ${install.description || 'N/A'}</div>
            <div><strong>Estimate:</strong> $${install.estimate ? parseFloat(install.estimate).toFixed(2) : '0.00'}</div>
            <div><strong>Subtotal:</strong> $${install.subtotal ? parseFloat(install.subtotal).toFixed(2) : '0.00'}</div>
            <div style="grid-column: 1 / -1;"><strong>Notes:</strong> ${install.notes || 'N/A'}</div>
          </div>
          
          ${install.items && install.items.length > 0 ? `
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
                ${install.items.map(item => `
                  <tr>
                    <td>${item.item_name}</td>
                    <td>${item.item_color} ${item.item_model}</td>
                    <td>$${parseFloat(item.price).toFixed(2)}</td>
                    <td>${item.install_item_quantity}</td>
                    <td>$${parseFloat(item.total_price).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr class="items-total">
                  <td colspan="4"><strong>Items Total:</strong></td>
                  <td><strong>$${install.items.reduce((sum, item) => sum + parseFloat(item.total_price), 0).toFixed(2)}</strong></td>
                </tr>
              </tfoot>
            </table>
          ` : '<div class="no-items">No items found for this install</div>'}
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

function printInstallList(installs) {
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Install Report - ${new Date().toLocaleDateString()}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .install-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .install-table th, .install-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .install-table th { background-color: #f5f5f5; font-weight: bold; }
        .install-header { background-color: #e9ecef; font-weight: bold; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>iWoodFix-IT Install Report</h1>
        <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
        <p>Total Installs: ${installs.length}</p>
      </div>
      
      <table class="install-table">
        <thead>
          <tr>
            <th>Install ID</th>
            <th>Customer</th>
            <th>Phone</th>
            <th>Description</th>
            <th>Date</th>
            <th>Estimate</th>
            <th>Item Total</th>
            <th>Subtotal</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          ${installs.map(install => `
            <tr>
              <td>${install.install_id}</td>
              <td>${install.first_name} ${install.last_name}</td>
              <td>${install.phone || 'N/A'}</td>
              <td>${install.description || 'N/A'}</td>
              <td>${new Date(install.install_date).toLocaleDateString()}</td>
              <td>$${install.estimate ? parseFloat(install.estimate).toFixed(2) : '0.00'}</td>
              <td>$${install.install_items_total ? parseFloat(install.install_items_total).toFixed(2) : '0.00'}</td>
              <td>$${install.subtotal ? parseFloat(install.subtotal).toFixed(2) : '0.00'}</td>
              <td>${install.notes || 'N/A'}</td>
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
    filteredInstalls = [...allInstalls];
  } else {
    const sortType = activeSort.getAttribute('data-sort');
    filteredInstalls = [...allInstalls].sort((a, b) => {
      switch (sortType) {
        case 'customer-asc':
          return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
        case 'customer-desc':
          return `${b.first_name} ${b.last_name}`.localeCompare(`${a.first_name} ${a.last_name}`);
        case 'date-newest':
          return new Date(b.install_date) - new Date(a.install_date);
        case 'date-oldest':
          return new Date(a.install_date) - new Date(b.install_date);
        default:
          return 0;
      }
    });
  }
  renderInstalls();
}

// Item expansion functionality
async function expandRow(installId) {
  const existingRow = document.getElementById(`items-${installId}`);
  if (existingRow) {
    existingRow.remove();
    return;
  }

  try {
    const response = await fetch(`/installs/${installId}/items`);
    const items = await response.json();
    
    const installRow = document.querySelector(`tr[data-install-id="${installId}"]`);
    const itemsRow = document.createElement('tr');
    itemsRow.id = `items-${installId}`;
    itemsRow.className = 'items-breakdown';
    
    const itemsHtml = items.length > 0 ? `
      <div class="items-container" style="padding: 15px;">
        <h4>Install Items:</h4>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="border: 1px solid #dee2e6; padding: 6px;">Item</th>
              <th style="border: 1px solid #dee2e6; padding: 6px;">Color/Model</th>
              <th style="border: 1px solid #dee2e6; padding: 6px;">Price</th>
              <th style="border: 1px solid #dee2e6; padding: 6px;">Qty</th>
              <th style="border: 1px solid #dee2e6; padding: 6px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td style="border: 1px solid #dee2e6; padding: 6px;">${item.item_name}</td>
                <td style="border: 1px solid #dee2e6; padding: 6px;">${item.item_color} ${item.item_model}</td>
                <td style="border: 1px solid #dee2e6; padding: 6px;">$${parseFloat(item.price).toFixed(2)}</td>
                <td style="border: 1px solid #dee2e6; padding: 6px;">${item.install_item_quantity}</td>
                <td style="border: 1px solid #dee2e6; padding: 6px;">$${parseFloat(item.total_price).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="background-color: #f8f9fa; font-weight: bold;">
              <td colspan="4" style="border: 1px solid #dee2e6; padding: 6px;">Total:</td>
              <td style="border: 1px solid #dee2e6; padding: 6px;">$${items.reduce((sum, item) => sum + parseFloat(item.total_price), 0).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    ` : '<div style="padding: 15px; text-align: center; color: #666;">No items found for this install</div>';
    
    itemsRow.innerHTML = `<td colspan="13" style="padding: 0; background-color: #f8f9fa; border: none;">${itemsHtml}</td>`;
    installRow.insertAdjacentElement('afterend', itemsRow);
    
  } catch (error) {
    console.error('Error loading install items:', error);
    alert('Failed to load install items');
  }
}

async function loadInstalls() {
  const customerId = document.getElementById('customer_id').value;
  try {
    const res = await fetch(`/summary/installs${customerId ? `?customer_id=${customerId}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch install summary');
    
    allInstalls = await res.json();
    applySorting();
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
      <td><input type="checkbox" class="install-select" value="${install.install_id}" onchange="updatePrintButton()"></td>
      <td>${install.install_id}</td>
      <td>${install.customer_id || 'N/A'}</td>
      <td>${install.first_name} ${install.last_name}</td>
      <td>${install.phone || 'N/A'}</td>
      <td>${install.description || 'N/A'}</td>
      <td>${new Date(install.install_date).toLocaleDateString()}</td>
      <td>$${install.estimate ? parseFloat(install.estimate).toFixed(2) : '0.00'}</td>
      <td>$${install.install_items_total ? parseFloat(install.install_items_total).toFixed(2) : '0.00'}</td>
      <td>$${install.subtotal ? parseFloat(install.subtotal).toFixed(2) : '0.00'}</td>
      <td>${install.notes || 'N/A'}</td>
      <td>
        <button class="expand-btn" onclick="expandRow(${install.install_id})" title="View install items">
          Expand
        </button>
      </td>
      <td>
        <button onclick="editInstall(${install.install_id})" class="summary-table button">Edit</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  
  // Update print button state after rendering
  updatePrintButton();
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
  
  // Select all installs checkbox
  const selectAllCheckbox = document.getElementById('selectAllInstalls');
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', () => toggleSelectAll('installs'));
  }
});

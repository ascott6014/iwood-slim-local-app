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
    
    // Clear previous selections when loading new data
    if (window.SelectionManager) {
      window.SelectionManager.clearSelection();
    }

    installs.forEach(inst => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input type="checkbox" data-item-id="${inst.install_id}" onchange="toggleItemSelection('${inst.install_id}', this)" style="transform: scale(1.2); margin: 0;"></td>
        <td>${inst.install_id}</td>
        <td>${inst.customer_id}</td>
        <td>${inst.first_name} ${inst.last_name}</td>
        <td>${inst.phone}</td>
        <td>${inst.install_description || 'N/A'}</td>
        <td>${new Date(inst.install_date).toLocaleDateString()}</td>
        <td>$${inst.estimate ? parseFloat(inst.estimate).toFixed(2) : '0.00'}</td>
        <td>$${inst.install_items_total ? parseFloat(inst.install_items_total).toFixed(2) : '0.00'}</td>
        <td>$${inst.subtotal ? parseFloat(inst.subtotal).toFixed(2) : '0.00'}</td>
        <td>${inst.notes || 'N/A'}</td>
        <td><button onclick="editInstall(${inst.install_id})">Modify</button></td>
      `;
      
      // Store install data on the checkbox for easy access
      const checkbox = tr.querySelector('input[type="checkbox"]');
      if (checkbox) {
        checkbox.dataset.itemData = JSON.stringify({
          install_id: inst.install_id,
          first_name: inst.first_name,
          last_name: inst.last_name,
          phone: inst.phone,
          install_description: inst.install_description || '',
          install_date: inst.install_date,
          estimate: inst.estimate || 0,
          notes: inst.notes || '',
          install_items_total: inst.install_items_total || 0
        });
      }
      
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
  
  // Initialize selection manager for installs
  if (window.SelectionManager) {
    window.SelectionManager.init('installs');
  }
  
  loadInstalls();
});

function printSelectedInstalls() {
  const selectedIds = window.SelectionManager.getSelectedItems();
  
  if (selectedIds.length === 0) {
    window.SharedUtils.showNotification('Please select at least one install to print', 'warning');
    return;
  }
  
  // Get the install data for selected items
  const selectedInstalls = [];
  selectedIds.forEach(installId => {
    const checkbox = document.querySelector(`input[data-item-id="${installId}"]`);
    if (checkbox && checkbox.dataset.itemData) {
      try {
        selectedInstalls.push(JSON.parse(checkbox.dataset.itemData));
      } catch (e) {
        console.error('Error parsing install data:', e);
      }
    }
  });
  
  if (selectedInstalls.length === 0) {
    window.SharedUtils.showNotification('No install data found for selected items', 'error');
    return;
  }
  
  // Print each selected install using the existing individual print function
  selectedInstalls.forEach((install, index) => {
    // Small delay between prints to prevent browser issues
    setTimeout(() => {
      printIndividualInstallTicket(
        install.install_id,
        install.first_name,
        install.last_name,
        install.phone,
        install.install_description,
        install.install_date,
        install.estimate,
        install.notes,
        install.install_items_total
      );
    }, index * 100);
  });
  
  window.SharedUtils.showNotification(`Printing ${selectedInstalls.length} install ticket(s)`, 'success');
}

function printInstallTicket() {
  alert('Please select installs using the checkboxes and use the "Print Selected" button at the bottom.');
}

function printIndividualInstallTicket(installId, firstName, lastName, phone, installDescription, installDate, estimate, notes, installItemsTotal) {
  const customerName = `${firstName} ${lastName}`;
  const installDateObj = new Date(installDate);
  const estimateAmount = parseFloat(estimate) || 0;
  const itemsTotal = parseFloat(installItemsTotal) || 0;
  
  // Create customer copy (full detailed version)
  const customerCopy = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Install Ticket #${installId} - Customer Copy</title>
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
        <div>Professional Installation Services</div>
      </div>
      
      <div class="copy-type">CUSTOMER COPY</div>
      <div class="ticket-title">INSTALLATION TICKET #${installId}</div>
      
      <div class="section">
        <div class="section-title">Customer Information</div>
        <div class="info-row"><span class="label">Name:</span> ${customerName}</div>
        <div class="info-row"><span class="label">Phone:</span> ${phone}</div>
      </div>
      
      <div class="section">
        <div class="section-title">Installation Details</div>
        <div class="info-row"><span class="label">Description:</span> ${installDescription || 'N/A'}</div>
        <div class="info-row"><span class="label">Install Date:</span> ${installDateObj.toLocaleDateString()} ${installDateObj.toLocaleTimeString()}</div>
        ${notes ? `<div class="info-row"><span class="label">Notes:</span> ${notes}</div>` : ''}
      </div>
      
      <div class="total-section">
        <div class="section-title">Cost Summary</div>
        <div class="info-row"><span class="label">Installation Cost:</span> $${estimateAmount.toFixed(2)}</div>
        ${itemsTotal > 0 ? `<div class="info-row"><span class="label">Materials/Items:</span> $${itemsTotal.toFixed(2)}</div>` : ''}
        <div class="info-row" style="font-size: 16px; font-weight: bold; margin-top: 10px;">
          <span class="label">TOTAL:</span> $${(estimateAmount + itemsTotal).toFixed(2)}
        </div>
      </div>
      
      <div class="footer">
        <p>Thank you for choosing iWoodFix-IT!</p>
        <p>Installation completed successfully.</p>
        <p>Please keep this ticket for your records.</p>
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
      <title>Install Ticket #${installId} - Business Copy</title>
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
      <div class="ticket-title">INSTALL #${installId}</div>
      
      <div class="compact-section">
        <div class="compact-title">Customer</div>
        <div class="compact-row"><span class="compact-label">Name:</span> ${customerName}</div>
        <div class="compact-row"><span class="compact-label">Phone:</span> ${phone}</div>
      </div>
      
      <div class="compact-section">
        <div class="compact-title">Installation</div>
        <div class="compact-row"><span class="compact-label">Work:</span> ${installDescription ? (installDescription.length > 50 ? installDescription.substring(0, 50) + '...' : installDescription) : 'N/A'}</div>
        <div class="compact-row"><span class="compact-label">Date:</span> ${installDateObj.toLocaleDateString()}</div>
        <div class="compact-row"><span class="compact-label">Status:</span> Completed</div>
      </div>
      
      <div class="total-compact">
        TOTAL: $${(estimateAmount + itemsTotal).toFixed(2)}
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

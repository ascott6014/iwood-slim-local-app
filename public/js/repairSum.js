function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

async function loadRepairs() {
  const customerId = document.getElementById('customer_id')?.value;
  
  // Get active filter values from buttons
  const pickupFilter = document.querySelector('.filter-btn[data-pickup].active')?.dataset.pickup || 'all';
  const statusFilter = document.querySelector('.filter-btn[data-status].active')?.dataset.status || 'all';
  const sortOption = document.querySelector('.filter-btn[data-sort].active')?.dataset.sort || 'none';
  
  try {
    const res = await fetch(`/summary/repairs${customerId ? `?customer_id=${customerId}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch repair summary');

    let repairs = await res.json();
    const tbody = document.getElementById('repair-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    // Clear previous selections when loading new data
    if (window.SelectionManager) {
      window.SelectionManager.clearSelection();
    }

    // Filter repairs based on pickup status
    let filteredRepairs = repairs.filter(r => {
      if (pickupFilter === 'pending') return !r.pickup_date;
      if (pickupFilter === 'completed') return r.pickup_date;
      return true; // 'all'
    });

    // Filter repairs based on status
    if (statusFilter !== 'all') {
      filteredRepairs = filteredRepairs.filter(r => r.status === statusFilter);
    }

    // Sort repairs based on selected option
    const sortedRepairs = sortRepairs(filteredRepairs, sortOption);

    sortedRepairs.forEach(r => {
      const tr = document.createElement('tr');
      const hasPickupDate = r.pickup_date;
      const actionButton = hasPickupDate 
        ? '<span class="status-picked-up">Picked Up</span>'
        : `<button class="pickup-btn" onclick="markAsPickedUp(${r.repair_id})">Picked Up</button>`;
      
      tr.innerHTML = `
        <td><input type="checkbox" data-item-id="${r.repair_id}" onchange="toggleItemSelection('${r.repair_id}', this)" class="selection-checkbox"></td>
        <td>${r.repair_id}</td>
        <td>${r.customer_id}</td>
        <td>${r.first_name} ${r.last_name}</td>
        <td>${r.phone}</td>
        <td>${r.email}</td>
        <td>${r.items_brought}</td>
        <td>${r.problem}</td>
        <td>${r.solution || 'N/A'}</td>
        <td><span class="status-badge status-${r.status.toLowerCase().replace(/\s+/g, '-')}">${r.status}</span></td>
        <td>$${r.estimate ? parseFloat(r.estimate).toFixed(2) : '0.00'}</td>
        <td>$${r.repair_items_total ? parseFloat(r.repair_items_total).toFixed(2) : '0.00'}</td>
        <td>$${r.subtotal ? parseFloat(r.subtotal).toFixed(2) : '0.00'}</td>
        <td>${new Date(r.drop_off_date).toLocaleDateString()}</td>
        <td>${hasPickupDate ? new Date(r.pickup_date).toLocaleDateString() : 'N/A'}</td>
        <td>${r.notes || 'N/A'}</td>
        <td><button onclick="toggleRepairItems(${r.repair_id}, this)" class="expand-btn">Expand</button></td>
        <td>
          <button onclick="editRepair(${r.repair_id})">Change Status</button>
          ${actionButton}
        </td>
      `;
      
      // Store repair data on the checkbox for easy access
      const checkbox = tr.querySelector('input[type="checkbox"]');
      if (checkbox) {
        checkbox.dataset.itemData = JSON.stringify({
          repair_id: r.repair_id,
          customer_id: r.customer_id,
          first_name: r.first_name,
          last_name: r.last_name,
          phone: r.phone,
          email: r.email || '',
          items_brought: r.items_brought,
          problem: r.problem,
          solution: r.solution || '',
          estimate: r.estimate || 0,
          status: r.status,
          drop_off_date: r.drop_off_date,
          notes: r.notes || '',
          repair_items_total: r.repair_items_total || 0
        });
      }
      
      tbody.appendChild(tr);
      
      // Add hidden row for repair items breakdown
      const itemsRow = document.createElement('tr');
      itemsRow.id = `items-${r.repair_id}`;
      itemsRow.style.display = 'none';
      itemsRow.className = 'items-breakdown';
      itemsRow.innerHTML = `
        <td colspan="18">
          <div class="loading" id="loading-${r.repair_id}">Loading repair items...</div>
          <div class="items-container item-container-hidden" id="items-container-${r.repair_id}"></div>
        </td>
      `;
      tbody.appendChild(itemsRow);
    });
  } catch (err) {
    console.error(err);
    alert('Could not load repairs. Try again later.');
  }
}

function handleFilterButtonClick(button) {
  // Get the button group (pickup, status, or sort)
  const buttonGroup = button.parentElement;
  
  // Remove active class from all buttons in this group
  buttonGroup.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Add active class to clicked button
  button.classList.add('active');
  
  // Reload repairs with new filters
  loadRepairs();
}

function sortRepairs(repairs, sortOption) {
  const sortedRepairs = [...repairs]; // Create a copy to avoid mutating original array
  
  switch (sortOption) {
    case 'customer-asc':
      return sortedRepairs.sort((a, b) => {
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
    case 'customer-desc':
      return sortedRepairs.sort((a, b) => {
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
        return nameB.localeCompare(nameA);
      });
    case 'date-newest':
      return sortedRepairs.sort((a, b) => new Date(b.drop_off_date) - new Date(a.drop_off_date));
    case 'date-oldest':
      return sortedRepairs.sort((a, b) => new Date(a.drop_off_date) - new Date(b.drop_off_date));
    default:
      return sortedRepairs; // No sorting
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
  showStatusChangeModal(id);
}

function showStatusChangeModal(repairId) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Update Repair Status</h3>
        <span class="close" onclick="closeModal()">&times;</span>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="newStatus">Select New Status:</label>
          <select id="newStatus" class="form-control">
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div class="form-group">
          <label for="statusNotes">Notes (Optional):</label>
          <textarea id="statusNotes" class="form-control" rows="3" placeholder="Add any notes about this status change..."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="updateRepairStatus(${repairId})">Update Status</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  modal.style.display = 'flex';
}

function closeModal() {
  const modal = document.querySelector('.modal');
  if (modal) {
    document.body.removeChild(modal);
  }
}

async function updateRepairStatus(repairId) {
  const newStatus = document.getElementById('newStatus').value;
  const notes = document.getElementById('statusNotes').value;
  
  if (!newStatus) {
    alert('Please select a status');
    return;
  }
  
  try {
    const response = await fetch(`/repairs/${repairId}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: newStatus,
        notes: notes
      })
    });
    
    if (!response.ok) throw new Error('Failed to update status');
    
    closeModal();
    loadRepairs();
    alert('Repair status updated successfully!');
  } catch (err) {
    console.error(err);
    alert('Error updating repair status. Please try again.');
  }
}

async function markAsPickedUp(repairId) {
  if (!confirm('Mark this repair as picked up?')) return;
  
  try {
    const response = await fetch(`/repairs/${repairId}/pickup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error('Failed to mark as picked up');
    
    // Reload the repairs to reflect the change
    loadRepairs();
    alert('Repair marked as picked up successfully!');
  } catch (err) {
    console.error(err);
    alert('Error marking repair as picked up. Please try again.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('customerSearch').addEventListener('input', debounce(fetchCustomers, 300));
  document.getElementById('customerResults').addEventListener('change', () => {
    document.getElementById('customer_id').value = document.getElementById('customerResults').value;
    loadRepairs();
  });
  
  // Add event listeners for filter buttons
  document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', () => handleFilterButtonClick(button));
  });
  
  // Initialize selection manager for repairs
  if (window.SelectionManager) {
    window.SelectionManager.init('repairs');
  }
  
  loadRepairs();
});

function printSelectedRepairs() {
  const selectedIds = window.SelectionManager.getSelectedItems();
  
  if (selectedIds.length === 0) {
    window.SharedUtils.showNotification('Please select at least one repair to print', 'warning');
    return;
  }
  
  // Get the repair data for selected items
  const selectedRepairs = [];
  selectedIds.forEach(repairId => {
    const checkbox = document.querySelector(`input[data-item-id="${repairId}"]`);
    if (checkbox && checkbox.dataset.itemData) {
      try {
        selectedRepairs.push(JSON.parse(checkbox.dataset.itemData));
      } catch (e) {
        console.error('Error parsing repair data:', e);
      }
    }
  });
  
  if (selectedRepairs.length === 0) {
    window.SharedUtils.showNotification('No repair data found for selected items', 'error');
    return;
  }
  
  printRepairListWithItems(selectedRepairs);
}

async function printRepairListWithItems(repairs) {
  // Fetch items for each repair
  const repairsWithItems = await Promise.all(
    repairs.map(async (repair) => {
      try {
        const response = await fetch(`/api/repairs/${repair.repair_id}/items`);
        const items = await response.json();
        return { ...repair, items };
      } catch (error) {
        console.error(`Error loading items for repair ${repair.repair_id}:`, error);
        return { ...repair, items: [] };
      }
    })
  );

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Repair Report - ${new Date().toLocaleDateString()}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .repair-section { margin-bottom: 40px; page-break-inside: avoid; }
        .repair-header { 
          background-color: #e9ecef; 
          padding: 10px; 
          margin-bottom: 15px; 
          border: 2px solid #ddd;
          font-weight: bold;
          font-size: 16px;
        }
        .repair-info { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 10px; 
          margin-bottom: 15px; 
          padding: 10px;
          border: 1px solid #ddd;
        }
        .repair-info div { margin: 5px 0; }
        .status-badge { 
          padding: 3px 8px; 
          border-radius: 4px; 
          font-size: 12px; 
          font-weight: bold; 
        }
        .status-pending { background-color: #fff3cd; color: #856404; }
        .status-in-progress { background-color: #d1ecf1; color: #0c5460; }
        .status-completed { background-color: #d4edda; color: #155724; }
        .status-cancelled { background-color: #f8d7da; color: #721c24; }
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
          .repair-section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>iWoodFix-IT Detailed Repair Report</h1>
        <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
        <p>Total Repairs: ${repairsWithItems.length}</p>
      </div>
      
      ${repairsWithItems.map(repair => `
        <div class="repair-section">
          <div class="repair-header">
            Repair #${repair.repair_id} - ${repair.first_name} ${repair.last_name}
          </div>
          
          <div class="repair-info">
            <div><strong>Customer ID:</strong> ${repair.customer_id || 'N/A'}</div>
            <div><strong>Phone:</strong> ${repair.phone || 'N/A'}</div>
            <div><strong>Email:</strong> ${repair.email || 'N/A'}</div>
            <div><strong>Drop-off Date:</strong> ${new Date(repair.drop_off_date).toLocaleDateString()}</div>
            <div><strong>Items Brought:</strong> ${repair.items_brought || 'N/A'}</div>
            <div><strong>Problem:</strong> ${repair.problem || 'N/A'}</div>
            <div><strong>Solution:</strong> ${repair.solution || 'N/A'}</div>
            <div><strong>Status:</strong> <span class="status-badge status-${repair.status.toLowerCase().replace(/\s+/g, '-')}">${repair.status}</span></div>
            <div><strong>Estimate:</strong> $${repair.estimate ? parseFloat(repair.estimate).toFixed(2) : '0.00'}</div>
            <div><strong>Item Total:</strong> $${repair.repair_items_total ? parseFloat(repair.repair_items_total).toFixed(2) : '0.00'}</div>
            <div class="grid-column-span"><strong>Notes:</strong> ${repair.notes || 'N/A'}</div>
          </div>
          
          ${repair.items && repair.items.length > 0 ? `
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
                ${repair.items.map(item => `
                  <tr>
                    <td>${item.item_name}</td>
                    <td>${item.item_color} ${item.item_model}</td>
                    <td>$${parseFloat(item.price).toFixed(2)}</td>
                    <td>${item.repair_item_quantity}</td>
                    <td>$${parseFloat(item.total_price).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr class="items-total">
                  <td colspan="4"><strong>Items Total:</strong></td>
                  <td><strong>$${repair.items.reduce((sum, item) => sum + parseFloat(item.total_price), 0).toFixed(2)}</strong></td>
                </tr>
              </tfoot>
            </table>
          ` : '<div class="no-items">No items found for this repair</div>'}
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

function printRepairTicket() {
  alert('Please select repairs using the checkboxes and use the "Print Selected" button at the bottom.');
}

function printIndividualRepairTicket(repairId, firstName, lastName, phone, email, itemsBrought, problem, solution, estimate, status, dropOffDate, notes, repairItemsTotal) {
  const customerName = `${firstName} ${lastName}`;
  const dropOffDateObj = new Date(dropOffDate);
  const estimateAmount = parseFloat(estimate) || 0;
  const itemsTotal = parseFloat(repairItemsTotal) || 0;
  
  // Create customer copy (full detailed version)
  const customerCopy = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Repair Ticket #${repairId} - Customer Copy</title>
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
        <div>Professional Repair Services</div>
      </div>
      
      <div class="copy-type">CUSTOMER COPY</div>
      <div class="ticket-title">REPAIR TICKET #${repairId}</div>
      
      <div class="section">
        <div class="section-title">Customer Information</div>
        <div class="info-row"><span class="label">Name:</span> ${customerName}</div>
        <div class="info-row"><span class="label">Phone:</span> ${phone}</div>
        <div class="info-row"><span class="label">Email:</span> ${email || 'N/A'}</div>
      </div>
      
      <div class="section">
        <div class="section-title">Repair Details</div>
        <div class="info-row"><span class="label">Items Brought:</span> ${itemsBrought}</div>
        <div class="info-row"><span class="label">Problem:</span> ${problem}</div>
        <div class="info-row"><span class="label">Solution:</span> ${solution || 'N/A'}</div>
        <div class="info-row"><span class="label">Status:</span> ${status}</div>
        <div class="info-row"><span class="label">Drop-off Date:</span> ${dropOffDateObj.toLocaleDateString()} ${dropOffDateObj.toLocaleTimeString()}</div>
        ${notes ? `<div class="info-row"><span class="label">Notes:</span> ${notes}</div>` : ''}
      </div>
      
      <div class="total-section">
        <div class="section-title">Cost Summary</div>
        <div class="info-row"><span class="label">Labor Estimate:</span> $${estimateAmount.toFixed(2)}</div>
        ${itemsTotal > 0 ? `<div class="info-row"><span class="label">Parts/Items:</span> $${itemsTotal.toFixed(2)}</div>` : ''}
        <div class="info-row print-info-row">
          <span class="label">TOTAL ESTIMATE:</span> $${(estimateAmount + itemsTotal).toFixed(2)}
        </div>
      </div>
      
      <div class="footer">
        <p>Thank you for choosing iWoodFix-IT!</p>
        <p>This is an estimate. Final charges may vary based on actual work performed.</p>
        <p>Please keep this ticket for your records.</p>
      </div>
      
      <div class="print-no-print">
        <button onclick="window.print()" class="print-button">Print Both Copies</button>
        <button onclick="window.close()" class="print-close-btn">Close</button>
      </div>
    </body>
    </html>
    
    <div class="print-page-break"></div>
    
    <!DOCTYPE html>
    <html>
    <head>
      <title>Repair Ticket #${repairId} - Business Copy</title>
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
      <div class="ticket-title">REPAIR #${repairId}</div>
      
      <div class="compact-section">
        <div class="compact-title">Customer</div>
        <div class="compact-row"><span class="compact-label">Name:</span> ${customerName}</div>
        <div class="compact-row"><span class="compact-label">Phone:</span> ${phone}</div>
      </div>
      
      <div class="compact-section">
        <div class="compact-title">Items & Problem</div>
        <div class="compact-row"><span class="compact-label">Items:</span> ${itemsBrought}</div>
        <div class="compact-row"><span class="compact-label">Problem:</span> ${problem.length > 50 ? problem.substring(0, 50) + '...' : problem}</div>
        <div class="compact-row"><span class="compact-label">Status:</span> ${status}</div>
        <div class="compact-row"><span class="compact-label">Drop-off:</span> ${dropOffDateObj.toLocaleDateString()}</div>
      </div>
      
      <div class="total-compact">
        TOTAL ESTIMATE: $${(estimateAmount + itemsTotal).toFixed(2)}
      </div>
      
      <div class="print-footer">
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

async function toggleRepairItems(repairId, button) {
  const itemsRow = document.getElementById(`items-${repairId}`);
  const loadingDiv = document.getElementById(`loading-${repairId}`);
  const itemsContainer = document.getElementById(`items-container-${repairId}`);
  
  if (itemsRow.style.display === 'none') {
    // Show the breakdown
    itemsRow.style.display = 'table-row';
    button.textContent = 'Collapse';
    
    // Check if items are already loaded
    if (itemsContainer.innerHTML === '') {
      loadingDiv.style.display = 'block';
      try {
        const response = await fetch(`/api/repairs/${repairId}/items`);
        if (!response.ok) throw new Error('Failed to fetch repair items');
        
        const items = await response.json();
        loadingDiv.style.display = 'none';
        
        if (items.length === 0) {
          itemsContainer.innerHTML = '<p class="item-no-items">No items found for this repair.</p>';
        } else {
          let itemsHtml = `
            <div class="item-container-padding-small">
              <h4>Repair Items Breakdown:</h4>
              <table class="success-items-table">
                <thead>
                  <tr>
                    <th class="text-left">Item Name</th>
                    <th class="text-left">Color</th>
                    <th class="text-left">Model</th>
                    <th class="text-right">Price</th>
                    <th class="text-center">Quantity</th>
                    <th class="text-right">Total</th>
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
                <td>${item.item_name}</td>
                <td>${item.item_color}</td>
                <td>${item.item_model}</td>
                <td class="text-right">$${parseFloat(item.price).toFixed(2)}</td>
                <td class="text-center">${item.repair_item_quantity}</td>
                <td class="text-right">$${itemTotal.toFixed(2)}</td>
              </tr>
            `;
          });
          
          itemsHtml += `
                </tbody>
                <tfoot>
                  <tr style="background-color: #f8f9fa; font-weight: bold;">
                    <td colspan="5" style="border: 1px solid #ddd; padding: 8px; text-align: right;">Items Total:</td>
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
        console.error('Error fetching repair items:', error);
        loadingDiv.style.display = 'none';
        itemsContainer.innerHTML = '<p style="padding: 10px; color: #dc3545;">Error loading repair items. Please try again.</p>';
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

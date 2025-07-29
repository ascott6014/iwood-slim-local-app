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
        <td><span class="status-badge status-${r.status.toLowerCase().replace(/\s+/g, '-')}">${r.status}</span></td>
        <td>${r.notes || 'N/A'}</td>
        <td>${new Date(r.drop_off_date).toLocaleDateString()}</td>
        <td>${hasPickupDate ? new Date(r.pickup_date).toLocaleDateString() : 'N/A'}</td>
        <td>
          <button onclick="editRepair(${r.repair_id})">Change Status</button>
          ${actionButton}
        </td>
      `;
      tbody.appendChild(tr);
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
  
  loadRepairs();
});

let currentInstallId = null;

function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

async function loadInstall() {
  const installIdInput = document.getElementById('installIdInput');
  const installId = parseInt(installIdInput.value);
  
  if (isNaN(installId) || installId <= 0) {
    alert('Please enter a valid Install ID');
    return;
  }

  try {
    // Load install info from the summary view
    const installResponse = await fetch(`/summary/installs`);
    const installs = await installResponse.json();
    const install = installs.find(i => i.install_id === installId);
    
    if (!install) {
      alert('Install not found');
      return;
    }

    // Display install info
    currentInstallId = installId;
    document.getElementById('installNumber').textContent = installId;
    document.getElementById('customerName').textContent = `${install.first_name} ${install.last_name}`;
    document.getElementById('installDate').textContent = install.install_date ? new Date(install.install_date).toLocaleDateString() : 'Not scheduled';
    document.getElementById('installDescription').textContent = install.description || 'No description';
    document.getElementById('installEstimate').textContent = `$${parseFloat(install.estimate).toFixed(2)}`;
    
    // Show sections
    document.getElementById('installInfo').style.display = 'block';
    document.getElementById('addItemSection').style.display = 'block';
    document.getElementById('installItemsSection').style.display = 'block';
    
    // Load install items
    await loadInstallItems();
    
    // Load available items for dropdown
    await loadAvailableItems();
    
  } catch (error) {
    console.error('Error loading install:', error);
    alert('Failed to load install. Please try again.');
  }
}

async function loadInstallItems() {
  try {
    const response = await fetch(`/installs/${currentInstallId}/items`);
    const items = await response.json();
    
    const tbody = document.getElementById('installItemsTable');
    tbody.innerHTML = '';
    
    let itemsSubtotal = 0;
    
    items.forEach(item => {
      const row = document.createElement('tr');
      const itemTotal = parseFloat(item.total_price);
      itemsSubtotal += itemTotal;
      
      row.innerHTML = `
        <td>${item.item_name}</td>
        <td>${item.item_model}</td>
        <td>${item.item_color}</td>
        <td>$${parseFloat(item.price).toFixed(2)}</td>
        <td>
          <input type="number" 
                 value="${item.install_item_quantity}" 
                 min="1" 
                 class="quantity-input"
                 data-item-id="${item.install_item_id}"
                 onchange="updateInstallItemQuantity(${item.install_item_id}, this.value)">
        </td>
        <td>$${itemTotal.toFixed(2)}</td>
        <td>
          <button onclick="removeInstallItem(${item.install_item_id})" class="remove-btn">Remove</button>
        </td>
      `;
      tbody.appendChild(row);
    });
    
    // Update totals
    updateInstallTotals(itemsSubtotal);
    
  } catch (error) {
    console.error('Error loading install items:', error);
    alert('Failed to load install items');
  }
}

async function loadAvailableItems() {
  try {
    const response = await fetch('/items/install');
    const items = await response.json();
    
    const select = document.getElementById('itemSelect');
    select.innerHTML = '<option value="">Select an item...</option>';
    
    items.forEach(item => {
      const option = document.createElement('option');
      option.value = item.item_id;
      option.textContent = `${item.item_name} - ${item.item_model} (${item.item_color}) - $${parseFloat(item.price).toFixed(2)}`;
      select.appendChild(option);
    });
    
  } catch (error) {
    console.error('Error loading available items:', error);
    alert('Failed to load available items');
  }
}

async function addInstallItem() {
  const itemSelect = document.getElementById('itemSelect');
  const quantityInput = document.getElementById('itemQuantity');
  
  const itemId = parseInt(itemSelect.value);
  const quantity = parseInt(quantityInput.value);
  
  if (!itemId || quantity <= 0) {
    alert('Please select an item and enter a valid quantity');
    return;
  }

  try {
    const response = await fetch('/installs/add-item', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        install_id: currentInstallId,
        item_id: itemId,
        quantity: quantity
      })
    });

    if (response.ok) {
      // Reset form
      itemSelect.value = '';
      quantityInput.value = '1';
      
      // Reload install items
      await loadInstallItems();
    } else {
      alert('Failed to add item to install');
    }
  } catch (error) {
    console.error('Error adding install item:', error);
    alert('Failed to add item to install');
  }
}

const debouncedUpdateQuantity = debounce(async (installItemId, newQuantity) => {
  try {
    const response = await fetch('/installs/update-item', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        install_item_id: installItemId,
        quantity: newQuantity
      })
    });

    if (response.ok) {
      await loadInstallItems();
    } else {
      alert('Failed to update item quantity');
    }
  } catch (error) {
    console.error('Error updating install item quantity:', error);
    alert('Failed to update item quantity');
  }
});

function updateInstallItemQuantity(installItemId, newQuantity) {
  const quantity = parseInt(newQuantity);
  if (quantity <= 0) {
    alert('Quantity must be greater than 0');
    return;
  }
  debouncedUpdateQuantity(installItemId, quantity);
}

async function removeInstallItem(installItemId) {
  if (!confirm('Are you sure you want to remove this item from the install?')) {
    return;
  }

  try {
    const response = await fetch('/installs/remove-item', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        install_item_id: installItemId
      })
    });

    if (response.ok) {
      await loadInstallItems();
    } else {
      alert('Failed to remove item from install');
    }
  } catch (error) {
    console.error('Error removing install item:', error);
    alert('Failed to remove item from install');
  }
}

function updateInstallTotals(itemsSubtotal) {
  // Get estimate from display
  const estimateText = document.getElementById('installEstimate').textContent;
  const estimate = parseFloat(estimateText.replace('$', ''));
  
  // Calculate subtotal (estimate + items)
  const subtotal = estimate + itemsSubtotal;
  
  // Calculate tax (assuming you'll get this from your tax system)
  // For now, we'll calculate it on the frontend, but ideally this should come from backend
  calculateAndDisplayTotals(estimate, itemsSubtotal, subtotal);
}

async function calculateAndDisplayTotals(estimate, itemsSubtotal, subtotal) {
  try {
    // Get current tax rate
    const taxResponse = await fetch('/tax/current');
    const taxData = await taxResponse.json();
    const taxRate = taxData.rate || 0;
    
    const taxAmount = subtotal * (taxRate / 100);
    const finalPrice = subtotal + taxAmount;
    
    // Update display
    document.getElementById('installEstimate').textContent = `$${estimate.toFixed(2)}`;
    document.getElementById('itemsSubtotal').textContent = `$${itemsSubtotal.toFixed(2)}`;
    document.getElementById('installSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('taxAmount').textContent = `$${taxAmount.toFixed(2)}`;
    document.getElementById('finalPrice').textContent = `$${finalPrice.toFixed(2)}`;
    
  } catch (error) {
    console.error('Error calculating totals:', error);
    // Fallback to no tax calculation
    document.getElementById('installEstimate').textContent = `$${estimate.toFixed(2)}`;
    document.getElementById('itemsSubtotal').textContent = `$${itemsSubtotal.toFixed(2)}`;
    document.getElementById('installSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('taxAmount').textContent = '$0.00';
    document.getElementById('finalPrice').textContent = `$${subtotal.toFixed(2)}`;
  }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  // Set up event listeners
  document.getElementById('loadInstallBtn').addEventListener('click', loadInstall);
  document.getElementById('addItemBtn').addEventListener('click', addInstallItem);
  
  // Allow Enter key to load install
  document.getElementById('installIdInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      loadInstall();
    }
  });
});

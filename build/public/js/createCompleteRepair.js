let selectedCustomer = null;
let selectedItems = [];
let totalItemsAmount = 0;

function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Customer Search Functions (reused from createCompleteOrder.js)
async function searchCustomers() {
  const searchInput = document.getElementById('customerSearch');
  const resultsDiv = document.getElementById('customerResults');
  
  const query = searchInput.value.trim();
  if (query.length < 2) {
    resultsDiv.style.display = 'none';
    return;
  }

  try {
    const response = await fetch(`/api/customers/search?q=${encodeURIComponent(query)}`);
    const customers = await response.json();

    if (customers.length === 0) {
      resultsDiv.innerHTML = '<div class="search-result-item">No customers found</div>';
    } else {
      resultsDiv.innerHTML = customers.map(customer => `
        <div class="search-result-item" onclick="selectCustomer(${customer.customer_id}, '${customer.first_name}', '${customer.last_name}', '${customer.phone}', '${customer.email}', '${customer.address}', '${customer.city}', '${customer.state}', '${customer.zip}')">
          <strong>${customer.first_name} ${customer.last_name}</strong><br>
          <span>${customer.phone} | ${customer.email}</span><br>
          <span class="contact-info">${customer.address}, ${customer.city}, ${customer.state} ${customer.zip}</span>
        </div>
      `).join('');
    }
    resultsDiv.style.display = 'block';
  } catch (error) {
    console.error('Error searching customers:', error);
    resultsDiv.innerHTML = '<div class="search-result-item">Error searching customers</div>';
    resultsDiv.style.display = 'block';
  }
}

function selectCustomer(id, firstName, lastName, phone, email, address, city, state, zip) {
  selectedCustomer = {
    customer_id: id,
    first_name: firstName,
    last_name: lastName,
    phone: phone,
    email: email,
    address: address,
    city: city,
    state: state,
    zip: zip
  };

  // Hide search and show selected customer
  document.getElementById('customerSearch').value = '';
  document.getElementById('customerResults').style.display = 'none';
  document.getElementById('newCustomerForm').style.display = 'none';
  
  const customerInfo = document.getElementById('customerInfo');
  customerInfo.innerHTML = `
    <div class="customer-display">
      <strong>${firstName} ${lastName}</strong><br>
      <span>${phone} | ${email}</span><br>
      <span class="contact-info">${address}, ${city}, ${state} ${zip}</span>
    </div>
  `;
  
  document.getElementById('selectedCustomer').style.display = 'block';
  document.getElementById('repairDetailsSection').style.display = 'block';
  updateCreateButton();
}

function showNewCustomerForm() {
  document.getElementById('newCustomerForm').style.display = 'block';
  document.getElementById('customerResults').style.display = 'none';
  selectedCustomer = 'new'; // Flag to indicate new customer
  document.getElementById('repairDetailsSection').style.display = 'block';
  updateCreateButton();
}

function changeCustomer() {
  selectedCustomer = null;
  document.getElementById('selectedCustomer').style.display = 'none';
  document.getElementById('newCustomerForm').style.display = 'none';
  document.getElementById('repairDetailsSection').style.display = 'none';
  document.getElementById('itemSelectionSection').style.display = 'none';
  document.getElementById('customerSearch').value = '';
  updateCreateButton();
}

// Item Search and Management Functions
async function searchItems() {
  const searchInput = document.getElementById('itemSearch');
  const resultsSelect = document.getElementById('itemResults');
  
  const query = searchInput.value.trim();
  if (query.length < 2) {
    resultsSelect.innerHTML = '<option value="">Select an item...</option>';
    return;
  }

  try {
    const response = await fetch(`/api/items/search?q=${encodeURIComponent(query)}&repair_item=true`);
    const items = await response.json();

    resultsSelect.innerHTML = '<option value="">Select an item...</option>';
    
    items.forEach(item => {
      if (item.repair_item) { // Only show items that can be used for repairs
        const option = document.createElement('option');
        option.value = JSON.stringify(item);
        option.textContent = `${item.item_name} - ${item.item_color} ${item.item_model} ($${parseFloat(item.price).toFixed(2)})`;
        resultsSelect.appendChild(option);
      }
    });
  } catch (error) {
    console.error('Error searching items:', error);
    resultsSelect.innerHTML = '<option value="">Error loading items</option>';
  }
}

function addItemToRepair() {
  const itemResults = document.getElementById('itemResults');
  const itemQuantity = document.getElementById('itemQuantity');
  
  if (!itemResults.value) {
    alert('Please select an item');
    return;
  }
  
  if (!itemQuantity.value || itemQuantity.value < 1) {
    alert('Please enter a valid quantity');
    return;
  }

  try {
    const selectedItem = JSON.parse(itemResults.value);
    const quantity = parseInt(itemQuantity.value);
    const itemTotal = parseFloat(selectedItem.price) * quantity;

    // Check if item already exists in the list
    const existingItemIndex = selectedItems.findIndex(item => item.item_id === selectedItem.item_id);
    
    if (existingItemIndex !== -1) {
      // Update existing item quantity
      selectedItems[existingItemIndex].quantity += quantity;
      selectedItems[existingItemIndex].total = selectedItems[existingItemIndex].quantity * parseFloat(selectedItem.price);
    } else {
      // Add new item
      selectedItems.push({
        item_id: selectedItem.item_id,
        item_name: selectedItem.item_name,
        item_color: selectedItem.item_color,
        item_model: selectedItem.item_model,
        price: parseFloat(selectedItem.price),
        quantity: quantity,
        total: itemTotal
      });
    }

    updateItemsTable();
    
    // Reset form
    itemResults.value = '';
    itemQuantity.value = '1';
    document.getElementById('itemSearch').value = '';
    
  } catch (error) {
    console.error('Error adding item:', error);
    alert('Error adding item. Please try again.');
  }
}

function updateItemsTable() {
  const tbody = document.getElementById('selectedItemsBody');
  const noItemsRow = document.getElementById('noItemsRow');
  
  // Clear existing rows except the "no items" row
  Array.from(tbody.children).forEach(row => {
    if (row.id !== 'noItemsRow') {
      row.remove();
    }
  });

  if (selectedItems.length === 0) {
    noItemsRow.style.display = 'table-row';
    totalItemsAmount = 0;
  } else {
    noItemsRow.style.display = 'none';
    totalItemsAmount = 0;

    selectedItems.forEach((item, index) => {
      totalItemsAmount += item.total;
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.item_name}</td>
        <td>${item.item_color}</td>
        <td>${item.item_model}</td>
        <td>$${item.price.toFixed(2)}</td>
        <td>${item.quantity}</td>
        <td>$${item.total.toFixed(2)}</td>
        <td>
          <button onclick="removeItemFromRepair(${index})" class="remove-item-btn">Remove</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  document.getElementById('itemsTotal').textContent = `$${totalItemsAmount.toFixed(2)}`;
}

function removeItemFromRepair(index) {
  selectedItems.splice(index, 1);
  updateItemsTable();
}

function updateCreateButton() {
  const reviewBtn = document.getElementById('reviewRepairBtn');
  const itemsBrought = document.getElementById('itemsBrought').value.trim();
  const problem = document.getElementById('problem').value.trim();
  const solution = document.getElementById('solution').value.trim();
  const estimate = document.getElementById('estimate').value;
  const dropOffDate = document.getElementById('dropOffDate').value;
  
  reviewBtn.disabled = !selectedCustomer || !itemsBrought || !problem || !solution || !estimate || !dropOffDate;
}

async function createRepair() {
  if (!selectedCustomer) {
    alert('Please select a customer');
    return;
  }

  const itemsBrought = document.getElementById('itemsBrought').value.trim();
  const problem = document.getElementById('problem').value.trim();
  const solution = document.getElementById('solution').value.trim();
  const estimate = document.getElementById('estimate').value;
  const status = document.getElementById('status').value;
  const notesRepair = document.getElementById('notesRepair').value.trim();
  const dropOffDate = document.getElementById('dropOffDate').value;
  const pickUpDate = document.getElementById('pickUpDate').value;

  if (!itemsBrought || !problem || !solution || !estimate || !dropOffDate) {
    alert('Please fill in all required fields');
    return;
  }

  const reviewRepairBtn = document.getElementById('reviewRepairBtn');
  reviewRepairBtn.disabled = true;
  reviewRepairBtn.textContent = 'Creating Repair...';

  try {
    let repairData = {
      items_brought: itemsBrought,
      problem: problem,
      solution: solution,
      estimate: parseFloat(estimate),
      status: status,
      notes: notesRepair || null,
      drop_off_date: dropOffDate,
      pick_up_date: pickUpDate || null
    };

    let endpoint;
    if (selectedCustomer === 'new') {
      // Validate new customer form
      const firstName = document.getElementById('firstName').value.trim();
      const lastName = document.getElementById('lastName').value.trim();
      const phone = document.getElementById('phone').value.trim();
      
      if (!firstName || !lastName || !phone) {
        alert('Please fill in first name, last name, and phone number for the new customer');
        reviewRepairBtn.disabled = false;
        reviewRepairBtn.textContent = 'Review & Submit Repair';
        return;
      }

      repairData = {
        ...repairData,
        first_name: firstName,
        last_name: lastName,
        address: document.getElementById('address').value.trim(),
        city: document.getElementById('city').value.trim(),
        state: document.getElementById('state').value.trim(),
        zip: document.getElementById('zip').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim()
      };
      endpoint = '/repairs/create-customer-repair';
    } else {
      repairData.customer_id = selectedCustomer.customer_id;
      endpoint = '/repairs/create-repair';
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(repairData)
    });

    const result = await response.json();

    if (response.ok) {
      // Redirect to homepage after successful repair creation
      alert(`Repair created successfully! Repair ID: ${result.repair_id || 'Generated'}`);
      window.location.href = 'index.html';
    } else {
      alert(`Error creating repair: ${result.message}`);
      reviewRepairBtn.disabled = false;
      reviewRepairBtn.textContent = 'Review & Submit Repair';
    }

  } catch (error) {
    console.error('Error creating repair:', error);
    alert('Failed to create repair. Please try again.');
    reviewRepairBtn.disabled = false;
    reviewRepairBtn.textContent = 'Review & Submit Repair';
  }
}

function reviewRepair() {
  if (!selectedCustomer) {
    alert('Please select a customer');
    return;
  }

  const itemsBrought = document.getElementById('itemsBrought').value.trim();
  const problem = document.getElementById('problem').value.trim();
  const solution = document.getElementById('solution').value.trim();
  const estimate = document.getElementById('estimate').value;
  const dropOffDate = document.getElementById('dropOffDate').value;

  if (!itemsBrought || !problem || !solution || !estimate || !dropOffDate) {
    alert('Please fill in all required fields');
    return;
  }

  // Hide repair details section and show item selection section
  document.getElementById('repairDetailsSection').style.display = 'none';
  document.getElementById('itemSelectionSection').style.display = 'block';
}

async function finalSubmitRepair() {
  if (!selectedCustomer) {
    alert('Please select a customer');
    return;
  }

  const itemsBrought = document.getElementById('itemsBrought').value.trim();
  const problem = document.getElementById('problem').value.trim();
  const solution = document.getElementById('solution').value.trim();
  const estimate = document.getElementById('estimate').value;
  const status = document.getElementById('status').value;
  const notesRepair = document.getElementById('notesRepair').value.trim();
  const dropOffDate = document.getElementById('dropOffDate').value;
  const pickUpDate = document.getElementById('pickUpDate').value;

  if (!itemsBrought || !problem || !solution || !estimate || !dropOffDate) {
    alert('Please fill in all required fields');
    return;
  }

  const finalSubmitBtn = document.getElementById('finalSubmitBtn');
  finalSubmitBtn.disabled = true;
  finalSubmitBtn.textContent = 'Creating Repair...';

  try {
    let repairData = {
      items_brought: itemsBrought,
      problem: problem,
      solution: solution,
      estimate: parseFloat(estimate),
      status: status,
      notes: notesRepair || null,
      drop_off_date: dropOffDate,
      pick_up_date: pickUpDate || null
    };

    let endpoint;
    if (selectedCustomer === 'new') {
      // Validate new customer form
      const firstName = document.getElementById('firstName').value.trim();
      const lastName = document.getElementById('lastName').value.trim();
      const phone = document.getElementById('phone').value.trim();
      
      if (!firstName || !lastName || !phone) {
        alert('Please fill in first name, last name, and phone number for the new customer');
        finalSubmitBtn.disabled = false;
        finalSubmitBtn.textContent = 'Complete Repair';
        return;
      }

      repairData = {
        ...repairData,
        first_name: firstName,
        last_name: lastName,
        address: document.getElementById('address').value.trim(),
        city: document.getElementById('city').value.trim(),
        state: document.getElementById('state').value.trim(),
        zip: document.getElementById('zip').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim()
      };
      endpoint = '/repairs/create-customer-repair';
    } else {
      repairData.customer_id = selectedCustomer.customer_id;
      endpoint = '/repairs/create-repair';
    }

    console.log('Submitting repair data:', repairData);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(repairData)
    });

    if (!response.ok) {
      throw new Error('Failed to create repair');
    }

    const result = await response.json();
    console.log('Repair created:', result);

    // If there are selected items, add them to the repair
    if (selectedItems.length > 0 && result.repair_id) {
      await addItemsToRepair(result.repair_id);
    }

    // Show success message
    showRepairSuccess(result);

  } catch (error) {
    console.error('Error creating repair:', error);
    alert('Error creating repair. Please try again.');
    finalSubmitBtn.disabled = false;
    finalSubmitBtn.textContent = 'Complete Repair';
  }
}

async function addItemsToRepair(repairId) {
  try {
    for (const item of selectedItems) {
      const response = await fetch('/repairs/add-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repair_id: repairId,
          item_id: item.item_id,
          quantity: item.quantity
        })
      });

      if (!response.ok) {
        console.error('Failed to add item to repair:', item);
      }
    }
  } catch (error) {
    console.error('Error adding items to repair:', error);
  }
}

function showRepairSuccess(result) {
  // Don't hide the form sections - just show the success message at the bottom
  const successSection = document.getElementById('successMessage');
  const detailsDiv = document.getElementById('repairDetails');
  
  detailsDiv.innerHTML = `
    <p><strong>Repair ID:</strong> ${result.repair_id}</p>
    <p><strong>Customer:</strong> ${selectedCustomer === 'new' ? 
      `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}` : 
      `${selectedCustomer.first_name} ${selectedCustomer.last_name}`}</p>
    <p><strong>Items Brought:</strong> ${document.getElementById('itemsBrought').value}</p>
    <p><strong>Estimate:</strong> $${parseFloat(document.getElementById('estimate').value).toFixed(2)}</p>
    ${selectedItems.length > 0 ? `<p><strong>Repair Items Total:</strong> $${totalItemsAmount.toFixed(2)}</p>` : ''}
    ${selectedItems.length > 0 ? `<p><strong>Total (Estimate + Items):</strong> $${(parseFloat(document.getElementById('estimate').value) + totalItemsAmount).toFixed(2)}</p>` : ''}
    <div class="success-actions">
      <button type="button" onclick="printRepairTicket({repair_id: ${result.repair_id}})" class="success-print-btn">
        Print Repair Ticket
      </button>
      <br><br>
      <button type="button" onclick="location.href='index.html'" class="success-home-btn">← Back to Home</button>
    </div>
  `;
  
  successSection.style.display = 'block';
}

function printRepairTicket(result) {
  // Get current data
  const customerName = selectedCustomer === 'new' ? 
    `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}` : 
    `${selectedCustomer.first_name} ${selectedCustomer.last_name}`;
  
  const customerPhone = selectedCustomer === 'new' ? 
    document.getElementById('phone').value : 
    selectedCustomer.phone;
    
  const customerEmail = selectedCustomer === 'new' ? 
    document.getElementById('email').value : 
    selectedCustomer.email;

  const itemsBrought = document.getElementById('itemsBrought').value;
  const problem = document.getElementById('problem').value;
  const solution = document.getElementById('solution').value;
  const estimate = parseFloat(document.getElementById('estimate').value);
  const status = document.getElementById('status').value;
  const dropOffDate = new Date(document.getElementById('dropOffDate').value);
  const notes = document.getElementById('notesRepair').value;

  // Prepare data for the shared print utility
  const ticketData = {
    ticketId: result.repair_id,
    customerName: customerName,
    customerPhone: customerPhone,
    customerEmail: customerEmail,
    customerAddress: '', // Add if available
    items: selectedItems || [],
    totalAmount: estimate + totalItemsAmount,
    specificFields: {
      itemsBrought: itemsBrought,
      problem: problem,
      solution: solution,
      status: status,
      dropOffDate: dropOffDate.toLocaleDateString(),
      notes: notes,
      laborCost: estimate
    }
  };

  // Use the shared print utility
  if (window.PrintUtils && window.PrintUtils.printDualCopyTicket) {
    window.PrintUtils.printDualCopyTicket(ticketData, 'repair');
  } else {
    console.error('Print utility not available');
  }
}

function submitRepair() {
  closeRepairReview();
  createRepair();
}

function printRepairReview() {
  // Show review popup
  showRepairReview();
}

function submitRepair() {
  closeRepairReview();
  createRepair();
}

function closeRepairReview() {
  const summaryDiv = document.getElementById('repairReviewPopup');
  if (summaryDiv) {
    document.body.removeChild(summaryDiv);
  }
}

function printRepairReview() {
  const summary = document.getElementById('repairReviewPopup');
  if (summary) {
    document.body.removeChild(summary); // Temporarily remove popup
  }

  window.print();

  if (summary) {
    document.body.appendChild(summary); // Restore popup
  }
}

function createAnotherRepair() {
  // Reset everything
  selectedCustomer = null;
  selectedItems = [];
  totalItemsAmount = 0;
  
  // Reset forms
  document.getElementById('newCustomerForm').style.display = 'none';
  document.getElementById('selectedCustomer').style.display = 'none';
  document.getElementById('repairDetailsSection').style.display = 'none';
  document.getElementById('itemSelectionSection').style.display = 'none';
  document.getElementById('successMessage').style.display = 'none';
  document.querySelector('.container').style.display = 'block';
  
  // Clear form inputs
  document.getElementById('customerSearch').value = '';
  document.getElementById('firstName').value = '';
  document.getElementById('lastName').value = '';
  document.getElementById('address').value = '';
  document.getElementById('city').value = '';
  document.getElementById('state').value = '';
  document.getElementById('zip').value = '';
  document.getElementById('phone').value = '';
  document.getElementById('email').value = '';
  document.getElementById('itemsBrought').value = '';
  document.getElementById('problem').value = '';
  document.getElementById('solution').value = '';
  document.getElementById('estimate').value = '';
  document.getElementById('status').value = 'not started';
  document.getElementById('notesRepair').value = '';
  document.getElementById('dropOffDate').value = '';
  document.getElementById('pickUpDate').value = '';
  
  // Clear item selection
  document.getElementById('itemSearch').value = '';
  document.getElementById('itemResults').innerHTML = '<option value="">Select an item...</option>';
  document.getElementById('itemQuantity').value = '1';
  updateItemsTable();
  
  updateCreateButton();
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
  const customerSearchInput = document.getElementById('customerSearch');
  const itemsBrought = document.getElementById('itemsBrought');
  const problem = document.getElementById('problem');
  const solution = document.getElementById('solution');
  const estimate = document.getElementById('estimate');
  const dropOffDate = document.getElementById('dropOffDate');
  
  customerSearchInput.addEventListener('input', debounce(searchCustomers, 300));
  itemsBrought.addEventListener('input', updateCreateButton);
  problem.addEventListener('input', updateCreateButton);
  solution.addEventListener('input', updateCreateButton);
  estimate.addEventListener('input', updateCreateButton);
  dropOffDate.addEventListener('input', updateCreateButton);
  
  document.getElementById('newCustomerBtn').addEventListener('click', showNewCustomerForm);
  document.getElementById('changeCustomerBtn').addEventListener('click', changeCustomer);
  document.getElementById('reviewRepairBtn').addEventListener('click', reviewRepair);
  
  // Add event listeners for item functionality
  document.getElementById('itemSearch').addEventListener('input', debounce(searchItems, 300));
  document.getElementById('addItemBtn').addEventListener('click', addItemToRepair);
  document.getElementById('finalSubmitBtn').addEventListener('click', finalSubmitRepair);

  // Set default drop off date to now
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  document.getElementById('dropOffDate').value = now.toISOString().slice(0, 16);

  // Hide customer results when clicking elsewhere
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.customer-search')) {
      document.getElementById('customerResults').style.display = 'none';
    }
  });
});

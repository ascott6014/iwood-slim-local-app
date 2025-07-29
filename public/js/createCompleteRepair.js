let selectedCustomer = null;

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
          <span style="color: #666;">${customer.address}, ${customer.city}, ${customer.state} ${customer.zip}</span>
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
      <span style="color: #666;">${address}, ${city}, ${state} ${zip}</span>
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
  document.getElementById('customerSearch').value = '';
  updateCreateButton();
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
  const status = document.getElementById('status').value;
  const notesRepair = document.getElementById('notesRepair').value.trim();
  const dropOffDate = document.getElementById('dropOffDate').value;
  const pickUpDate = document.getElementById('pickUpDate').value;

  if (!itemsBrought || !problem || !solution || !estimate || !dropOffDate) {
    alert('Please fill in all required fields');
    return;
  }

  // Prepare customer info
  let customerInfo;
  if (selectedCustomer === 'new') {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    
    if (!firstName || !lastName || !phone) {
      alert('Please fill in first name, last name, and phone number for the new customer');
      return;
    }

    customerInfo = {
      name: `${firstName} ${lastName}`,
      address: document.getElementById('address').value.trim(),
      city: document.getElementById('city').value.trim(),
      state: document.getElementById('state').value.trim(),
      zip: document.getElementById('zip').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      email: document.getElementById('email').value.trim()
    };
  } else {
    customerInfo = {
      name: `${selectedCustomer.first_name} ${selectedCustomer.last_name}`,
      address: selectedCustomer.address,
      city: selectedCustomer.city,
      state: selectedCustomer.state,
      zip: selectedCustomer.zip,
      phone: selectedCustomer.phone,
      email: selectedCustomer.email
    };
  }

  // Create summary HTML
  let summaryHTML = `
    <h2>Repair Review</h2>
    <div style="text-align: left;">
      <h3>Customer Information:</h3>
      <p><strong>Name:</strong> ${customerInfo.name}</p>
      <p><strong>Phone:</strong> ${customerInfo.phone}</p>
      <p><strong>Email:</strong> ${customerInfo.email}</p>
      <p><strong>Address:</strong> ${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zip}</p>
      
      <h3>Repair Details:</h3>
      <p><strong>Items Brought:</strong> ${itemsBrought}</p>
      <p><strong>Problem:</strong> ${problem}</p>
      <p><strong>Solution:</strong> ${solution}</p>
      <p><strong>Estimated Cost:</strong> $${parseFloat(estimate).toFixed(2)}</p>
      <p><strong>Status:</strong> ${status}</p>
      <p><strong>Drop Off Date:</strong> ${new Date(dropOffDate).toLocaleString()}</p>
      ${pickUpDate ? `<p><strong>Pick Up Date:</strong> ${new Date(pickUpDate).toLocaleString()}</p>` : ''}
      ${notesRepair ? `<p><strong>Notes:</strong> ${notesRepair}</p>` : ''}
    </div>
    <div style="margin-top: 20px; text-align: center;">
      <button onclick="printRepairReview()" style="padding: 10px 20px; margin: 5px; background-color: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer;">🖨️ Print</button>
      <button onclick="submitRepair()" style="padding: 10px 20px; margin: 5px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">✅ Confirm & Submit</button>
      <button onclick="closeRepairReview()" style="padding: 10px 20px; margin: 5px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">❌ Cancel</button>
    </div>
  `;

  const summaryDiv = document.createElement('div');
  summaryDiv.id = 'repairReviewPopup';
  summaryDiv.innerHTML = summaryHTML;
  document.body.appendChild(summaryDiv);

  Object.assign(summaryDiv.style, {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: '30px',
    background: '#fff',
    boxShadow: '0 0 15px rgba(0,0,0,0.2)',
    zIndex: '9999',
    maxHeight: '90vh',
    overflowY: 'auto',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '600px',
  });
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
  
  // Reset forms
  document.getElementById('newCustomerForm').style.display = 'none';
  document.getElementById('selectedCustomer').style.display = 'none';
  document.getElementById('repairDetailsSection').style.display = 'none';
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
  document.getElementById('createAnotherBtn').addEventListener('click', createAnotherRepair);

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

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('mainForm');
  const previewBtn = document.getElementById('previewBtn');

  if (!form || !previewBtn) return;

  previewBtn.addEventListener('click', () => {
    // First update the form data
    if (window.updateFormAndPreview) {
      window.updateFormAndPreview();
    }
    
    // Get form data
    const data = new FormData(form);
    
    // Parse items from hidden field
    const itemsData = data.get('order_items');
    let items = [];
    try {
      items = JSON.parse(itemsData) || [];
    } catch (e) {
      console.error('Error parsing items:', e);
    }
    
    // Build summary HTML
    let summaryHTML = `
      <h2>Order Summary</h2>
      <div style="text-align: left;">
        <h3>Customer Information:</h3>
        <p><strong>Name:</strong> ${data.get('customer_name')}</p>
        <p><strong>Phone:</strong> ${data.get('customer_phone')}</p>
        <p><strong>Email:</strong> ${data.get('customer_email') || 'N/A'}</p>
        <p><strong>Address:</strong> ${data.get('customer_address')}</p>
        
        <h3>Order Items:</h3>
    `;
    
    if (items.length > 0) {
      summaryHTML += `
        <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Item</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Qty</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Price</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      items.forEach(item => {
        const price = parseFloat(item.price);
        const total = price * item.quantity;
        summaryHTML += `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.item_name} - ${item.item_color} - ${item.item_model}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${price.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${total.toFixed(2)}</td>
          </tr>
        `;
      });
      
      summaryHTML += `
          </tbody>
          <tfoot>
            <tr style="background-color: #f8f9fa; font-weight: bold;">
              <td colspan="3" style="border: 1px solid #ddd; padding: 8px; text-align: right;">Order Total:</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${data.get('order_total')}</td>
            </tr>
          </tfoot>
        </table>
      `;
    } else {
      summaryHTML += '<p>No items in order</p>';
    }

    summaryHTML += `
      </div>
      <div style="margin-top: 20px;">
        <button onclick="printOrderSummary()">🖨️ Print</button>
        <button onclick="submitOrderForm()">✅ Confirm & Submit</button>
        <button onclick="closeSummary()">❌ Cancel</button>
      </div>
    `;

    const summaryDiv = document.createElement('div');
    summaryDiv.id = 'summaryPopup';
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
  });
});

function submitOrderForm() {
  const form = document.getElementById('mainForm');
  
  // Get the data for API call
  const customerData = selectedCustomer === 'new' ? {
    first_name: document.getElementById('firstName').value,
    last_name: document.getElementById('lastName').value,
    address: document.getElementById('address').value,
    city: document.getElementById('city').value,
    state: document.getElementById('state').value,
    zip: document.getElementById('zip').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value
  } : {
    customer_id: selectedCustomer.customer_id
  };

  const orderData = {
    ...customerData,
    items: selectedItems
  };

  const endpoint = selectedCustomer === 'new' ? 
    '/orders/create-complete-order' : 
    '/orders/create-order';

  fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  })
    .then((res) => res.json())
    .then((result) => {
      if (result.message && result.message.includes('created')) {
        alert('✅ Order created successfully!');
        window.location.href = 'orders.html';
      } else {
        alert('❌ Order creation failed: ' + (result.message || 'Unknown error'));
      }
    })
    .catch((err) => {
      console.error('Error submitting order:', err);
      alert('⚠️ Something went wrong.');
    });

  closeSummary();
}

function closeSummary() {
  const summaryDiv = document.getElementById('summaryPopup');
  if (summaryDiv) {
    document.body.removeChild(summaryDiv);
  }
}

function printOrderSummary() {
  const summary = document.getElementById('summaryPopup');
  const summaryContent = summary.innerHTML;
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Order Summary</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          color: #333;
        }
        h2, h3 { 
          color: #333; 
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 10px 0;
        }
        th, td { 
          border: 1px solid #ddd; 
          padding: 8px; 
          text-align: left;
        }
        th { 
          background-color: #f8f9fa; 
        }
        @media print {
          button { display: none; }
        }
      </style>
    </head>
    <body>
      ${summaryContent}
      <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
        Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
  
  printWindow.onload = function() {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
}

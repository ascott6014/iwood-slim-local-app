/**
 * Shared print ticket utilities to reduce code duplication
 * Handles customer and business copy printing for all ticket types
 */

/**
 * Common CSS styles for all tickets
 */
const TICKET_STYLES = {
  customer: `
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
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    .items-table th, .items-table td {
      border: 1px solid #333;
      padding: 5px;
      text-align: left;
    }
    .items-table th {
      background-color: #f0f0f0;
      font-weight: bold;
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
  `,
  business: `
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
  `
};

/**
 * Generate HTML for customer copy ticket
 * @param {Object} data - Ticket data
 * @param {string} ticketType - Type of ticket (repair, order, install)
 * @returns {string} HTML string for customer copy
 */
function generateCustomerCopy(data, ticketType) {
  const {
    ticketId,
    customerName,
    customerPhone,
    customerEmail,
    customerAddress,
    items = [],
    totalAmount = 0,
    specificFields = {}
  } = data;

  let specificContent = '';
  let companyTagline = '';
  let ticketTitle = '';

  switch (ticketType) {
    case 'repair':
      companyTagline = 'Professional Repair Services';
      ticketTitle = `REPAIR TICKET #${ticketId}`;
      specificContent = `
        <div class="section">
          <div class="section-title">Repair Details</div>
          <div class="info-row"><span class="label">Items Brought:</span> ${specificFields.itemsBrought || 'N/A'}</div>
          <div class="info-row"><span class="label">Problem:</span> ${specificFields.problem || 'N/A'}</div>
          <div class="info-row"><span class="label">Solution:</span> ${specificFields.solution || 'N/A'}</div>
          <div class="info-row"><span class="label">Status:</span> ${specificFields.status || 'N/A'}</div>
          <div class="info-row"><span class="label">Drop-off Date:</span> ${specificFields.dropOffDate || 'N/A'}</div>
          ${specificFields.notes ? `<div class="info-row"><span class="label">Notes:</span> ${specificFields.notes}</div>` : ''}
        </div>`;
      break;
    case 'order':
      companyTagline = 'Professional Wood & Furniture Solutions';
      ticketTitle = `ORDER TICKET #${ticketId}`;
      specificContent = '';
      break;
    case 'install':
      companyTagline = 'Professional Installation Services';
      ticketTitle = `INSTALLATION TICKET #${ticketId}`;
      specificContent = `
        <div class="section">
          <div class="section-title">Installation Details</div>
          <div class="info-row"><span class="label">Description:</span> ${specificFields.description || 'N/A'}</div>
          <div class="info-row"><span class="label">Install Location:</span> ${specificFields.installLocation || 'N/A'}</div>
          <div class="info-row"><span class="label">Install Date:</span> ${specificFields.installDate || 'N/A'}</div>
          ${specificFields.notes ? `<div class="info-row"><span class="label">Notes:</span> ${specificFields.notes}</div>` : ''}
        </div>`;
      break;
  }

  const itemsSection = items.length > 0 ? `
    <div class="section">
      <div class="section-title">${ticketType === 'repair' ? 'Repair Items Used' : ticketType === 'order' ? 'Order Items' : 'Installation Materials'}</div>
      <table class="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Color/Model</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td>${item.item_name}</td>
              <td>${item.item_color} ${item.item_model}</td>
              <td>$${item.price.toFixed(2)}</td>
              <td>${item.quantity}</td>
              <td>$${item.total.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${ticketTitle} - Customer Copy</title>
      <style>${TICKET_STYLES.customer}</style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">iWoodFix-IT</div>
        <div>${companyTagline}</div>
      </div>
      
      <div class="copy-type">CUSTOMER COPY</div>
      <div class="ticket-title">${ticketTitle}</div>
      
      <div class="section">
        <div class="section-title">Customer Information</div>
        <div class="info-row"><span class="label">Name:</span> ${customerName}</div>
        <div class="info-row"><span class="label">Phone:</span> ${customerPhone}</div>
        <div class="info-row"><span class="label">Email:</span> ${customerEmail || 'N/A'}</div>
        ${customerAddress ? `<div class="info-row"><span class="label">Address:</span> ${customerAddress}</div>` : ''}
      </div>
      
      ${specificContent}
      ${itemsSection}
      
      <div class="total-section">
        <div class="section-title">Cost Summary</div>
        ${ticketType === 'repair' ? `<div class="info-row"><span class="label">Labor Estimate:</span> $${(specificFields.laborCost || 0).toFixed(2)}</div>` : ''}
        ${items.length > 0 ? `<div class="info-row"><span class="label">${ticketType === 'repair' ? 'Parts/Items:' : 'Items:'}</span> $${items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}</div>` : ''}
        <div class="info-row" style="font-size: 16px; font-weight: bold; margin-top: 10px;">
          <span class="label">TOTAL ${ticketType === 'repair' ? 'ESTIMATE' : 'AMOUNT'}:</span> $${totalAmount.toFixed(2)}
        </div>
      </div>
      
      <div class="footer">
        <p>Thank you for choosing iWoodFix-IT!</p>
        <p>${ticketType === 'repair' ? 'This is an estimate. Final charges may vary based on actual work performed.' : 'Please keep this ticket for your records.'}</p>
        <p>Please keep this ticket for your records.</p>
      </div>
      
      <div class="no-print" style="margin-top: 20px; text-align: center;">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px;">Print Both Copies</button>
        <button onclick="window.close()" style="padding: 10px 20px; font-size: 14px; margin-left: 10px;">Close</button>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate HTML for business copy ticket
 * @param {Object} data - Ticket data  
 * @param {string} ticketType - Type of ticket (repair, order, install)
 * @returns {string} HTML string for business copy
 */
function generateBusinessCopy(data, ticketType) {
  const {
    ticketId,
    customerName,
    customerPhone,
    items = [],
    totalAmount = 0,
    specificFields = {}
  } = data;

  let specificContent = '';
  let ticketTitle = '';

  switch (ticketType) {
    case 'repair':
      ticketTitle = `REPAIR #${ticketId}`;
      specificContent = `
        <div class="compact-section">
          <div class="compact-title">Items & Problem</div>
          <div class="compact-row"><span class="compact-label">Items:</span> ${specificFields.itemsBrought || 'N/A'}</div>
          <div class="compact-row"><span class="compact-label">Problem:</span> ${specificFields.problem && specificFields.problem.length > 50 ? specificFields.problem.substring(0, 50) + '...' : specificFields.problem || 'N/A'}</div>
          <div class="compact-row"><span class="compact-label">Status:</span> ${specificFields.status || 'N/A'}</div>
          <div class="compact-row"><span class="compact-label">Drop-off:</span> ${specificFields.dropOffDate || 'N/A'}</div>
        </div>`;
      break;
    case 'order':
      ticketTitle = `ORDER #${ticketId}`;
      specificContent = `
        <div class="compact-section">
          <div class="compact-title">Order Items (${items.length} items)</div>
          <div class="items-compact">
            ${items.slice(0, 3).map(item => `
              <div class="compact-row">${item.item_name} - ${item.quantity}x</div>
            `).join('')}
            ${items.length > 3 ? `<div class="compact-row">... +${items.length - 3} more items</div>` : ''}
          </div>
          <div class="compact-row"><span class="compact-label">Date:</span> ${new Date().toLocaleDateString()}</div>
        </div>`;
      break;
    case 'install':
      ticketTitle = `INSTALL #${ticketId}`;
      specificContent = `
        <div class="compact-section">
          <div class="compact-title">Installation</div>
          <div class="compact-row"><span class="compact-label">Work:</span> ${specificFields.description && specificFields.description.length > 50 ? specificFields.description.substring(0, 50) + '...' : specificFields.description || 'N/A'}</div>
          <div class="compact-row"><span class="compact-label">Location:</span> ${specificFields.installLocation && specificFields.installLocation.length > 30 ? specificFields.installLocation.substring(0, 30) + '...' : specificFields.installLocation || 'N/A'}</div>
          <div class="compact-row"><span class="compact-label">Date:</span> ${specificFields.installDate || 'N/A'}</div>
          <div class="compact-row"><span class="compact-label">Status:</span> Completed</div>
        </div>`;
      break;
  }

  return `
    <div style="page-break-before: always;"></div>
    
    <!DOCTYPE html>
    <html>
    <head>
      <title>${ticketTitle} - Business Copy</title>
      <style>${TICKET_STYLES.business}</style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">iWoodFix-IT</div>
      </div>
      
      <div class="copy-type">BUSINESS COPY</div>
      <div class="ticket-title">${ticketTitle}</div>
      
      <div class="compact-section">
        <div class="compact-title">Customer</div>
        <div class="compact-row"><span class="compact-label">Name:</span> ${customerName}</div>
        <div class="compact-row"><span class="compact-label">Phone:</span> ${customerPhone}</div>
      </div>
      
      ${specificContent}
      
      <div class="total-compact">
        ${ticketType === 'repair' ? 'TOTAL ESTIMATE:' : 'TOTAL:'} $${totalAmount.toFixed(2)}
      </div>
      
      <div style="margin-top: 10px; text-align: center; font-size: 8px;">
        Created: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
      </div>
    </body>
    </html>
  `;
}

/**
 * Print dual-copy ticket (customer + business)
 * @param {Object} data - Ticket data
 * @param {string} ticketType - Type of ticket (repair, order, install)
 */
function printDualCopyTicket(data, ticketType) {
  const customerCopy = generateCustomerCopy(data, ticketType);
  const businessCopy = generateBusinessCopy(data, ticketType);
  
  // Combine both copies
  const fullHTML = customerCopy + businessCopy;
  
  // Open print window with both copies
  const printWindow = window.open('', '_blank');
  printWindow.document.write(fullHTML);
  printWindow.document.close();
  
  // Auto-print after content loads
  printWindow.onload = function() {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
}

/**
 * Export functions for use in other modules
 */
if (typeof window !== 'undefined') {
  window.PrintUtils = {
    printDualCopyTicket,
    generateCustomerCopy,
    generateBusinessCopy
  };
}

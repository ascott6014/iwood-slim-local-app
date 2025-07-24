document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('mainForm');
  const previewBtn = document.getElementById('previewBtn');

  if (!form || !previewBtn) return;

  previewBtn.addEventListener('click', () => {
    if (!form.checkValidity()) {
      form.reportValidity(); // Show native browser validation prompts
      return;
    }

    const data = new FormData(form);
    let summaryHTML = '<h2>Customer Receipt</h2><ul>';

    for (const [key, value] of data.entries()) {
      if (value) {
        summaryHTML += `<li><strong>${key}:</strong> ${value}</li>`;
      }
    }

    summaryHTML += '</ul>';

    // Receipt container for automatic printing
    const receipt = document.createElement('div');
    receipt.id = 'autoPrintReceipt';
    receipt.innerHTML = summaryHTML;
    document.body.appendChild(receipt);

    Object.assign(receipt.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      padding: '30px',
      background: '#fff',
      fontFamily: 'sans-serif',
      zIndex: '9999',
    });

    // Trigger immediate print
    window.print();

    // Remove receipt from DOM after print
    setTimeout(() => {
      if (receipt) document.body.removeChild(receipt);
    }, 1000);
  });
});

function submitForm() {
  const form = document.getElementById('mainForm');
  const data = new FormData(form);
  const payload = {};

  for (const [key, value] of data.entries()) {
    payload[key] = value;
  }

  fetch(form.action, {
    method: form.method || 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
    .then((res) => {
      if (res.ok) {
        alert('✅ Submission successful!');
        window.location.href = 'index.html';
      } else {
        alert('❌ Submission failed.');
      }
    })
    .catch((err) => {
      console.error('Error submitting:', err);
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

function printFullPage() {
  const summary = document.getElementById('summaryPopup');
  if (summary) {
    document.body.removeChild(summary); // Hide popup
  }

  window.print();

  if (summary) {
    document.body.appendChild(summary); // Restore popup
  }
}

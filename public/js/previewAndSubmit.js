document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('mainForm');
  const previewBtn = document.getElementById('previewBtn');

  if (!form || !previewBtn) return;

  previewBtn.addEventListener('click', () => {
    // ✅ Prevent preview if form is incomplete
    if (!form.checkValidity()) {
      form.reportValidity(); // Show browser validation messages
      return;
    }

    const data = new FormData(form);
    let summaryHTML = '<h2>Submission Summary</h2><ul>';

    for (const [key, value] of data.entries()) {
      if (value) {
        summaryHTML += `<li><strong>${key}:</strong> ${value}</li>`;
      }
    }

    summaryHTML += `
      </ul>
      <div style="margin-top: 20px;">
        <button onclick="printFullPage()">🖨️ Print</button>
        <button onclick="submitForm()">✅ Confirm & Submit</button>
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
    document.body.removeChild(summary); // Temporarily remove popup
  }

  window.print();

  if (summary) {
    document.body.appendChild(summary); // Restore popup
  }
}

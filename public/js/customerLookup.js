function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('customerSearch');
  const resultsSelect = document.getElementById('customerResults');
  const hiddenIdField = document.getElementById('customer_id');

  async function fetchCustomers() {
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

  searchInput.addEventListener('input', debounce(fetchCustomers, 300));

  resultsSelect.addEventListener('change', () => {
    hiddenIdField.value = resultsSelect.value;
  });
});

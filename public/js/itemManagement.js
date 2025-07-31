let allItems = [];
let filteredItems = [];

// Load all items when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadItems();
    
    // Auto-calculate price in edit modal (for display only)
    document.getElementById('edit_cost').addEventListener('input', calculateEditPrice);
    document.getElementById('edit_markup_rate').addEventListener('input', calculateEditPrice);
});

async function loadItems() {
    try {
        const response = await fetch('/api/items');
        if (response.ok) {
            allItems = await response.json();
            filteredItems = [...allItems];
            renderItems();
            showMessage(`Loaded ${allItems.length} items successfully`, false);
        } else {
            showMessage('Error loading items', true);
        }
    } catch (error) {
        console.error('Error loading items:', error);
        showMessage('Error loading items', true);
    }
}

function renderItems() {
    const tbody = document.getElementById('itemsTableBody');
    tbody.innerHTML = '';

    if (filteredItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="no-data">No items found</td></tr>';
        return;
    }

    filteredItems.forEach(item => {
        const row = document.createElement('tr');
        
        // Build usage string
        const usageTypes = [];
        if (item.sell_item) usageTypes.push('Sale');
        if (item.repair_item) usageTypes.push('Repair');
        if (item.install_item) usageTypes.push('Install');
        const usageString = usageTypes.join(', ') || 'None';

        row.innerHTML = `
            <td>${item.item_name}</td>
            <td>${item.item_color || ''}</td>
            <td>${item.item_model || ''}</td>
            <td class="description-cell">${item.description || ''}</td>
            <td>$${parseFloat(item.cost).toFixed(2)}</td>
            <td>${parseFloat(item.markup_rate).toFixed(1)}%</td>
            <td>$${parseFloat(item.price).toFixed(2)}</td>
            <td>${item.quantity}</td>
            <td class="usage-cell">${usageString}</td>
            <td class="action-buttons">
                <button onclick="editItem(${item.item_id})" class="edit-btn">Modify</button>
                <button onclick="deleteItem(${item.item_id})" class="remove-item-btn">Delete</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function searchItems() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredItems = [...allItems];
    } else {
        filteredItems = allItems.filter(item => 
            item.item_name.toLowerCase().includes(searchTerm) ||
            (item.item_model && item.item_model.toLowerCase().includes(searchTerm)) ||
            (item.description && item.description.toLowerCase().includes(searchTerm))
        );
    }
    
    // Apply current filter
    filterItems();
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('usageFilter').value = 'all';
    document.getElementById('sortFilter').value = 'name_asc';
    filteredItems = [...allItems];
    renderItems();
}

function filterItems() {
    const usageFilter = document.getElementById('usageFilter').value;
    let itemsToFilter = [...allItems];
    
    // Apply search filter first
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    if (searchTerm !== '') {
        itemsToFilter = itemsToFilter.filter(item => 
            item.item_name.toLowerCase().includes(searchTerm) ||
            (item.item_model && item.item_model.toLowerCase().includes(searchTerm)) ||
            (item.description && item.description.toLowerCase().includes(searchTerm))
        );
    }
    
    // Apply usage filter
    if (usageFilter !== 'all') {
        itemsToFilter = itemsToFilter.filter(item => {
            switch(usageFilter) {
                case 'sell': return item.sell_item;
                case 'repair': return item.repair_item;
                case 'install': return item.install_item;
                default: return true;
            }
        });
    }
    
    filteredItems = itemsToFilter;
    sortItems();
}

function sortItems() {
    const sortBy = document.getElementById('sortFilter').value;
    
    filteredItems.sort((a, b) => {
        switch(sortBy) {
            case 'name_asc':
                return a.item_name.localeCompare(b.item_name);
            case 'name_desc':
                return b.item_name.localeCompare(a.item_name);
            case 'price_asc':
                return parseFloat(a.price) - parseFloat(b.price);
            case 'price_desc':
                return parseFloat(b.price) - parseFloat(a.price);
            case 'quantity_asc':
                return a.quantity - b.quantity;
            case 'quantity_desc':
                return b.quantity - a.quantity;
            default:
                return 0;
        }
    });
    
    renderItems();
}

async function editItem(itemId) {
    try {
        const response = await fetch(`/api/items/${itemId}`);
        if (response.ok) {
            const item = await response.json();
            populateEditForm(item);
            document.getElementById('editModal').style.display = 'block';
        } else {
            showMessage('Error loading item details', true);
        }
    } catch (error) {
        console.error('Error loading item:', error);
        showMessage('Error loading item details', true);
    }
}

function populateEditForm(item) {
    document.getElementById('edit_item_id').value = item.item_id;
    document.getElementById('edit_item_name').value = item.item_name;
    document.getElementById('edit_item_color').value = item.item_color || '';
    document.getElementById('edit_item_model').value = item.item_model || '';
    document.getElementById('edit_description').value = item.description || '';
    document.getElementById('edit_cost').value = item.cost;
    document.getElementById('edit_markup_rate').value = item.markup_rate;
    document.getElementById('edit_price').value = item.price;
    document.getElementById('edit_quantity').value = item.quantity;
    document.getElementById('edit_sell_item').checked = item.sell_item;
    document.getElementById('edit_repair_item').checked = item.repair_item;
    document.getElementById('edit_install_item').checked = item.install_item;
}

function calculateEditPrice() {
    const cost = parseFloat(document.getElementById('edit_cost').value) || 0;
    const markupRate = parseFloat(document.getElementById('edit_markup_rate').value) || 0;
    const price = cost * (1 + markupRate / 100);
    
    if (cost > 0 && markupRate >= 0) {
        document.getElementById('edit_price').value = price.toFixed(2);
    }
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Handle edit form submission
document.getElementById('editForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const itemId = document.getElementById('edit_item_id').value;
    const formData = new FormData(this);
    
    const itemData = {
        item_name: formData.get('item_name'),
        item_color: formData.get('item_color'),
        item_model: formData.get('item_model'),
        description: formData.get('description'),
        cost: parseFloat(formData.get('cost')),
        markup_rate: parseFloat(formData.get('markup_rate')),
        quantity: parseInt(formData.get('quantity')),
        sell_item: formData.get('sell_item') === 'on',
        repair_item: formData.get('repair_item') === 'on',
        install_item: formData.get('install_item') === 'on'
    };

    try {
        const response = await fetch(`/api/items/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(itemData)
        });

        const result = await response.json();

        if (response.ok) {
            showMessage('Item updated successfully!', false);
            closeEditModal();
            loadItems(); // Reload the table
        } else {
            showMessage(result.message || 'Error updating item', true);
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error updating item. Please try again.', true);
    }
});

async function deleteItem(itemId) {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`/api/items/${itemId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
            showMessage('Item deleted successfully!', false);
            loadItems(); // Reload the table
        } else {
            showMessage(result.message || 'Error deleting item', true);
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error deleting item. Please try again.', true);
    }
}

function showMessage(text, isError = false) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = isError ? 'message error-message' : 'message success-message';
    messageDiv.style.display = 'block';
    
    if (!isError) {
        setTimeout(() => {
            hideMessage();
        }, 3000);
    }
}

function hideMessage() {
    document.getElementById('message').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        closeEditModal();
    }
}

// Handle Enter key in search input
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchItems();
    }
});

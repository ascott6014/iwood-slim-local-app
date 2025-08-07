/**
 * Shared utilities for multi-select functionality with checkboxes
 * Handles row selection, select all, and batch operations
 */

/**
 * Global object to track selected items across different pages
 */
window.SelectionManager = {
  selectedItems: new Set(),
  itemType: '', // 'repairs', 'orders', 'installs'
  
  /**
   * Initialize selection manager for a specific item type
   * @param {string} type - The type of items being managed ('repairs', 'orders', 'installs')
   */
  init: function(type) {
    this.itemType = type;
    this.selectedItems.clear();
    this.updateUI();
  },

  /**
   * Toggle selection of an individual item
   * @param {string|number} itemId - The ID of the item to toggle
   * @param {boolean} isChecked - Whether the checkbox is checked
   */
  toggleItem: function(itemId, isChecked) {
    if (isChecked) {
      this.selectedItems.add(itemId.toString());
    } else {
      this.selectedItems.delete(itemId.toString());
    }
    this.updateUI();
    this.updateSelectAllState();
  },

  /**
   * Select or deselect all items
   * @param {boolean} selectAll - Whether to select all items
   */
  toggleAll: function(selectAll) {
    const checkboxes = document.querySelectorAll(`input[type="checkbox"][data-item-id]`);
    
    if (selectAll) {
      checkboxes.forEach(checkbox => {
        checkbox.checked = true;
        this.selectedItems.add(checkbox.dataset.itemId);
      });
    } else {
      checkboxes.forEach(checkbox => {
        checkbox.checked = false;
      });
      this.selectedItems.clear();
    }
    
    this.updateUI();
  },

  /**
   * Update the select all checkbox state based on individual selections
   */
  updateSelectAllState: function() {
    const selectAllCheckbox = document.getElementById(`selectAll${this.itemType.charAt(0).toUpperCase() + this.itemType.slice(1, -1)}s`);
    const allCheckboxes = document.querySelectorAll(`input[type="checkbox"][data-item-id]`);
    const checkedCheckboxes = document.querySelectorAll(`input[type="checkbox"][data-item-id]:checked`);
    
    if (selectAllCheckbox) {
      if (checkedCheckboxes.length === 0) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = false;
      } else if (checkedCheckboxes.length === allCheckboxes.length) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = true;
      } else {
        selectAllCheckbox.indeterminate = true;
        selectAllCheckbox.checked = false;
      }
    }
  },

  /**
   * Update the UI elements (button state, counter)
   */
  updateUI: function() {
    const selectedCount = this.selectedItems.size;
    const printButton = document.getElementById('printSelectedBtn');
    const countSpan = document.getElementById('selectedCount');
    
    if (countSpan) {
      countSpan.textContent = selectedCount;
    }
    
    if (printButton) {
      printButton.disabled = selectedCount === 0;
      printButton.style.opacity = selectedCount === 0 ? '0.5' : '1';
    }
  },

  /**
   * Get all selected item IDs
   * @returns {Array} Array of selected item IDs
   */
  getSelectedItems: function() {
    return Array.from(this.selectedItems);
  },

  /**
   * Clear all selections
   */
  clearSelection: function() {
    this.selectedItems.clear();
    const checkboxes = document.querySelectorAll(`input[type="checkbox"][data-item-id]`);
    checkboxes.forEach(checkbox => {
      checkbox.checked = false;
    });
    this.updateUI();
    this.updateSelectAllState();
  }
};

/**
 * Global function for handling select all toggle
 * @param {string} itemType - The type of items ('repairs', 'orders', 'installs')
 */
function toggleSelectAll(itemType) {
  const selectAllCheckbox = document.getElementById(`selectAll${itemType.charAt(0).toUpperCase() + itemType.slice(1, -1)}s`);
  if (selectAllCheckbox) {
    window.SelectionManager.toggleAll(selectAllCheckbox.checked);
  }
}

/**
 * Global function for handling individual item toggle
 * @param {string|number} itemId - The ID of the item
 * @param {HTMLElement} checkbox - The checkbox element
 */
function toggleItemSelection(itemId, checkbox) {
  window.SelectionManager.toggleItem(itemId, checkbox.checked);
}

/**
 * Add keyboard shortcuts for selection
 */
document.addEventListener('keydown', function(e) {
  // Ctrl+A to select all
  if (e.ctrlKey && e.key === 'a' && !e.target.matches('input, textarea')) {
    e.preventDefault();
    const selectAllCheckbox = document.querySelector('input[type="checkbox"][id^="selectAll"]');
    if (selectAllCheckbox) {
      selectAllCheckbox.checked = true;
      selectAllCheckbox.dispatchEvent(new Event('change'));
    }
  }
  
  // Escape to clear selection
  if (e.key === 'Escape') {
    window.SelectionManager.clearSelection();
  }
});

/**
 * Utility function to add checkboxes to table rows
 * @param {HTMLElement} row - The table row element
 * @param {string|number} itemId - The ID of the item
 * @param {Object} itemData - The item data object
 */
function addCheckboxToRow(row, itemId, itemData) {
  const checkboxCell = document.createElement('td');
  checkboxCell.innerHTML = `
    <input type="checkbox" 
           data-item-id="${itemId}" 
           data-item-data='${JSON.stringify(itemData)}'
           onchange="toggleItemSelection('${itemId}', this)"
           style="transform: scale(1.2); margin: 0;">
  `;
  
  // Insert checkbox as first cell
  row.insertBefore(checkboxCell, row.firstChild);
}

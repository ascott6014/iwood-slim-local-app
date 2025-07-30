// US States dropdown data - formatted as "Code (Full Name)"
const US_STATES = [
    { code: 'AL', name: 'Alabama', display: 'AL (Alabama)' },
    { code: 'AK', name: 'Alaska', display: 'AK (Alaska)' },
    { code: 'AZ', name: 'Arizona', display: 'AZ (Arizona)' },
    { code: 'AR', name: 'Arkansas', display: 'AR (Arkansas)' },
    { code: 'CA', name: 'California', display: 'CA (California)' },
    { code: 'CO', name: 'Colorado', display: 'CO (Colorado)' },
    { code: 'CT', name: 'Connecticut', display: 'CT (Connecticut)' },
    { code: 'DE', name: 'Delaware', display: 'DE (Delaware)' },
    { code: 'FL', name: 'Florida', display: 'FL (Florida)' },
    { code: 'GA', name: 'Georgia', display: 'GA (Georgia)' },
    { code: 'HI', name: 'Hawaii', display: 'HI (Hawaii)' },
    { code: 'ID', name: 'Idaho', display: 'ID (Idaho)' },
    { code: 'IL', name: 'Illinois', display: 'IL (Illinois)' },
    { code: 'IN', name: 'Indiana', display: 'IN (Indiana)' },
    { code: 'IA', name: 'Iowa', display: 'IA (Iowa)' },
    { code: 'KS', name: 'Kansas', display: 'KS (Kansas)' },
    { code: 'KY', name: 'Kentucky', display: 'KY (Kentucky)' },
    { code: 'LA', name: 'Louisiana', display: 'LA (Louisiana)' },
    { code: 'ME', name: 'Maine', display: 'ME (Maine)' },
    { code: 'MD', name: 'Maryland', display: 'MD (Maryland)' },
    { code: 'MA', name: 'Massachusetts', display: 'MA (Massachusetts)' },
    { code: 'MI', name: 'Michigan', display: 'MI (Michigan)' },
    { code: 'MN', name: 'Minnesota', display: 'MN (Minnesota)' },
    { code: 'MS', name: 'Mississippi', display: 'MS (Mississippi)' },
    { code: 'MO', name: 'Missouri', display: 'MO (Missouri)' },
    { code: 'MT', name: 'Montana', display: 'MT (Montana)' },
    { code: 'NE', name: 'Nebraska', display: 'NE (Nebraska)' },
    { code: 'NV', name: 'Nevada', display: 'NV (Nevada)' },
    { code: 'NH', name: 'New Hampshire', display: 'NH (New Hampshire)' },
    { code: 'NJ', name: 'New Jersey', display: 'NJ (New Jersey)' },
    { code: 'NM', name: 'New Mexico', display: 'NM (New Mexico)' },
    { code: 'NY', name: 'New York', display: 'NY (New York)' },
    { code: 'NC', name: 'North Carolina', display: 'NC (North Carolina)' },
    { code: 'ND', name: 'North Dakota', display: 'ND (North Dakota)' },
    { code: 'OH', name: 'Ohio', display: 'OH (Ohio)' },
    { code: 'OK', name: 'Oklahoma', display: 'OK (Oklahoma)' },
    { code: 'OR', name: 'Oregon', display: 'OR (Oregon)' },
    { code: 'PA', name: 'Pennsylvania', display: 'PA (Pennsylvania)' },
    { code: 'RI', name: 'Rhode Island', display: 'RI (Rhode Island)' },
    { code: 'SC', name: 'South Carolina', display: 'SC (South Carolina)' },
    { code: 'SD', name: 'South Dakota', display: 'SD (South Dakota)' },
    { code: 'TN', name: 'Tennessee', display: 'TN (Tennessee)' },
    { code: 'TX', name: 'Texas', display: 'TX (Texas)' },
    { code: 'UT', name: 'Utah', display: 'UT (Utah)' },
    { code: 'VT', name: 'Vermont', display: 'VT (Vermont)' },
    { code: 'VA', name: 'Virginia', display: 'VA (Virginia)' },
    { code: 'WA', name: 'Washington', display: 'WA (Washington)' },
    { code: 'WV', name: 'West Virginia', display: 'WV (West Virginia)' },
    { code: 'WI', name: 'Wisconsin', display: 'WI (Wisconsin)' },
    { code: 'WY', name: 'Wyoming', display: 'WY (Wyoming)' },
    { code: 'DC', name: 'District of Columbia', display: 'DC (District of Columbia)' }
];

/**
 * Populates a select element with US states
 * @param {string} selectElementId - The ID of the select element to populate
 * @param {string} selectedState - Optional: The state code to pre-select (defaults to 'AR' for Arkansas)
 */
function populateStateDropdown(selectElementId, selectedState = 'AR') {
    const selectElement = document.getElementById(selectElementId);
    
    if (!selectElement) {
        console.error(`Select element with ID '${selectElementId}' not found`);
        return;
    }

    // Clear existing options
    selectElement.innerHTML = '';

    // Add state options (no "Select State" option since AR is default)
    US_STATES.forEach(state => {
        const option = document.createElement('option');
        option.value = state.code;
        option.textContent = state.display;
        
        if (state.code === selectedState) {
            option.selected = true;
        }
        
        selectElement.appendChild(option);
    });
}

/**
 * Gets the full state name from a state code
 * @param {string} stateCode - The 2-letter state code
 * @returns {string} The full state name or empty string if not found
 */
function getStateName(stateCode) {
    const state = US_STATES.find(s => s.code === stateCode);
    return state ? state.name : '';
}

/**
 * Gets the display format for a state code
 * @param {string} stateCode - The 2-letter state code
 * @returns {string} The display format "CODE (Full Name)" or empty string if not found
 */
function getStateDisplay(stateCode) {
    const state = US_STATES.find(s => s.code === stateCode);
    return state ? state.display : '';
}

// Make functions available globally
window.populateStateDropdown = populateStateDropdown;
window.getStateName = getStateName;
window.getStateDisplay = getStateDisplay;
window.US_STATES = US_STATES;

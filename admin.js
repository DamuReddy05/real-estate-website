// Admin Panel JavaScript

// Property storage - will be loaded from persistent storage
let properties = [];

// DOM Elements
const propertyUploadForm = document.getElementById('propertyUploadForm');
const propertiesList = document.getElementById('propertiesList');
const searchProperties = document.getElementById('searchProperties');
const filterCategory = document.getElementById('filterCategory');
const filterType = document.getElementById('filterType');

// Stats elements
const totalPropertiesEl = document.getElementById('totalProperties');
const forSaleEl = document.getElementById('forSale');
const forRentEl = document.getElementById('forRent');
const plotsEl = document.getElementById('plots');

// Initialize admin panel
async function initAdmin() {
    await loadProperties();
    updateStats();
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    // Property upload form
    propertyUploadForm.addEventListener('submit', handlePropertyUpload);
    
    // Search and filter
    searchProperties.addEventListener('input', filterProperties);
    filterCategory.addEventListener('change', filterProperties);
    filterType.addEventListener('change', filterProperties);
}

// Handle property upload
async function handlePropertyUpload(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const propertyData = {
        id: Date.now(), // Simple ID generation
        title: formData.get('title'),
        category: formData.get('category'),
        type: formData.get('type'),
        price: formData.get('price'),
        location: formData.get('location'),
        area: formData.get('area'),
        bedrooms: formData.get('bedrooms'),
        bathrooms: formData.get('bathrooms'),
        city: formData.get('city'),
        state: formData.get('state'),
        pincode: formData.get('pincode'),
        description: formData.get('description'),
        amenities: formData.get('amenities'),
        ownerName: formData.get('ownerName'),
        ownerPhone: formData.get('ownerPhone'),
        ownerEmail: formData.get('ownerEmail'),
        image: '🏢', // Default emoji, can be enhanced with file upload
        dateAdded: new Date().toISOString(),
        status: 'active' // Set as active by default
    };
    
    // Validate required fields
    if (!propertyData.title || !propertyData.category || !propertyData.type || 
        !propertyData.price || !propertyData.location || !propertyData.area) {
        showMessage('Please fill in all required fields.', 'error');
        return;
    }
    
    try {
        // Add property to persistent storage
        await storageService.addProperty(propertyData);
        
        // Update UI
        await loadProperties();
        updateStats();
        
        // Show success message
        showMessage('Property uploaded successfully!', 'success');
        
        // Reset form
        e.target.reset();
        
    } catch (error) {
        console.error('Error uploading property:', error);
        showMessage('Error uploading property. Please try again.', 'error');
    }
}

// Load properties from persistent storage
async function loadProperties() {
    try {
        properties = await storageService.getProperties();
        displayProperties(properties);
    } catch (error) {
        console.error('Error loading properties:', error);
        properties = [];
        displayProperties([]);
    }
}

// Display properties in the admin panel
function displayProperties(propertiesToShow) {
    propertiesList.innerHTML = '';
    
    if (propertiesToShow.length === 0) {
        propertiesList.innerHTML = '<p style="text-align: center; color: #64748b; grid-column: 1/-1;">No properties found.</p>';
        return;
    }
    
    propertiesToShow.forEach(property => {
        const propertyItem = createPropertyItem(property);
        propertiesList.appendChild(propertyItem);
    });
}

// Create property item for admin panel
function createPropertyItem(property) {
    const item = document.createElement('div');
    item.className = 'property-item';
    
    item.innerHTML = `
        <div class="property-header">
            <div>
                <h3 class="property-title">${property.title}</h3>
                <p style="color: #64748b; margin-bottom: 0.5rem;">${property.location}</p>
            </div>
            <span class="property-badge">${property.type}</span>
        </div>
        
        <div class="property-details">
            <div class="property-detail">
                <i class="fas fa-tag"></i>
                <span>${property.price}</span>
            </div>
            <div class="property-detail">
                <i class="fas fa-ruler-combined"></i>
                <span>${property.area} sq ft</span>
            </div>
            <div class="property-detail">
                <i class="fas fa-bed"></i>
                <span>${property.bedrooms}</span>
            </div>
            <div class="property-detail">
                <i class="fas fa-bath"></i>
                <span>${property.bathrooms}</span>
            </div>
            <div class="property-detail">
                <i class="fas fa-building"></i>
                <span>${property.category}</span>
            </div>
            <div class="property-detail">
                <i class="fas fa-map-marker-alt"></i>
                <span>${property.city}, ${property.state}</span>
            </div>
        </div>
        
        <div class="property-actions">
            <button class="btn btn-outline" onclick="editProperty(${property.id})">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-primary" onclick="viewProperty(${property.id})">
                <i class="fas fa-eye"></i> View
            </button>
            ${property.status === 'active' ? 
                `<button class="btn btn-outline" onclick="deactivateProperty(${property.id})" style="color: #f59e0b; border-color: #f59e0b;">
                    <i class="fas fa-pause"></i> Deactivate
                </button>` : 
                `<button class="btn btn-outline" onclick="activateProperty(${property.id})" style="color: #059669; border-color: #059669;">
                    <i class="fas fa-play"></i> Activate
                </button>`
            }
            <button class="btn btn-outline" onclick="deleteProperty(${property.id})" style="color: #dc2626; border-color: #dc2626;">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;
    
    return item;
}

// Filter properties based on search and filters
function filterProperties() {
    const searchTerm = searchProperties.value.toLowerCase();
    const categoryFilter = filterCategory.value;
    const typeFilter = filterType.value;
    
    const filtered = properties.filter(property => {
        const matchesSearch = property.title.toLowerCase().includes(searchTerm) ||
                            property.location.toLowerCase().includes(searchTerm) ||
                            property.city.toLowerCase().includes(searchTerm);
        
        const matchesCategory = !categoryFilter || property.category === categoryFilter;
        const matchesType = !typeFilter || property.type === typeFilter;
        
        return matchesSearch && matchesCategory && matchesType;
    });
    
    displayProperties(filtered);
}

// Update statistics
function updateStats() {
    totalPropertiesEl.textContent = properties.length;
    forSaleEl.textContent = properties.filter(p => p.type === 'For Sale').length;
    forRentEl.textContent = properties.filter(p => p.type === 'For Rent').length;
    plotsEl.textContent = properties.filter(p => p.category === 'plot').length;
}

// Show message
function showMessage(message, type = 'success') {
    // Remove existing messages
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.textContent = message;
    
    // Insert at the top of the upload section
    const uploadSection = document.querySelector('.upload-section');
    uploadSection.insertBefore(messageEl, uploadSection.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.remove();
        }
    }, 5000);
}

// Edit property
function editProperty(id) {
    const property = properties.find(p => p.id === id);
    if (!property) return;
    
    // Populate form with property data
    document.getElementById('propertyTitle').value = property.title;
    document.getElementById('propertyCategory').value = property.category;
    document.getElementById('propertyType').value = property.type;
    document.getElementById('propertyPrice').value = property.price;
    document.getElementById('propertyLocation').value = property.location;
    document.getElementById('propertyArea').value = property.area;
    document.getElementById('propertyBedrooms').value = property.bedrooms;
    document.getElementById('propertyBathrooms').value = property.bathrooms;
    document.getElementById('propertyCity').value = property.city;
    document.getElementById('propertyState').value = property.state;
    document.getElementById('propertyPincode').value = property.pincode;
    document.getElementById('propertyDescription').value = property.description || '';
    document.getElementById('propertyAmenities').value = property.amenities || '';
    document.getElementById('ownerName').value = property.ownerName || '';
    document.getElementById('ownerPhone').value = property.ownerPhone || '';
    document.getElementById('ownerEmail').value = property.ownerEmail || '';
    
    // Change form submission to update instead of create
    propertyUploadForm.dataset.editId = id;
    document.querySelector('.form-actions .btn-primary').innerHTML = '<i class="fas fa-save"></i> Update Property';
    
    // Scroll to form
    document.querySelector('.upload-section').scrollIntoView({ behavior: 'smooth' });
}

// View property details
function viewProperty(id) {
    const property = properties.find(p => p.id === id);
    if (!property) return;
    
    const details = `
Property Details:
- Title: ${property.title}
- Category: ${property.category}
- Type: ${property.type}
- Price: ${property.price}
- Location: ${property.location}
- Area: ${property.area} sq ft
- Bedrooms: ${property.bedrooms}
- Bathrooms: ${property.bathrooms}
- City: ${property.city}
- State: ${property.state}
- Pincode: ${property.pincode}
- Description: ${property.description || 'N/A'}
- Amenities: ${property.amenities || 'N/A'}
- Owner Name: ${property.ownerName || 'N/A'}
- Owner Phone: ${property.ownerPhone || 'N/A'}
- Owner Email: ${property.ownerEmail || 'N/A'}
- Date Added: ${new Date(property.dateAdded).toLocaleDateString()}
    `;
    
    alert(details);
}

// Delete property
async function deleteProperty(id) {
    if (!confirm('Are you sure you want to delete this property?')) return;
    
    try {
        await storageService.deleteProperty(id);
        await loadProperties();
        updateStats();
        showMessage('Property deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting property:', error);
        showMessage('Error deleting property. Please try again.', 'error');
    }
}

// Deactivate property
async function deactivateProperty(id) {
    if (!confirm('Are you sure you want to deactivate this property? It will not be visible to users.')) return;
    
    try {
        await storageService.deactivateProperty(id);
        await loadProperties();
        updateStats();
        showMessage('Property deactivated successfully!', 'success');
    } catch (error) {
        console.error('Error deactivating property:', error);
        showMessage('Error deactivating property. Please try again.', 'error');
    }
}

// Activate property
async function activateProperty(id) {
    try {
        await storageService.updateProperty(id, { 
            status: 'active',
            activatedAt: new Date().toISOString()
        });
        await loadProperties();
        updateStats();
        showMessage('Property activated successfully!', 'success');
    } catch (error) {
        console.error('Error activating property:', error);
        showMessage('Error activating property. Please try again.', 'error');
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminLoginTime');
        window.location.href = 'index.html';
    }
}

// Check authentication
function checkAuth() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (!isLoggedIn) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        initAdmin();
        console.log('Admin panel loaded successfully!');
    }
});

// Export properties for main website
function exportProperties() {
    return properties;
}

// Make properties available globally for main website
window.adminProperties = properties; 
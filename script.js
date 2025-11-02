// Property data - will be loaded from persistent storage
let properties = [];

// Sample data for initial setup (will be replaced by persistent storage)
const sampleProperties = [
    {
        id: 1,
        title: "Luxury 3BHK Apartment",
        location: "Bandra West, Mumbai",
        price: "₹2.5 Cr",
        type: "For Sale",
        category: "flat",
        bedrooms: 3,
        bathrooms: 2,
        area: "1500 sq ft",
        image: "🏢",
        city: "Mumbai",
        state: "Maharashtra",
        status: "active",
        dateAdded: new Date().toISOString()
    },
    {
        id: 2,
        title: "Modern 2BHK Flat",
        location: "Andheri East, Mumbai",
        price: "₹1.8 Cr",
        type: "For Sale",
        category: "flat",
        bedrooms: 2,
        bathrooms: 2,
        area: "1200 sq ft",
        image: "🏢",
        city: "Mumbai",
        state: "Maharashtra",
        status: "active",
        dateAdded: new Date().toISOString()
    },
    {
        id: 3,
        title: "Premium 1BHK Rental",
        location: "Powai, Mumbai",
        price: "₹45,000/month",
        type: "For Rent",
        category: "flat",
        bedrooms: 1,
        bathrooms: 1,
        area: "800 sq ft",
        image: "🏢",
        city: "Mumbai",
        state: "Maharashtra",
        status: "active",
        dateAdded: new Date().toISOString()
    },
    {
        id: 4,
        title: "Residential Plot",
        location: "Thane, Maharashtra",
        price: "₹1.2 Cr",
        type: "For Sale",
        category: "plot",
        bedrooms: "N/A",
        bathrooms: "N/A",
        area: "2000 sq ft",
        image: "🏞️",
        city: "Thane",
        state: "Maharashtra",
        status: "active",
        dateAdded: new Date().toISOString()
    },
    {
        id: 5,
        title: "Spacious 4BHK Villa",
        location: "Lonavala, Maharashtra",
        price: "₹4.5 Cr",
        type: "For Sale",
        category: "house",
        bedrooms: 4,
        bathrooms: 3,
        area: "3000 sq ft",
        image: "🏡",
        city: "Lonavala",
        state: "Maharashtra",
        status: "active",
        dateAdded: new Date().toISOString()
    },
    {
        id: 6,
        title: "Studio Apartment",
        location: "Worli, Mumbai",
        price: "₹25,000/month",
        type: "For Rent",
        category: "flat",
        bedrooms: 1,
        bathrooms: 1,
        area: "500 sq ft",
        image: "🏢",
        city: "Mumbai",
        state: "Maharashtra",
        status: "active",
        dateAdded: new Date().toISOString()
    }
];

// DOM Elements
const propertyGrid = document.getElementById('propertyGrid');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const searchInput = document.querySelector('.search-box input');
const searchBtn = document.querySelector('.search-btn');
const contactForm = document.querySelector('.contact-form');

// Load properties from persistent storage
async function loadProperties(propertiesToShow = null) {
    try {
        // Show loading state
        propertyGrid.innerHTML = '<div style="text-align: center; padding: 2rem;"><div class="loading"></div><p>Loading properties...</p></div>';
        
        if (propertiesToShow) {
            // Use provided properties (for search results)
            displayProperties(propertiesToShow);
        } else {
            // Load from persistent storage
            const activeProperties = await storageService.getActiveProperties();
            if (activeProperties.length === 0) {
                // If no properties in storage, use sample data
                await storageService.saveProperties(sampleProperties);
                displayProperties(sampleProperties);
            } else {
                displayProperties(activeProperties);
            }
        }
    } catch (error) {
        console.error('Error loading properties:', error);
        // Fallback to sample data
        displayProperties(sampleProperties);
    }
}

// Display properties in the grid
function displayProperties(propertiesToShow) {
    propertyGrid.innerHTML = '';
    
    if (propertiesToShow.length === 0) {
        propertyGrid.innerHTML = '<div style="text-align: center; padding: 2rem; color: #64748b;">No properties found.</div>';
        return;
    }
    
    propertiesToShow.forEach(property => {
        const propertyCard = createPropertyCard(property);
        propertyGrid.appendChild(propertyCard);
    });
}

// Create property card
function createPropertyCard(property) {
    const card = document.createElement('div');
    card.className = 'property-card';
    
    card.innerHTML = `
        <div class="property-image">
            <span style="font-size: 3rem;">${property.image}</span>
            <div class="property-badge">${property.type}</div>
        </div>
        <div class="property-info">
            <h3 class="property-title">${property.title}</h3>
            <p class="property-location">
                <i class="fas fa-map-marker-alt"></i>
                ${property.location}
            </p>
            <div class="property-details">
                <span><i class="fas fa-bed"></i> ${property.bedrooms}</span>
                <span><i class="fas fa-bath"></i> ${property.bathrooms}</span>
                <span><i class="fas fa-ruler-combined"></i> ${property.area}</span>
            </div>
            <div class="property-price">${property.price}</div>
            <div class="property-actions">
                <button class="btn btn-outline">View Details</button>
                <button class="btn btn-primary">Contact Owner</button>
            </div>
        </div>
    `;
    
    return card;
}

// Enhanced search functionality
async function searchProperties() {
    const searchTerm = searchInput.value.toLowerCase();
    const propertyTypeFilter = document.querySelector('.search-filters select:first-child').value;
    const budgetFilter = document.querySelector('.search-filters select:last-child').value;
    
    try {
        // Build filters object
        const filters = {};
        
        if (propertyTypeFilter && propertyTypeFilter !== 'Property Type') {
            if (propertyTypeFilter === 'Flats') filters.category = 'flat';
            else if (propertyTypeFilter === 'Plots') filters.category = 'plot';
            else if (propertyTypeFilter === 'Houses') filters.category = 'house';
        }
        
        if (budgetFilter && budgetFilter !== 'Budget') {
            // Parse budget filter (you can enhance this)
            if (budgetFilter === 'Under ₹50L') {
                filters.maxPrice = 5000000;
            } else if (budgetFilter === '₹50L - ₹1Cr') {
                filters.minPrice = 5000000;
                filters.maxPrice = 10000000;
            } else if (budgetFilter === '₹1Cr - ₹2Cr') {
                filters.minPrice = 10000000;
                filters.maxPrice = 20000000;
            } else if (budgetFilter === 'Above ₹2Cr') {
                filters.minPrice = 20000000;
            }
        }
        
        // Search using storage service
        const searchResults = await storageService.searchProperties(searchTerm, filters);
        displayProperties(searchResults);
        
    } catch (error) {
        console.error('Error searching properties:', error);
        // Fallback to local search
        const activeProperties = await storageService.getActiveProperties();
        const filteredProperties = activeProperties.filter(property => {
            const matchesSearch = property.title.toLowerCase().includes(searchTerm) ||
                                property.location.toLowerCase().includes(searchTerm) ||
                                property.city.toLowerCase().includes(searchTerm) ||
                                property.type.toLowerCase().includes(searchTerm) ||
                                property.category.toLowerCase().includes(searchTerm);
            
            return matchesSearch;
        });
        displayProperties(filteredProperties);
    }
}

// Mobile menu toggle
function toggleMobileMenu() {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
}

// Smooth scrolling for navigation links
function smoothScroll(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetSection = document.querySelector(targetId);
    
    if (targetSection) {
        targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Contact form submission
function handleContactForm(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get('name') || e.target.querySelector('input[type="text"]').value;
    const email = formData.get('email') || e.target.querySelector('input[type="email"]').value;
    const phone = formData.get('phone') || e.target.querySelector('input[type="tel"]').value;
    const message = formData.get('message') || e.target.querySelector('textarea').value;
    
    // Simulate form submission
    alert(`Thank you ${name}! We'll get back to you at ${email} or ${phone} soon.`);
    e.target.reset();
}

// Initialize the website
async function init() {
    // Load initial properties from persistent storage
    await loadProperties();
    
    // Event listeners
    hamburger.addEventListener('click', toggleMobileMenu);
    searchBtn.addEventListener('click', searchProperties);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchProperties();
        }
    });
    
    // Navigation smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', smoothScroll);
    });
    
    // Contact form
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
    
    // Add scroll effect to header
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.background = '#fff';
            header.style.backdropFilter = 'none';
        }
    });
    
    // Add loading animation to property cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe property cards
    document.querySelectorAll('.property-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Category card interactions
function addCategoryInteractions() {
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.querySelector('h3').textContent;
            alert(`You clicked on ${category}. This would filter properties by category.`);
        });
    });
}

// Property card interactions
function addPropertyInteractions() {
    document.addEventListener('click', (e) => {
        if (e.target.textContent === 'View Details') {
            const card = e.target.closest('.property-card');
            const title = card.querySelector('.property-title').textContent;
            alert(`Viewing details for: ${title}`);
        }
        
        if (e.target.textContent === 'Contact Owner') {
            const card = e.target.closest('.property-card');
            const title = card.querySelector('.property-title').textContent;
            alert(`Contacting owner for: ${title}\nPhone: +91 98765 43210\nEmail: owner@example.com`);
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
    addCategoryInteractions();
    addPropertyInteractions();
    
    // Add some dynamic content
    console.log('RealEstateHub website loaded successfully!');
    
    // Simulate loading more properties
    setTimeout(() => {
        console.log('Website ready for real estate transactions!');
    }, 1000);
});

// Add some utility functions
const utils = {
    formatPrice: (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(price);
    },
    
    formatArea: (area) => {
        return `${area} sq ft`;
    },
    
    getPropertyType: (property) => {
        if (property.bedrooms === 'N/A') return 'Plot';
        if (property.bedrooms <= 1) return 'Studio/1BHK';
        if (property.bedrooms <= 2) return '2BHK';
        if (property.bedrooms <= 3) return '3BHK';
        return '4BHK+';
    }
}; 
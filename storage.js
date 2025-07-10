// Storage Service for RealEstateHub
// Handles persistent data storage using JSONBin.io (free)

class StorageService {
    constructor() {
        this.apiKey = '$2a$10$WrFL7WkIn3r6U6qlWoaHLum1QQr1QeuXKJlOoAWmwbuPgrCeMpNM2'; // Replace with your API key
        this.binId = null;
        this.baseUrl = 'https://api.jsonbin.io/v3/b';
        this.init();
    }

    async init() {
        // Try to get existing bin ID from localStorage
        this.binId = localStorage.getItem('realEstateBinId');
        
        if (!this.binId) {
            // Create new bin if none exists
            await this.createBin();
        }
    }

    async createBin() {
        try {
            const initialData = {
                properties: [],
                lastUpdated: new Date().toISOString()
            };

            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.apiKey
                },
                body: JSON.stringify(initialData)
            });

            if (response.ok) {
                const result = await response.json();
                this.binId = result.metadata.id;
                localStorage.setItem('realEstateBinId', this.binId);
                console.log('Created new JSONBin:', this.binId);
            } else {
                throw new Error('Failed to create JSONBin');
            }
        } catch (error) {
            console.error('Error creating JSONBin:', error);
            // Fallback to localStorage
            this.useLocalStorage();
        }
    }

    async getProperties() {
        try {
            if (!this.binId) {
                return this.getLocalProperties();
            }

            const response = await fetch(`${this.baseUrl}/${this.binId}`, {
                headers: {
                    'X-Master-Key': this.apiKey
                }
            });

            if (response.ok) {
                const data = await response.json();
                return data.record.properties || [];
            } else {
                throw new Error('Failed to fetch properties');
            }
        } catch (error) {
            console.error('Error fetching properties:', error);
            return this.getLocalProperties();
        }
    }

    async saveProperties(properties) {
        try {
            if (!this.binId) {
                return this.saveLocalProperties(properties);
            }

            const data = {
                properties: properties,
                lastUpdated: new Date().toISOString()
            };

            const response = await fetch(`${this.baseUrl}/${this.binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.apiKey
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                console.log('Properties saved to cloud storage');
                return true;
            } else {
                throw new Error('Failed to save properties');
            }
        } catch (error) {
            console.error('Error saving properties:', error);
            return this.saveLocalProperties(properties);
        }
    }

    async addProperty(property) {
        const properties = await this.getProperties();
        properties.push(property);
        return await this.saveProperties(properties);
    }

    async updateProperty(propertyId, updatedProperty) {
        const properties = await this.getProperties();
        const index = properties.findIndex(p => p.id === propertyId);
        
        if (index !== -1) {
            properties[index] = { ...properties[index], ...updatedProperty };
            return await this.saveProperties(properties);
        }
        return false;
    }

    async deleteProperty(propertyId) {
        const properties = await this.getProperties();
        const filteredProperties = properties.filter(p => p.id !== propertyId);
        return await this.saveProperties(filteredProperties);
    }

    async deactivateProperty(propertyId) {
        return await this.updateProperty(propertyId, { 
            status: 'inactive',
            deactivatedAt: new Date().toISOString()
        });
    }

    // Local storage fallback methods
    getLocalProperties() {
        const stored = localStorage.getItem('realEstateProperties');
        return stored ? JSON.parse(stored) : [];
    }

    saveLocalProperties(properties) {
        localStorage.setItem('realEstateProperties', JSON.stringify(properties));
        return true;
    }

    useLocalStorage() {
        console.log('Falling back to localStorage');
        this.binId = null;
    }

    // Get active properties only
    async getActiveProperties() {
        const properties = await this.getProperties();
        return properties.filter(p => p.status !== 'inactive');
    }

    // Get properties by status
    async getPropertiesByStatus(status) {
        const properties = await this.getProperties();
        return properties.filter(p => p.status === status);
    }

    // Search properties
    async searchProperties(query, filters = {}) {
        const properties = await this.getActiveProperties();
        
        return properties.filter(property => {
            // Text search
            const searchMatch = !query || 
                property.title.toLowerCase().includes(query.toLowerCase()) ||
                property.location.toLowerCase().includes(query.toLowerCase()) ||
                property.city.toLowerCase().includes(query.toLowerCase()) ||
                property.type.toLowerCase().includes(query.toLowerCase());

            // Category filter
            const categoryMatch = !filters.category || 
                property.category === filters.category;

            // Type filter
            const typeMatch = !filters.type || 
                property.type === filters.type;

            // Price range filter
            const priceMatch = !filters.minPrice || !filters.maxPrice ||
                this.isPriceInRange(property.price, filters.minPrice, filters.maxPrice);

            return searchMatch && categoryMatch && typeMatch && priceMatch;
        });
    }

    // Helper method to check if price is in range
    isPriceInRange(priceStr, minPrice, maxPrice) {
        // Extract numeric value from price string (e.g., "₹2.5 Cr" -> 25000000)
        const numericPrice = this.extractNumericPrice(priceStr);
        
        if (numericPrice === null) return true; // Skip price filtering if can't parse
        
        return (!minPrice || numericPrice >= minPrice) && 
               (!maxPrice || numericPrice <= maxPrice);
    }

    // Helper method to extract numeric price
    extractNumericPrice(priceStr) {
        if (!priceStr) return null;
        
        // Handle different price formats
        const price = priceStr.toLowerCase();
        
        if (price.includes('cr') || price.includes('crore')) {
            const num = parseFloat(price.replace(/[^\d.]/g, ''));
            return num * 10000000; // Convert to rupees
        }
        
        if (price.includes('l') || price.includes('lakh')) {
            const num = parseFloat(price.replace(/[^\d.]/g, ''));
            return num * 100000; // Convert to rupees
        }
        
        if (price.includes('k') || price.includes('thousand')) {
            const num = parseFloat(price.replace(/[^\d.]/g, ''));
            return num * 1000; // Convert to rupees
        }
        
        // Try to extract any number
        const num = parseFloat(price.replace(/[^\d.]/g, ''));
        return isNaN(num) ? null : num;
    }
}

// Create global instance
const storageService = new StorageService();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageService;
} 
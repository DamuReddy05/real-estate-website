// Configuration for RealEstateHub
const CONFIG = {
    // JSONBin.io Configuration (Free JSON storage)
    JSONBIN_API_KEY: 'YOUR_JSONBIN_API_KEY', // Get from https://jsonbin.io
    JSONBIN_BIN_ID: 'YOUR_BIN_ID', // Will be created automatically
    
    // Firebase Configuration (Alternative)
    FIREBASE_CONFIG: {
        apiKey: "YOUR_FIREBASE_API_KEY",
        authDomain: "your-project.firebaseapp.com",
        projectId: "your-project-id",
        storageBucket: "your-project.appspot.com",
        messagingSenderId: "123456789",
        appId: "your-app-id"
    },
    
    // Storage Type: 'jsonbin', 'firebase', or 'localstorage'
    STORAGE_TYPE: 'jsonbin',
    
    // API Endpoints
    API_ENDPOINTS: {
        JSONBIN: 'https://api.jsonbin.io/v3/b',
        FIREBASE: 'https://your-project.firebaseapp.com'
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} 
import axios from 'axios';

// Get API base URL dynamically at runtime
const getApiBaseUrl = () => {
    // Check environment variable first
    if (import.meta.env. VITE_API_BASE_URL) {
        return import.meta.env. VITE_API_BASE_URL;
    }

    // Use same hostname that user accessed frontend with, but port 8080
    // This runs at runtime, not build time
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        return `http://${hostname}:8080`;
    }

    // Fallback for SSR or non-browser environments
    return 'http://localhost:8080';
};

// Function to get fresh API_BASE each time (for components)
export const getApiBase = () => getApiBaseUrl();

// For backward compatibility (but this is set once at module load)
export const API_BASE = getApiBaseUrl();

// Create axios instance
export const httpClient = axios.create({
    timeout: 30000,
});

// Store for unauthorized handler
let unauthorizedHandler = null;

// Function to set unauthorized handler (called from App.jsx)
export const setUnauthorizedHandler = (handler) => {
    unauthorizedHandler = handler;
};

// Request interceptor
httpClient.interceptors.request.use(
    (config) => {
        // Set baseURL dynamically on EVERY request
        config.baseURL = getApiBaseUrl();

        // Add auth token if exists
        const token = localStorage.getItem('basicToken');
        if (token) {
            config.headers.Authorization = `Basic ${token}`;
        }

        // Debug log
        console.log(`[API] ${config.method?. toUpperCase()} ${config.baseURL}${config.url}`);

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
httpClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error(`[API] Error: `, error.message);

        if (error.response?. status === 401) {
            // Clear stored credentials
            localStorage.removeItem('basicToken');
            localStorage.removeItem('user');

            // Call unauthorized handler if set
            if (unauthorizedHandler) {
                unauthorizedHandler();
            }
        }

        return Promise.reject(error);
    }
);
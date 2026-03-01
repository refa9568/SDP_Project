// ParadeOps API Configuration
// This file centralizes all API endpoints for the frontend

// ⚠️ IMPORTANT: Replace 'https://paradeops-backend-XXXX.onrender.com' 
// with your ACTUAL Render backend URL after deployment

// Backend API Base URL
const API_BASE = 'https://paradeops-backend-XXXX.onrender.com'; 

// For local development, uncomment this line:
// const API_BASE = 'http://localhost:5000';

// API Endpoints Configuration
const API_ENDPOINTS = {
    // Authentication endpoints
    LOGIN: `${API_BASE}/api/auth/login`,
    LOGOUT: `${API_BASE}/api/auth/logout`,
    REGISTER: `${API_BASE}/api/auth/register`,
    CHANGE_PASSWORD: `${API_BASE}/api/auth/change-password`,
    VERIFY_TOKEN: `${API_BASE}/api/auth/verify`,
    
    // User management endpoints
    USERS: `${API_BASE}/api/users`,
    CURRENT_USER: `${API_BASE}/api/users/me`,
    USER_BY_ID: (id) => `${API_BASE}/api/users/${id}`,
    
    // Leave management endpoints
    LEAVES: `${API_BASE}/api/leaves`,
    LEAVE_TYPES: `${API_BASE}/api/leaves/types`,
    LEAVE_BALANCE: (userId) => `${API_BASE}/api/leaves/balance/${userId}`,
    APPROVE_LEAVE: (id) => `${API_BASE}/api/leaves/${id}/approve`,
    REJECT_LEAVE: (id) => `${API_BASE}/api/leaves/${id}/reject`,
    
    // Attendance management endpoints
    ATTENDANCE: `${API_BASE}/api/attendance`,
    ATTENDANCE_INIT: `${API_BASE}/api/attendance/init-date`,
    ATTENDANCE_MARK: `${API_BASE}/api/attendance/mark`,
    ATTENDANCE_SUMMARY: `${API_BASE}/api/attendance/summary`
};

// Helper function to get JWT token from localStorage
function getAuthToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
}

// Helper function to make authenticated API calls
async function apiCall(url, options = {}) {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
        ...options,
        headers
    });
    
    if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        window.location.href = '/login.html';
    }
    
    return response;
}

const axios = require('axios');

const API_BASE_URL = 'http://20.207.122.201/evaluation-service';

// The token provided by the user
let currentToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJyaWRoaW1hZ2FyZzIzMDFAZ21haWwuY29tIiwiZXhwIjoxNzc3ODc0ODcyLCJpYXQiOjE3Nzc4NzM5NzIsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiJmNTBjNWQ0Mi05YWIyLTQ4NWItOWU4Yi1mM2VmNjU0NTliN2UiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJyaWRoaW1hIGdhcmciLCJzdWIiOiJlMmQ2ZDQ3MC1kOGE3LTQzM2ItOWZjOC02YzEzMDMxOWU3YmYifSwiZW1haWwiOiJyaWRoaW1hZ2FyZzIzMDFAZ21haWwuY29tIiwibmFtZSI6InJpZGhpbWEgZ2FyZyIsInJvbGxObyI6IjE4MTQ3IiwiYWNjZXNzQ29kZSI6InVrc2RXVCIsImNsaWVudElEIjoiZTJkNmQ0NzAtZDhhNy00MzNiLTlmYzgtNmMxMzAzMTllN2JmIiwiY2xpZW50U2VjcmV0IjoiSERGdWFzcmF6SHRNbWV3RSJ9.TcqmD-gcoCingeaMdt-7TnjmzPDNxp8uVq9xdMIKpzA";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor (Middleware) to automatically attach the Bearer token
apiClient.interceptors.request.use(
    (config) => {
        if (currentToken) {
            config.headers['Authorization'] = `Bearer ${currentToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor to handle token expiry / 401 globally
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            console.error('[API Middleware] Unauthorized error. Token might be expired or invalid.');
            // Implement token refresh logic here if the session was active
            // e.g. call /auth with clientID and clientSecret to get a new token
            // Since the evaluation session has ended, we just log it for now.
        }
        return Promise.reject(error);
    }
);

module.exports = apiClient;

// API Configuration
const API_BASE_URL = '';

// Utility Functions
function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function removeToken() {
    localStorage.removeItem('token');
}

function showAlert(message, type = 'info') {
    const container = document.getElementById('alert-container');
    if (!container) return;

    const alert = document.createElement('div');
    alert.className = `alert alert-${type} fade-in`;
    alert.textContent = message;

    container.innerHTML = '';
    container.appendChild(alert);

    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Authentication Functions
async function register(email, username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Registration failed');
        }

        return data;
    } catch (error) {
        throw error;
    }
}

async function login(username, password) {
    try {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Login failed');
        }

        return data;
    } catch (error) {
        throw error;
    }
}

async function getCurrentUser() {
    try {
        const token = getToken();
        if (!token) {
            throw new Error('No token found');
        }

        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Failed to get user info');
        }

        return data;
    } catch (error) {
        throw error;
    }
}

function logout() {
    removeToken();
    window.location.href = 'login.html';
}

// Check authentication
function requireAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Handle Login Form
if (document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const data = await login(username, password);
            setToken(data.access_token);
            window.location.href = 'dashboard.html';
        } catch (error) {
            showAlert(error.message, 'danger');
        }
    });
}

// Handle Register Form
if (document.getElementById('register-form')) {
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            await register(email, username, password);
            showAlert('Account created successfully! Logging in...', 'success');

            // Auto-login after registration
            setTimeout(async () => {
                const data = await login(username, password);
                setToken(data.access_token);
                window.location.href = 'dashboard.html';
            }, 1000);
        } catch (error) {
            showAlert(error.message, 'danger');
        }
    });
}

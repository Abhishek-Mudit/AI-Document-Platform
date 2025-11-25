// API Configuration
const API_BASE_URL = 'http://localhost:8000';

// Utility Functions
function getToken() {
    return localStorage.getItem('token');
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

function logout() {
    removeToken();
    window.location.href = 'login.html';
}

// Check authentication
const token = getToken();
if (!token) {
    window.location.href = 'login.html';
}

// API Functions
async function fetchProjects() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/projects/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Failed to fetch projects');
        }

        return data;
    } catch (error) {
        throw error;
    }
}

async function createProject(topic, type) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/projects/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ topic, type }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Failed to create project');
        }

        return data;
    } catch (error) {
        throw error;
    }
}

async function deleteProject(projectId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok && response.status !== 204) {
            const data = await response.json();
            throw new Error(data.detail || 'Failed to delete project');
        }

        return true;
    } catch (error) {
        throw error;
    }
}

async function getCurrentUser() {
    try {
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

// UI Functions
function renderProjects(projects) {
    const grid = document.getElementById('projects-grid');
    const emptyState = document.getElementById('empty-state');

    if (projects.length === 0) {
        grid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    grid.classList.remove('hidden');
    emptyState.classList.add('hidden');

    grid.innerHTML = projects.map(project => `
        <div class="card project-card fade-in" onclick="openProject(${project.id})">
            <div class="project-card-actions">
                <button onclick="event.stopPropagation(); confirmDelete(${project.id})" 
                        class="btn btn-danger btn-sm">
                    🗑️
                </button>
            </div>
            
            <h3>${project.topic}</h3>
            <div class="flex gap-2 items-center mb-2">
                <span class="badge ${project.type === 'docx' ? 'badge-primary' : 'badge-success'}">
                    ${project.type === 'docx' ? '📄 Word' : '📊 PowerPoint'}
                </span>
            </div>
            
            <p class="text-muted text-small">
                Created: ${new Date(project.created_at).toLocaleDateString()}
            </p>
            
            ${project.generated_content ?
            '<p class="text-small" style="color: var(--success); margin-top: 0.5rem;">✓ Content Generated</p>' :
            '<p class="text-small text-muted" style="margin-top: 0.5rem;">⚠ Not yet generated</p>'
        }
        </div>
    `).join('');
}

function openProject(projectId) {
    window.location.href = `project.html?id=${projectId}`;
}

function confirmDelete(projectId) {
    if (confirm('Are you sure you want to delete this project?')) {
        handleDeleteProject(projectId);
    }
}

async function handleDeleteProject(projectId) {
    try {
        await deleteProject(projectId);
        showAlert('Project deleted successfully', 'success');
        loadProjects();
    } catch (error) {
        showAlert(error.message, 'danger');
    }
}

// Modal Functions
function showNewProjectModal() {
    document.getElementById('new-project-modal').classList.remove('hidden');
}

function hideNewProjectModal() {
    document.getElementById('new-project-modal').classList.add('hidden');
    document.getElementById('new-project-form').reset();
}

// Load Projects
async function loadProjects() {
    try {
        const projects = await fetchProjects();
        renderProjects(projects);
    } catch (error) {
        showAlert(error.message, 'danger');
        if (error.message.includes('credentials')) {
            logout();
        }
    }
}

// Load User Info
async function loadUserInfo() {
    try {
        const user = await getCurrentUser();
        document.getElementById('user-info').textContent = `Welcome, ${user.username}`;
    } catch (error) {
        console.error('Failed to load user info:', error);
    }
}

// Handle New Project Form
document.getElementById('new-project-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const topic = document.getElementById('project-topic').value;
    const type = document.getElementById('project-type').value;

    try {
        const project = await createProject(topic, type);
        hideNewProjectModal();
        showAlert('Project created successfully!', 'success');

        // Redirect to project page
        setTimeout(() => {
            window.location.href = `project.html?id=${project.id}`;
        }, 1000);
    } catch (error) {
        showAlert(error.message, 'danger');
    }
});

// Initialize
loadProjects();
loadUserInfo();

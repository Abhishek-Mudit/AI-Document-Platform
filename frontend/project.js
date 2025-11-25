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

// Get project ID from URL
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('id');

if (!projectId) {
    window.location.href = 'dashboard.html';
}

let currentProject = null;

// API Functions
async function fetchProject(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Failed to fetch project');
        }

        return data;
    } catch (error) {
        throw error;
    }
}

async function updateProject(id, updates) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Failed to update project');
        }

        return data;
    } catch (error) {
        throw error;
    }
}

async function suggestOutlineAPI(topic, type) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/ai/suggest-outline`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ topic, type }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Failed to suggest outline');
        }

        return data.outline;
    } catch (error) {
        throw error;
    }
}

async function generateContentAPI(projectId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/ai/generate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ project_id: projectId }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Failed to generate content');
        }

        return data;
    } catch (error) {
        throw error;
    }
}

async function refineContentAPI(projectId, sectionIndex, refinementPrompt, feedback, comment) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/ai/refine`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                project_id: projectId,
                section_index: sectionIndex,
                refinement_prompt: refinementPrompt,
                feedback,
                comment,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Failed to refine content');
        }

        return data;
    } catch (error) {
        throw error;
    }
}

// UI Functions
function renderProjectHeader(project) {
    document.getElementById('project-title').textContent = project.topic;
    document.getElementById('project-type-badge').textContent =
        project.type === 'docx' ? '📄 Word Document' : '📊 PowerPoint';
    document.getElementById('project-date').textContent =
        `Created: ${new Date(project.created_at).toLocaleDateString()}`;
}

function renderOutline(outline) {
    const container = document.getElementById('outline-list');

    if (!outline || outline.length === 0) {
        container.innerHTML = '<p class="text-muted">No sections added yet. Click "Add Section" to start.</p>';
        return;
    }

    container.innerHTML = outline.map((section, index) => `
        <div class="outline-item">
            <span style="color: var(--text-tertiary); font-weight: 600;">${index + 1}.</span>
            <input type="text" value="${section}" 
                   onchange="updateSection(${index}, this.value)"
                   class="outline-input">
            <button onclick="removeSection(${index})" class="btn btn-danger btn-sm">
                🗑️
            </button>
        </div>
    `).join('');
}

function renderContent(sections) {
    const container = document.getElementById('content-list');

    if (!sections || sections.length === 0) {
        return;
    }

    container.innerHTML = sections.map((section, index) => `
        <div class="content-item fade-in">
            <h3>${section.title}</h3>
            <div class="content-text">${section.content}</div>
            
            <div class="notes-section mt-3 mb-2">
                <label class="form-label text-small" style="margin-bottom: 0.25rem;">📝 Personal Notes</label>
                <textarea 
                    id="note-input-${index}" 
                    class="form-textarea" 
                    style="min-height: 60px; font-size: 0.9rem; padding: 0.5rem;"
                    placeholder="Add your notes here..."
                    onchange="saveNote(${index})">${section.note || ''}</textarea>
            </div>
            
            <div class="refinement-controls">
                <input type="text" 
                       id="refine-input-${index}" 
                       class="form-input refinement-input" 
                       placeholder="Enter refinement instructions...">
                <button onclick="refineSection(${index})" class="btn btn-primary btn-sm">
                    ✨ Refine
                </button>
                <button onclick="likeSection(${index})" 
                        class="btn btn-sm ${section.feedback === 'like' ? 'btn-success' : 'btn-outline-success'}"
                        ${section.feedback === 'like' ? 'disabled' : ''}>
                    ${section.feedback === 'like' ? '👍 Liked' : '👍'}
                </button>
                <button onclick="dislikeSection(${index})" 
                        class="btn btn-sm ${section.feedback === 'dislike' ? 'btn-danger' : 'btn-outline-danger'}"
                        ${section.feedback === 'dislike' ? 'disabled' : ''}>
                    ${section.feedback === 'dislike' ? '👎 Disliked' : '👎'}
                </button>
            </div>
        </div>
    `).join('');

    document.getElementById('content-section').classList.remove('hidden');
    document.getElementById('outline-section').classList.add('hidden');
}

// Outline Management
function addSection() {
    const outline = currentProject.outline || [];
    const sectionName = prompt('Enter section name:');

    if (sectionName) {
        outline.push(sectionName);
        saveOutline(outline);
    }
}

function removeSection(index) {
    const outline = currentProject.outline || [];
    outline.splice(index, 1);
    saveOutline(outline);
}

function updateSection(index, value) {
    const outline = currentProject.outline || [];
    outline[index] = value;
    saveOutline(outline);
}

async function saveOutline(outline) {
    try {
        const updated = await updateProject(projectId, { outline });
        currentProject = updated;
        renderOutline(outline);
    } catch (error) {
        showAlert(error.message, 'danger');
    }
}

async function suggestOutline() {
    try {
        showAlert('Generating outline suggestions...', 'info');
        const outline = await suggestOutlineAPI(currentProject.topic, currentProject.type);

        const updated = await updateProject(projectId, { outline });
        currentProject = updated;
        renderOutline(outline);
        showAlert('Outline suggested successfully!', 'success');
    } catch (error) {
        showAlert(error.message, 'danger');
    }
}

// Content Generation
async function generateContent() {
    const outline = currentProject.outline;

    if (!outline || outline.length === 0) {
        showAlert('Please add sections to the outline first', 'danger');
        return;
    }

    const btn = document.getElementById('generate-btn');
    btn.disabled = true;
    btn.textContent = '⏳ Generating content...';

    try {
        const result = await generateContentAPI(projectId);
        showAlert('Content generated successfully!', 'success');

        // Reload project to get updated content
        currentProject = await fetchProject(projectId);
        renderContent(currentProject.generated_content);
    } catch (error) {
        showAlert(error.message, 'danger');
        btn.disabled = false;
        btn.textContent = '🚀 Generate Content';
    }
}

// Content Refinement
async function refineSection(index) {
    const input = document.getElementById(`refine-input-${index}`);
    const prompt = input.value.trim();

    if (!prompt) {
        showAlert('Please enter refinement instructions', 'danger');
        return;
    }

    try {
        showAlert('Refining content...', 'info');
        await refineContentAPI(projectId, index, prompt);

        // Reload project
        currentProject = await fetchProject(projectId);
        renderContent(currentProject.generated_content);
        showAlert('Content refined successfully!', 'success');
    } catch (error) {
        showAlert(error.message, 'danger');
    }
}

async function saveNote(index) {
    const note = document.getElementById(`note-input-${index}`).value;
    currentProject.generated_content[index].note = note;

    try {
        await updateProject(projectId, { generated_content: currentProject.generated_content });
        // Subtle indicator could be added here, but auto-save is usually silent or small
        console.log('Note saved');
    } catch (error) {
        showAlert('Failed to save note', 'danger');
    }
}

async function likeSection(index) {
    try {
        await refineContentAPI(projectId, index, 'User liked this section', 'like', null);
        showAlert('Feedback recorded!', 'success');
    } catch (error) {
        showAlert(error.message, 'danger');
    }
}

async function dislikeSection(index) {
    const comment = prompt('What would you like to improve?');
    try {
        await refineContentAPI(projectId, index, 'User disliked this section', 'dislike', comment);
        showAlert('Feedback recorded!', 'success');
    } catch (error) {
        showAlert(error.message, 'danger');
    }
}

// Export
async function exportDocument() {
    const fileType = currentProject.type;
    const url = `${API_BASE_URL}/api/export/${fileType}/${projectId}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to export document');
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${currentProject.topic}.${fileType}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);

        showAlert('Document exported successfully!', 'success');
    } catch (error) {
        showAlert(error.message, 'danger');
    }
}

// Initialize
async function init() {
    try {
        currentProject = await fetchProject(projectId);
        renderProjectHeader(currentProject);

        if (currentProject.generated_content && currentProject.generated_content.length > 0) {
            renderContent(currentProject.generated_content);
        } else {
            renderOutline(currentProject.outline);
        }
    } catch (error) {
        showAlert(error.message, 'danger');
        if (error.message.includes('credentials')) {
            logout();
        }
    }
}

init();

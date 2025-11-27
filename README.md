# AI-Assisted Document Authoring & Generation Platform

A full-stack web application that allows authenticated users to generate, refine, and export structured business documents using AI. Users can create Word documents (.docx) or PowerPoint presentations (.pptx) with AI-powered content generation.

🌐 **Live Demo**: [https://ai-document-platform-szto.onrender.com/login.html](https://ai-document-platform-szto.onrender.com/login.html)

## 🌟 Features

- **User Authentication**: Secure JWT-based authentication system
- **Project Management**: Create and manage multiple document projects
- **Document Types**: Support for Word (.docx) and PowerPoint (.pptx)
- **AI-Powered Generation**: 
  - AI-suggested document outlines
  - Section-wise content generation
  - Context-aware content creation
- **Interactive Refinement**: 
  - Refine content with custom prompts
  - **Like/Dislike Feedback**: Visual confirmation with persistent storage (Dislikes save your comments!)
  - **Personal Notes**: Dedicated text area for your own notes on each section
  - Revision history tracking
- **Export Functionality**: Download completed documents in native formats
- **Responsive UI**: Clean, modern interface that works on all devices

## 🏗️ Tech Stack

### Backend
- **Framework**: FastAPI
- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: JWT tokens
- **AI**: Google Gemini API
- **Document Generation**: python-docx, python-pptx

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern design system with custom properties
- **JavaScript**: Vanilla JS (no framework dependencies)

## 📁 Project Structure

```
OceanAI/
├── backend/
│   ├── ai/
│   │   ├── __init__.py
│   │   └── ai_service.py          # AI service wrapper for Gemini API
│   ├── database/
│   │   ├── __init__.py
│   │   └── db.py                  # Database connection and session
│   ├── models/
│   │   ├── __init__.py
│   │   ├── models.py              # SQLAlchemy models
│   │   └── schemas.py             # Pydantic schemas
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py                # Authentication endpoints
│   │   ├── projects.py            # Project CRUD endpoints
│   │   ├── ai.py                  # AI generation endpoints
│   │   └── export.py              # Document export endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth.py                # JWT utilities
│   │   └── export_service.py     # Document export service
│   ├── config.py                  # Configuration settings
│   ├── main.py                    # FastAPI application
│   ├── requirements.txt           # Python dependencies
│   └── .env.example              # Environment variables template
├── frontend/
│   ├── index.html                 # Landing page (redirects to login)
│   ├── login.html                 # Login page
│   ├── register.html              # Registration page
│   ├── dashboard.html             # Project dashboard
│   ├── project.html               # Project editor
│   ├── styles.css                 # Global styles and design system
│   ├── auth.js                    # Authentication logic
│   ├── dashboard.js               # Dashboard functionality
│   └── project.js                 # Project editor functionality
└── README.md                      # This file
```

## 🚀 Installation & Setup

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- A Google Gemini API key (optional, but recommended for AI features)

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create a virtual environment** (recommended):
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   ```bash
   # Copy the example file
   copy .env.example .env
   
   # Edit .env and add your settings
   ```

   **Important environment variables**:
   - `SECRET_KEY`: Change this to a secure random string for production
   - `GEMINI_API_KEY`: Your Google Gemini API key (get one at https://makersuite.google.com/app/apikey)
   - `DATABASE_URL`: SQLite database path (default: `sqlite:///./app.db`)

5. **Run the backend server**:
   ```bash
   python main.py
   ```

   The backend will start at `http://localhost:8000`

### Frontend Setup

The frontend is a static HTML/CSS/JS application that can be served by the FastAPI backend or any web server.

**Option 1: Served by FastAPI (Recommended)**
- The backend automatically serves the frontend from the `/frontend` directory
- Access the application at `http://localhost:8000`

**Option 2: Separate Web Server**
- Use any static file server (e.g., `python -m http.server 3000` in the frontend directory)
- Update the `API_BASE_URL` in the JavaScript files to point to your backend

## 🔑 Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Database
DATABASE_URL=sqlite:///./app.db

# JWT Authentication
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Gemini API
GEMINI_API_KEY=your-gemini-api-key-here
```

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it into your `.env` file

**Note**: The application will work without a Gemini API key, but will use placeholder content instead of actual AI-generated text.

## 📖 Usage Guide

### 1. Register an Account

1. Navigate to `http://localhost:8000`
2. Click "Sign up" on the login page
3. Enter your email, username, and password
4. You'll be automatically logged in after registration

### 2. Create a Project

1. On the dashboard, click "New Project"
2. Enter a topic (e.g., "Digital Marketing Strategy")
3. Select document type (Word or PowerPoint)
4. Click "Create"

### 3. Define Document Outline

1. Click "AI Suggest" to get AI-generated outline suggestions
2. Or manually add sections using "Add Section"
3. Edit, reorder, or remove sections as needed
4. Each section will become a heading (Word) or slide (PowerPoint)

### 4. Generate Content

1. Once your outline is ready, click "Generate Content"
2. The AI will create content for each section/slide
3. This may take a few moments depending on the number of sections

### 5. Refine & Review Content

For each generated section, you have powerful tools:

- **📝 Personal Notes**: A dedicated text box to write your own thoughts or reminders. These are saved automatically!
- **✨ Refine**: Enter custom instructions (e.g., "Make it shorter") to have AI rewrite the section.
- **👍 Like**: Mark content you're happy with. The button turns green and locks to prevent accidental changes.
- **👎 Dislike**: Provide feedback on what needs improvement. Your comment is saved for future reference.

### 6. Export Document

1. Click "Export Document" when satisfied with the content
2. The document will download in the selected format (.docx or .pptx)
3. Open with Microsoft Word or PowerPoint

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Projects
- `GET /api/projects/` - List all projects
- `POST /api/projects/` - Create new project
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update project (saves notes/outline)
- `DELETE /api/projects/{id}` - Delete project

### AI Generation
- `POST /api/ai/suggest-outline` - Get AI-suggested outline
- `POST /api/ai/generate` - Generate content for all sections
- `POST /api/ai/refine` - Refine specific section content

### Export
- `GET /api/export/docx/{project_id}` - Export as Word document
- `GET /api/export/pptx/{project_id}` - Export as PowerPoint

## 🧪 Testing the Application

### Sample Demo Flow

1. **Register**: Create account with email `demo@example.com`, username `demo`, password `demo123`

2. **Create Word Document Project**:
   - Topic: "Artificial Intelligence in Healthcare"
   - Type: Word Document
   - Use AI to suggest outline
   - Generate content
   - Refine a section with prompt: "Make this more technical"
   - Add a personal note: "Need to verify these stats"
   - Export the document

3. **Create PowerPoint Project**:
   - Topic: "2024 Marketing Strategy"
   - Type: PowerPoint
   - Manually add slides:
     - Introduction
     - Market Analysis
     - Target Audience
     - Campaign Strategy
     - Budget Overview
     - Conclusion
   - Generate content
   - Like/dislike sections (try disliking and adding a comment!)
   - Export presentation

## 🛠️ Development

### Running in Development Mode

```bash
# Backend with auto-reload
cd backend
python main.py

# The server will reload automatically when you make changes
```

### Database Management

The SQLite database (`app.db`) is created automatically on first run. To reset the database:

```bash
# Delete the database file
rm app.db  # On Windows: del app.db

# Restart the server to recreate tables
python main.py
```

## 🔒 Security Notes

- **Change the SECRET_KEY**: The default key in `.env.example` is for development only
- **HTTPS in Production**: Always use HTTPS in production environments
- **API Key Security**: Never commit your `.env` file or expose your Gemini API key
- **Password Requirements**: Consider adding stronger password validation for production

## 🐛 Troubleshooting

### Backend won't start
- Check that all dependencies are installed: `pip install -r requirements.txt`
- Verify Python version: `python --version` (should be 3.8+)
- Check for port conflicts (default: 8000)

### Frontend can't connect to backend
- Verify backend is running at `http://localhost:8000`
- Check browser console for CORS errors
- Ensure `API_BASE_URL` in JavaScript files matches your backend URL

### AI generation returns placeholder content
- Verify your `GEMINI_API_KEY` is set in `.env`
- Check API key validity at Google AI Studio
- Review backend logs for API errors

### Export fails
- Ensure content has been generated before exporting
- Check backend logs for python-docx/python-pptx errors
- Verify sufficient disk space

## 📝 License

This project is provided as-is for educational and development purposes.

## 🤝 Contributing

This is a demonstration project. Feel free to fork and modify for your needs.

## 📧 Support

For issues or questions, please check the troubleshooting section above or review the code comments for implementation details.

---

**Built with ❤️ using FastAPI, Gemini AI, and modern web technologies**

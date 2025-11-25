# Quick Reference Guide

## 🚀 Getting Started (3 Steps)

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. (Optional) Add Gemini API Key
Edit `backend/.env` and add your API key:
```
GEMINI_API_KEY=your-key-here
```
Get a free key at: https://makersuite.google.com/app/apikey

### 3. Start the Server
```bash
# From the OceanAI directory
python backend/main.py

# Or use the quick-start script
start.bat  # Windows
./start.sh # Linux/Mac
```

Access at: **http://localhost:8000**

## 📋 First-Time Usage

1. **Register** → Create account (email, username, password)
2. **Create Project** → Choose topic and type (Word/PowerPoint)
3. **Build Outline** → Use AI suggest or add manually
4. **Generate Content** → Click "Generate Content" button
5. **Refine** → Improve sections with custom prompts
6. **Export** → Download your document

## 🎯 Key Features

- ✅ JWT Authentication
- ✅ AI Outline Suggestions
- ✅ Section-wise Content Generation
- ✅ Interactive Refinement
- ✅ Like/Dislike Feedback
- ✅ Export to .docx and .pptx
- ✅ Revision History Tracking

## 📁 Project Structure

```
OceanAI/
├── backend/          # FastAPI server
│   ├── main.py      # Start here
│   ├── routes/      # API endpoints
│   ├── models/      # Database models
│   ├── services/    # Business logic
│   └── ai/          # AI integration
├── frontend/         # HTML/CSS/JS
│   ├── *.html       # Pages
│   ├── *.js         # Logic
│   └── styles.css   # Design
└── README.md         # Full documentation
```

## 🔧 Configuration

Edit `backend/.env`:
- `SECRET_KEY` - Change for production
- `GEMINI_API_KEY` - Your AI API key
- `DATABASE_URL` - Database location

## 💡 Tips

- Works **without API key** (uses placeholders)
- Database auto-creates on first run
- Frontend served by backend
- All data stored in SQLite

## 🐛 Troubleshooting

**Can't start server?**
- Check Python version: `python --version` (need 3.8+)
- Install dependencies: `pip install -r requirements.txt`

**Frontend not loading?**
- Verify backend is running
- Check http://localhost:8000 (not 3000)

**AI not working?**
- Add GEMINI_API_KEY to .env
- Restart server after adding key

## 📚 Documentation

- **README.md** - Complete setup guide
- **walkthrough.md** - Implementation details
- **Code comments** - Inline documentation

---

**Need Help?** Check README.md for detailed instructions

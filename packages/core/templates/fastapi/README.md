# __CT_PROJECT_NAME__

High-performance asynchronous Python REST API built with FastAPI.

## 🚀 Getting Started

### 1. Create and activate virtual environment
```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure environment
```bash
cp .env.example .env
```

### 4. Start development server
```bash
uvicorn main:app --reload --port 8000
```
Interactive API documentation: [http://localhost:8000/docs](http://localhost:8000/docs).
Health check: [http://localhost:8000/health](http://localhost:8000/health).

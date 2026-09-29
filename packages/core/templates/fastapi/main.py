import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI(title="__CT_PROJECT_NAME__", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to __CT_PROJECT_NAME__ API", "status": "online"}

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "app": "__CT_PROJECT_NAME__",
        "framework": "FastAPI"
    }

# @CodersTrim-Inject-Routes
# @CodersTrim-Inject-Routers

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

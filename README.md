# 🚀 OmniRAG Enterprise

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=FastAPI&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-14354C?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini_2.5-4285F4?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/FAISS-DB0000?style=for-the-badge&logo=meta&logoColor=white" />
  <img src="https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=chainlink&logoColor=white" />
</div>

<br />

OmniRAG Enterprise is a highly scalable, production-ready **Retrieval-Augmented Generation (RAG)** application. It features a stunning glassmorphism dashboard built with React and Vite, powered by an async FastAPI backend utilizing Google's state-of-the-art **Gemini 2.5 Flash** model and local HuggingFace embeddings via FAISS.

## ✨ Key Features

*   **🔒 Secure Access Gateway**: Full authentication routing with a simulated login environment for portfolio presentation.
*   **📄 Intelligent PDF Ingestion**: Drag-and-drop `.pdf` and `.txt` files to instantly chunk, embed, and store knowledge locally in a FAISS vector database using `pypdf`.
*   **🧠 Omni-Knowledge Engine**: Answers general questions using Gemini 2.5 Flash, but seamlessly augments its responses with your proprietary data when queried about uploaded documents.
*   **🎨 Premium Glassmorphism UI**: Beautiful, fully responsive React frontend with fluid micro-animations and a unified design system.

---



## 🏗️ System Architecture

```mermaid
graph TD
    %% Frontend Components
    subgraph Frontend["React Frontend (Vite)"]
        UI_Login[Login Gateway]
        UI_Dash[Enterprise Dashboard]
        UI_Upload[Knowledge Base Manager]
        UI_Chat[Chat Interface]
        
        UI_Login -->|Authenticated| UI_Dash
        UI_Dash --- UI_Upload
        UI_Dash --- UI_Chat
    end

    %% Backend API Layer
    subgraph Backend["FastAPI Backend"]
        API_Chat["/api/chat"]
        API_Upload["/api/upload"]
    end

    %% RAG Engine & DB Layer
    subgraph Engine["RAG Engine (LangChain)"]
        PDF_Parser["PyPDF Text Extractor"]
        Text_Splitter["Recursive Character Splitter"]
        HF_Embed["HuggingFace Embeddings (all-MiniLM)"]
        Vector_DB[("FAISS Vector Store")]
        LLM["Google Gemini 2.5 Flash"]
    end

    %% Data Flow Connections
    UI_Upload -->|Upload .txt / .pdf| API_Upload
    API_Upload --> PDF_Parser
    PDF_Parser --> Text_Splitter
    Text_Splitter --> HF_Embed
    HF_Embed -->|Vectorized Chunks| Vector_DB

    UI_Chat -->|User Query| API_Chat
    API_Chat --> Vector_DB
    Vector_DB -->|Retrieved Context| LLM
    LLM -->|Grounded Answer| API_Chat
```

---

## 🚀 Quickstart Guide

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Create and activate virtual environment (macOS/Linux)
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure Environment Variables
# Create a .env file in the backend directory and add your Google API key:
echo "GOOGLE_API_KEY=your_key_here" > .env

# Run the FastAPI server (Port 8001)
python -m uvicorn main:app --port 8001 --reload
```

### 2. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

### 3. Usage

1.  Navigate to `http://localhost:5176` in your browser.
2.  Use **any** email and password to pass the simulated login gateway.
3.  Drag and drop a PDF into the Knowledge Base Manager on the left.
4.  Start chatting with your data!

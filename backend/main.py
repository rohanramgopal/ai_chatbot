import json
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from rag_engine import rag_engine
from database import get_db, ChatSession, ChatMessage

app = FastAPI(title="OmniRAG Enterprise API")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str

class ChatResponse(BaseModel):
    session_id: str
    message: str
    sources: List[dict]

@app.post("/api/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    session_id = request.session_id or str(uuid.uuid4())
    
    # Store user message
    user_msg = ChatMessage(session_id=session_id, role="user", content=request.message)
    db.add(user_msg)
    db.commit()
    
    # Generate RAG response
    # The LangChain chain expects 'query'
    response_data = rag_engine.query(request.message)
    
    answer = response_data.get("result", "I'm sorry, I could not generate a response.")
    source_docs = response_data.get("source_documents", [])
    
    sources = []
    for doc in source_docs:
        sources.append({
            "source": doc.metadata.get("source", "Unknown"),
            "snippet": doc.page_content[:150] + "..."
        })
    
    # Store AI message
    ai_msg = ChatMessage(
        session_id=session_id, 
        role="ai", 
        content=answer, 
        sources=json.dumps(sources)
    )
    db.add(ai_msg)
    db.commit()
    
    return ChatResponse(session_id=session_id, message=answer, sources=sources)

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    try:
        content = await file.read()
        
        if file.filename.lower().endswith('.pdf'):
            import io
            from pypdf import PdfReader
            pdf = PdfReader(io.BytesIO(content))
            text = ""
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        else:
            text = content.decode("utf-8")
            
        chunks_added = rag_engine.ingest_text(text, file.filename)
        return {"status": "success", "filename": file.filename, "chunks_added": chunks_added}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/history/{session_id}")
def get_history(session_id: str, db: Session = Depends(get_db)):
    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at).all()
    history = []
    for msg in messages:
        history.append({
            "role": msg.role,
            "content": msg.content,
            "sources": json.loads(msg.sources) if msg.sources else []
        })
    return {"session_id": session_id, "history": history}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

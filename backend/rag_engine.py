from dotenv import load_dotenv
load_dotenv(override=True)

import os
from typing import List
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

class RAGEngine:
    def __init__(self, vector_store_path: str = "./faiss_index"):
        self.vector_store_path = vector_store_path
        
        print("Initializing Models (Using HuggingFace for embeddings and Gemini for generation)...")
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        
        self.api_key = os.getenv("GOOGLE_API_KEY")
        if self.api_key:
            self.llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)
        else:
            from langchain_core.language_models.fake import FakeListLLM
            print("WARNING: GOOGLE_API_KEY not found. Using Mock Mode.")
            self.llm = FakeListLLM(responses=["Provide a GOOGLE_API_KEY for real Gemini responses!"])
            
        self.vector_store = self._init_vector_store()
        self.qa_chain = self._build_chain()

    def _init_vector_store(self):
        if os.path.exists(self.vector_store_path):
            try:
                return FAISS.load_local(self.vector_store_path, self.embeddings, allow_dangerous_deserialization=True)
            except Exception as e:
                print(f"Could not load existing vector store: {e}")
        
        # Create an empty vector store if it doesn't exist
        empty_doc = Document(page_content="Initial system knowledge base.", metadata={"source": "system"})
        vs = FAISS.from_documents([empty_doc], self.embeddings)
        vs.save_local(self.vector_store_path)
        return vs

    def _build_chain(self):
        if not self.vector_store:
            return None
        # We don't need a RetrievalQA chain, we'll do it manually to ensure compatibility
        return self.vector_store.as_retriever(search_kwargs={"k": 3})

    def ingest_text(self, text: str, source_name: str):
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = splitter.split_text(text)
        docs = [Document(page_content=chunk, metadata={"source": source_name}) for chunk in chunks]
        
        if self.vector_store:
            self.vector_store.add_documents(docs)
        else:
            self.vector_store = FAISS.from_documents(docs, self.embeddings)
            
        self.vector_store.save_local(self.vector_store_path)
        self.qa_chain = self._build_chain()
        return len(docs)

    def query(self, question: str):
        if not self.qa_chain:
            return {"result": "Vector store not initialized.", "source_documents": []}
            
        # self.qa_chain is actually just the retriever now
        retriever = self.qa_chain
        docs = retriever.invoke(question)
        
        context = "\n\n".join([d.page_content for d in docs])
        prompt = f"You are OmniRAG, a helpful enterprise AI assistant. Use the following context to augment your answer if relevant. If the context does not contain the answer, use your general knowledge to answer the question.\n\nContext:\n{context}\n\nQuestion: {question}\n\nAnswer:"
        
        # Invoke LLM
        response = self.llm.invoke(prompt)
        # Handle string or AIMessage response
        result_text = response.content if hasattr(response, 'content') else str(response)
        
        return {"result": result_text, "source_documents": docs}

rag_engine = RAGEngine()

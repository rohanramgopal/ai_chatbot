import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:8001/api';

const KnowledgeBaseManager = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'uploading', 'success', 'error'
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const uploadFile = async (file) => {
    setUploadStatus('uploading');
    setStatusMessage(`Ingesting ${file.name}...`);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadStatus('success');
      setStatusMessage(`Indexed ${response.data.chunks_added} chunks from ${file.name}`);
      if (onUploadSuccess) onUploadSuccess();
      
      // Reset after 3 seconds
      setTimeout(() => {
        setUploadStatus(null);
        setStatusMessage('');
      }, 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setStatusMessage(error.response?.data?.detail || 'Failed to index document.');
      
      setTimeout(() => {
        setUploadStatus(null);
        setStatusMessage('');
      }, 4000);
    }
  };

  return (
    <div className="kb-manager">
      <div 
        className={`upload-zone ${isDragging ? 'drag-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploadStatus === 'uploading' ? (
          <div className="typing-indicator"><span></span><span></span><span></span></div>
        ) : uploadStatus === 'success' ? (
          <CheckCircle className="upload-icon" color="var(--secondary-color)" />
        ) : uploadStatus === 'error' ? (
          <AlertCircle className="upload-icon" color="var(--error-color)" />
        ) : (
          <UploadCloud className="upload-icon" />
        )}
        
        <div style={{fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center'}}>
          {statusMessage || 'Click or drag a text or PDF document to ingest'}
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{display: 'none'}} 
          onChange={handleFileSelect}
          accept=".txt,.md,.csv,.json,.pdf"
        />
      </div>
      
      <div style={{marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px'}}>
        <h4 style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <FileText size={14} /> System Info
        </h4>
        <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5'}}>
          RAG Pipeline Active.<br/>
          Vector Store: FAISS<br/>
          LLM Engine: Enabled
        </p>
      </div>
    </div>
  );
};

export default KnowledgeBaseManager;

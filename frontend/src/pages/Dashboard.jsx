import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatInterface from '../components/ChatInterface';
import KnowledgeBaseManager from '../components/KnowledgeBaseManager';
import { Database, Zap, LogOut, User } from 'lucide-react';

const Dashboard = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/');
  };

  return (
    <div className="app-container">
      {/* Sidebar for Knowledge Base */}
      <div className="sidebar glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="brand">
          <Zap className="brand-icon" style={{color: 'var(--primary-color)'}} />
          <span>OmniRAG</span>
        </div>
        <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem'}}>
          Enterprise Knowledge Retrieval System
        </p>
        
        <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', marginTop: '1rem'}}>
          <Database size={18} />
          Knowledge Base
        </h3>
        
        <KnowledgeBaseManager onUploadSuccess={handleUploadSuccess} />

        <div className="user-profile" style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ background: 'var(--primary-color)', padding: '0.5rem', borderRadius: '50%' }}>
                    <User size={16} />
                </div>
                <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{localStorage.getItem('currentUser') ? localStorage.getItem('currentUser').split('@')[0] : 'Admin User'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{localStorage.getItem('currentUser') || 'admin@omnirag.io'}</div>
                </div>
            </div>
            <button onClick={handleLogout} className="btn" style={{ width: '100%', background: 'rgba(255,50,50,0.1)', color: '#ff6b6b' }}>
                <LogOut size={16} /> Logout
            </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="chat-container glass-panel">
        <ChatInterface refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
};

export default Dashboard;

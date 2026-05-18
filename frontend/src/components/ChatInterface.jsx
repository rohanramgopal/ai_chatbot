import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

const API_BASE = 'http://localhost:8001/api';

const ChatInterface = ({ refreshTrigger }) => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'ai',
      content: 'Greetings. I am OmniRAG, your Enterprise AI Assistant. I can search through your knowledge base to provide accurate, grounded answers. How can I assist you today?',
      sources: []
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/chat`, {
        session_id: sessionId,
        message: userMessage.content
      });

      if (!sessionId) setSessionId(response.data.session_id);

      const aiMessage = {
        id: Date.now().toString() + '-ai',
        role: 'ai',
        content: response.data.message,
        sources: response.data.sources
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now().toString() + '-err',
        role: 'ai',
        content: 'I encountered an error connecting to the neural network. Please check the backend connection.',
        sources: []
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="chat-header">
        <h2 style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <Sparkles size={20} color="var(--primary-color)" />
          Neural Chat
        </h2>
        {sessionId && <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Session Active</span>}
      </div>
      
      <div className="messages-area">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <div className="avatar">
              {msg.role === 'user' ? <User size={20} /> : <Bot size={20} color="var(--secondary-color)" />}
            </div>
            <div className="message-content">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
              
              {msg.sources && msg.sources.length > 0 && (
                <div className="sources-box">
                  <h4 style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem'}}>Sources:</h4>
                  {msg.sources.map((src, idx) => (
                    <div key={idx} className="source-item">
                      <strong>{src.source}</strong>
                      <p style={{marginTop: '0.25rem', opacity: 0.8}}>{src.snippet}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message ai">
            <div className="avatar"><Bot size={20} color="var(--secondary-color)" /></div>
            <div className="message-content typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="input-area">
        <input
          type="text"
          className="input-field"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your data..."
          disabled={isLoading}
        />
        <button type="submit" className="btn" disabled={!input.trim() || isLoading}>
          <Send size={18} />
        </button>
      </form>
    </>
  );
};

export default ChatInterface;

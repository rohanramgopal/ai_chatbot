import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Lock, Mail, ArrowRight, UserPlus } from 'lucide-react';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate auth & store custom email
    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem('currentUser', email);
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/dashboard');
    }, 1200);
  };

  return (
    <div className="login-container">
      <div className="glass-panel login-panel">
        <div className="brand" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
          <Zap className="brand-icon" style={{color: 'var(--primary-color)'}} size={32} />
          <span style={{ fontSize: '1.8rem' }}>OmniRAG</span>
        </div>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          {isRegistering ? "Create Account" : "Welcome Back"}
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          {isRegistering 
            ? "Register your email to set up your workspace" 
            : "Sign in to access your Enterprise Knowledge Base"}
        </p>

        <form onSubmit={handleAuth} className="login-form">
          <div className="input-group">
            <Mail size={18} className="input-icon" />
            <input 
              type="email" 
              className="input-field" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <Lock size={18} className="input-icon" />
            <input 
              type="password" 
              className="input-field" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn login-btn" disabled={isLoading} style={{ width: '100%', justifyContent: 'center' }}>
            {isLoading ? <div className="typing-indicator" style={{margin: 0}}><span></span><span></span><span></span></div> : (
              <>{isRegistering ? "Register" : "Sign In"} {isRegistering ? <UserPlus size={18} /> : <ArrowRight size={18} />}</>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {isRegistering ? "Already have an account? " : "Don't have an account? "}
          <span 
            style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering ? "Sign In" : "Register"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;

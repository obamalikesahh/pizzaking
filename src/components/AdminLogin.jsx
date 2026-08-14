import React, { useState } from 'react';
import './AdminLogin.css';

const AdminLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const envUsername = import.meta.env.VITE_ADMIN_EMAIL || 'info@pizzaking-schleswig.com';
    const envPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'King';
    
    // Fallback logic for demo purposes if env is not set client side
    if (username === envUsername && password === envPassword) {
      onLogin();
    } else {
      setError('Benutzername oder Passwort ist falsch!');
    }
  };

  return (
    <div className="admin-login-overlay">
      <div className="admin-login-box">
        <h2>Pizza King Login</h2>
        <p>Bitte melden Sie sich an</p>
        
        {error && <div className="admin-login-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Benutzername:</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="info@pizzaking..."
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label>Passwort:</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <div className="admin-login-actions">
            <button type="button" className="btn-cancel" onClick={() => window.location.href = '/'}>Abbrechen</button>
            <button type="submit" className="btn-login">Anmelden</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

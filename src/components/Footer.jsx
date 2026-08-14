import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import './Footer.css';

export default function Footer() {
  const { addNewsletterSubscriber } = useAdmin();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(''); // '', 'loading', 'success', 'error'

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    
    // Save to Admin Dashboard
    addNewsletterSubscriber(email);

    // Send Welcome Email
    try {
      const response = await fetch('http://localhost:3002/api/subscribe-newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ toEmail: email }),
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
        setTimeout(() => setStatus(''), 4000);
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', fontSize: '2rem', marginBottom: '1rem' }}>
            PIZZA KING
          </h2>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '300px', lineHeight: '1.6' }}>
            Frisch zubereitete Pizzen, Burger, Döner, Pastagerichte & mehr. Qualität und Geschmack für Schleswig direkt zu dir nach Hause.
          </p>
        </div>

        <div className="footer-links">
          <h3>Navigation</h3>
          <Link to="/">Startseite</Link>
          <Link to="/menu">Speisekarte</Link>
          <Link to="/about">Über Uns</Link>
          <Link to="/contact">Kontakt & Anfahrt</Link>
        </div>

        <div className="footer-links">
          <h3>Kontakt</h3>
          <p>Domziegelhof 12-14</p>
          <p>24837 Schleswig</p>
          <p style={{ color: 'var(--color-primary)', fontWeight: 'bold', marginTop: '6px' }}>Tel: 04621 - 30 11 11</p>
        </div>

        <div className="footer-social">
          <h3>Folge Uns</h3>
          <div className="social-icons">
            <a href="#" aria-label="Facebook">FB</a>
            <a href="#" aria-label="Instagram">IG</a>
            <a href="#" aria-label="TikTok">TT</a>
          </div>
        </div>
        <div className="footer-newsletter" style={{ flex: '1', minWidth: '280px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)', fontSize: '1.2rem', marginBottom: '1rem' }}>Newsletter</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '15px' }}>Werde Teil des exklusiven King-Clubs und erhalte geheime Angebote!</p>
          
          <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '8px', position: 'relative' }}>
            <input 
              type="email" 
              placeholder="Deine E-Mail Adresse..." 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ flex: '1', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 15px', borderRadius: '8px', color: '#fff', outline: 'none' }}
            />
            <button 
              type="submit" 
              disabled={status === 'loading'}
              style={{ background: 'var(--color-primary)', color: '#000', border: 'none', borderRadius: '8px', padding: '0 20px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {status === 'loading' ? '...' : <Send size={18} />}
            </button>
          </form>
          {status === 'success' && <p style={{ color: '#22c55e', fontSize: '0.85rem', marginTop: '8px' }}>Willkommen! Check dein Postfach.</p>}
          {status === 'error' && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '8px' }}>Ein Fehler ist aufgetreten.</p>}
        </div>

      </div>
      <div className="footer-bottom">
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <p>&copy; {new Date().getFullYear()} Pizza King Schleswig. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </footer>
  );
}

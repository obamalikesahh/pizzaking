import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, Check, X } from 'lucide-react';
import './CookieConsent.css';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: true,
    marketing: false
  });

  useEffect(() => {
    const consent = localStorage.getItem('pk_cookie_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allConsents = { essential: true, analytics: true, marketing: true, timestamp: new Date().toISOString() };
    localStorage.setItem('pk_cookie_consent', JSON.stringify(allConsents));
    setShowBanner(false);
    setShowPreferencesModal(false);
  };

  const handleAcceptEssential = () => {
    const essentialConsent = { essential: true, analytics: false, marketing: false, timestamp: new Date().toISOString() };
    localStorage.setItem('pk_cookie_consent', JSON.stringify(essentialConsent));
    setShowBanner(false);
    setShowPreferencesModal(false);
  };

  const handleSaveCustom = () => {
    const customConsent = { ...preferences, essential: true, timestamp: new Date().toISOString() };
    localStorage.setItem('pk_cookie_consent', JSON.stringify(customConsent));
    setShowBanner(false);
    setShowPreferencesModal(false);
  };

  if (!showBanner && !showPreferencesModal) return null;

  return (
    <>
      {showBanner && (
        <div className="cookie-banner-overlay">
          <div className="cookie-banner-card">
            <div className="cookie-banner-content">
              <div className="cookie-icon-wrapper">
                <Cookie size={28} color="var(--color-primary)" />
              </div>
              <div className="cookie-banner-text">
                <h3>Datenschutz & Cookie-Einstellungen</h3>
                <p>
                  Wir nutzen Cookies & moderne Sicherheitsmaßnahmen (Anti-Bot Protection, SSL-Verschlüsselung & anonyme Analytics), 
                  um dir das beste Bestell- und Nutzererlebnis auf <strong>Pizza King Schleswig</strong> zu bieten. 
                  Weitere Infos findest du in unserer Datenschutzerklärung & Impressum.
                </p>
              </div>
            </div>

            <div className="cookie-banner-actions">
              <button onClick={() => setShowPreferencesModal(true)} className="cookie-btn cookie-btn-outline">
                Einstellungen
              </button>
              <button onClick={handleAcceptEssential} className="cookie-btn cookie-btn-secondary">
                Nur Essenziell
              </button>
              <button onClick={handleAcceptAll} className="cookie-btn cookie-btn-primary">
                <Check size={18} /> Alle Akzeptieren
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreferencesModal && (
        <div className="cookie-modal-overlay">
          <div className="cookie-modal-card">
            <div className="cookie-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={22} color="var(--color-primary)" />
                <h2>Cookie-Präferenzen verwalten</h2>
              </div>
              <button onClick={() => setShowPreferencesModal(false)} className="cookie-modal-close">
                <X size={20} />
              </button>
            </div>

            <div className="cookie-modal-body">
              <div className="cookie-option">
                <div className="cookie-option-info">
                  <strong>Essenziell (Erforderlich)</strong>
                  <p>Notwendig für den Betrieb der Website, Warenkorb, Login & Anti-Bot Sicherheit.</p>
                </div>
                <input type="checkbox" checked disabled className="cookie-checkbox" />
              </div>

              <div className="cookie-option">
                <div className="cookie-option-info">
                  <strong>Analytik & Performance</strong>
                  <p>Hilft uns zu verstehen, welche Pizzen und Speisen am beliebtesten sind.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferences.analytics} 
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })} 
                  className="cookie-checkbox" 
                />
              </div>

              <div className="cookie-option">
                <div className="cookie-option-info">
                  <strong>Marketing & Angebote</strong>
                  <p>Ermöglicht personalisierte Newsletter-Rabatte und Aktionen.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferences.marketing} 
                  onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })} 
                  className="cookie-checkbox" 
                />
              </div>
            </div>

            <div className="cookie-modal-footer">
              <button onClick={handleAcceptEssential} className="cookie-btn cookie-btn-secondary">
                Nur Essenziell
              </button>
              <button onClick={handleSaveCustom} className="cookie-btn cookie-btn-primary">
                Auswahl speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

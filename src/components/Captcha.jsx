import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, RefreshCw, Lock, Sparkles, Check } from 'lucide-react';
import './Captcha.css';

export default function Captcha({ onVerify }) {
  const [captchaType, setCaptchaType] = useState('slider'); // 'slider', 'pattern', 'text'
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Slider puzzle state
  const [sliderPos, setSliderPos] = useState(0);
  const [targetPos, setTargetPos] = useState(() => Math.floor(Math.random() * 60) + 25);
  const [isDragging, setIsDragging] = useState(false);

  // Pattern tile state
  const [tileItems] = useState([
    { id: 'pizza', icon: '🍕', label: 'Pizza' },
    { id: 'burger', icon: '🍔', label: 'Burger' },
    { id: 'drink', icon: '🥤', label: 'Getränk' },
    { id: 'ice', icon: '🍦', label: 'Eis' }
  ]);
  const [targetTile, setTargetTile] = useState(() => tileItems[Math.floor(Math.random() * tileItems.length)]);
  const [selectedTile, setSelectedTile] = useState(null);

  // Distortion Canvas Text Captcha
  const [captchaCode, setCaptchaCode] = useState('');
  const [userInputCode, setUserInputCode] = useState('');
  const [error, setError] = useState('');

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const resetCaptcha = () => {
    setIsVerified(false);
    setIsVerifying(false);
    setError('');
    setSliderPos(0);
    setTargetPos(Math.floor(Math.random() * 60) + 25);
    setSelectedTile(null);
    setTargetTile(tileItems[Math.floor(Math.random() * tileItems.length)]);
    setCaptchaCode(generateRandomCode());
    setUserInputCode('');
    if (onVerify) onVerify(false);
  };

  useEffect(() => {
    setCaptchaCode(generateRandomCode());
  }, []);

  const handleSuccess = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      setError('');
      if (onVerify) onVerify(true);
    }, 400);
  };

  // Slider handler
  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setSliderPos(val);
  };

  const handleSliderRelease = () => {
    if (Math.abs(sliderPos - targetPos) <= 5) {
      handleSuccess();
    } else {
      setError('Schieberegler nicht genau am Ziel. Versuche es noch einmal!');
      setTimeout(() => setSliderPos(0), 500);
    }
  };

  // Tile Selection handler
  const handleTileClick = (tile) => {
    setSelectedTile(tile.id);
    if (tile.id === targetTile.id) {
      handleSuccess();
    } else {
      setError(`Falsch gewählt! Bitte klicke auf "${targetTile.label}".`);
      setTimeout(() => setSelectedTile(null), 800);
    }
  };

  // Text captcha submit handler
  const handleTextCaptchaSubmit = (e) => {
    e.preventDefault();
    if (userInputCode.trim().toUpperCase() === captchaCode) {
      handleSuccess();
    } else {
      setError('Falscher Sicherheitscode! Bitte erneut versuchen.');
      setCaptchaCode(generateRandomCode());
      setUserInputCode('');
    }
  };

  return (
    <div className="king-captcha-container">
      <div className={`king-captcha-card ${isVerified ? 'verified' : ''}`}>
        
        {/* Header */}
        <div className="king-captcha-header">
          <div className="king-captcha-brand">
            <ShieldCheck size={22} className="shield-icon" />
            <span>Pizza King Shield &bull; Anti-Bot Protection</span>
          </div>
          {!isVerified && (
            <div className="king-captcha-type-switcher">
              <button 
                type="button" 
                className={`type-btn ${captchaType === 'slider' ? 'active' : ''}`}
                onClick={() => { setCaptchaType('slider'); resetCaptcha(); }}
                title="Puzzle-Slider"
              >
                Slider
              </button>
              <button 
                type="button" 
                className={`type-btn ${captchaType === 'pattern' ? 'active' : ''}`}
                onClick={() => { setCaptchaType('pattern'); resetCaptcha(); }}
                title="Icon Match"
              >
                Icon Match
              </button>
              <button 
                type="button" 
                className={`type-btn ${captchaType === 'text' ? 'active' : ''}`}
                onClick={() => { setCaptchaType('text'); resetCaptcha(); }}
                title="Visual Code"
              >
                Code
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {isVerified ? (
          <div className="king-captcha-verified-badge">
            <div className="verified-icon-circle">
              <Check size={26} strokeWidth={3} />
            </div>
            <div className="verified-text">
              <strong>Menschliche Interaktion verifiziert!</strong>
              <p>Sicherheitsabfrage erfolgreich bestanden.</p>
            </div>
          </div>
        ) : (
          <div className="king-captcha-body">
            
            {/* TYPE 1: PUZZLE SLIDER */}
            {captchaType === 'slider' && (
              <div className="captcha-slider-box">
                <p className="captcha-instruction">
                  <Sparkles size={16} /> Schiebe den Regler exakt in die leuchtende Zielzone:
                </p>
                <div className="slider-track-wrapper">
                  <div 
                    className="slider-target-zone" 
                    style={{ left: `${targetPos}%` }} 
                  />
                  <div 
                    className="slider-knob-preview"
                    style={{ left: `${sliderPos}%` }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPos}
                    onChange={handleSliderChange}
                    onMouseUp={handleSliderRelease}
                    onTouchEnd={handleSliderRelease}
                    className="slider-range-input"
                  />
                </div>
                <div className="slider-labels">
                  <span>Start</span>
                  <span>Zielbereich</span>
                </div>
              </div>
            )}

            {/* TYPE 2: ICON MATCH */}
            {captchaType === 'pattern' && (
              <div className="captcha-pattern-box">
                <p className="captcha-instruction">
                  Klicke auf das Symbol: <strong>{targetTile.icon} {targetTile.label}</strong>
                </p>
                <div className="tile-grid">
                  {tileItems.map((tile) => (
                    <button
                      key={tile.id}
                      type="button"
                      onClick={() => handleTileClick(tile)}
                      className={`tile-btn ${selectedTile === tile.id ? 'selected' : ''}`}
                    >
                      <span className="tile-icon">{tile.icon}</span>
                      <span className="tile-label">{tile.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TYPE 3: VISUAL DISTORTED CODE */}
            {captchaType === 'text' && (
              <form onSubmit={handleTextCaptchaSubmit} className="captcha-text-box">
                <div className="distorted-code-display">
                  <div className="distorted-bg-lines" />
                  <span className="distorted-text">{captchaCode}</span>
                  <button 
                    type="button" 
                    onClick={resetCaptcha} 
                    className="captcha-reload-btn"
                    title="Neuen Code generieren"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
                <div className="captcha-text-input-group">
                  <input
                    type="text"
                    required
                    value={userInputCode}
                    onChange={(e) => {
                      setUserInputCode(e.target.value);
                      setError('');
                    }}
                    placeholder="Sicherheitscode eingeben..."
                    className="captcha-text-input"
                    maxLength={6}
                  />
                  <button type="submit" className="captcha-confirm-btn">
                    Bestätigen
                  </button>
                </div>
              </form>
            )}

            {error && <div className="king-captcha-error">{error}</div>}
          </div>
        )}

      </div>
    </div>
  );
}

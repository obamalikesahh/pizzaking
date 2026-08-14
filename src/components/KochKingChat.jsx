import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Paperclip, AlertCircle, Loader2 } from 'lucide-react';
import './KochKingChat.css';
import { API_URL } from '../api';

const KochKingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Hallo! Ich bin KochKing 👑. Wie kann ich dir bei deiner Bestellung helfen?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatImage, setChatImage] = useState(null);
  
  const [escalationTriggered, setEscalationTriggered] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');
  const [escalationEmail, setEscalationEmail] = useState('');
  const [escalationFirstName, setEscalationFirstName] = useState('');
  const [escalationLastName, setEscalationLastName] = useState('');
  const [escalationOrderId, setEscalationOrderId] = useState('');
  const [escalationDescription, setEscalationDescription] = useState('');
  const [escalationImage, setEscalationImage] = useState(null);
  const [escalationStatus, setEscalationStatus] = useState(null); // 'sending', 'success', 'error'

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, escalationTriggered]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input || 'Bild hochgeladen' };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const textToSend = input;
    const imageToSend = chatImage;
    setInput('');
    setChatImage(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          image: imageToSend,
          history: messages.map(m => ({ role: m.role, text: m.text }))
        })
      });

      if (!response.ok) {
        throw new Error('Server returned an error');
      }

      const data = await response.json();
      
      if (data.text) {
        setMessages(prev => [...prev, { role: 'model', text: data.text }]);
      } else if (data.error) {
        throw new Error(data.error);
      }

      if (data.escalationTriggered) {
        setEscalationTriggered(true);
        setEscalationReason(data.escalationReason);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'Entschuldigung, es gab einen Fehler bei der Verbindung. Bitte versuche es später noch einmal.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEscalationImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEscalationSubmit = async (e) => {
    e.preventDefault();
    if (!escalationEmail) return;

    setEscalationStatus('sending');

    try {
      const response = await fetch(`${API_URL}/chat/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: escalationEmail,
          firstName: escalationFirstName,
          lastName: escalationLastName,
          orderId: escalationOrderId,
          history: messages,
          image: escalationImage,
          reason: escalationReason,
          description: escalationDescription
        })
      });

      if (response.ok) {
        setEscalationStatus('success');
        setMessages(prev => [...prev, { role: 'model', text: 'Deine Nachricht wurde erfolgreich an unser Team weitergeleitet. Wir melden uns in Kürze per E-Mail bei dir.' }]);
        setEscalationTriggered(false);
        setEscalationImage(null);
      } else {
        setEscalationStatus('error');
      }
    } catch (error) {
      console.error('Escalation submit error:', error);
      setEscalationStatus('error');
    }
  };

  return (
    <div className="kochking-container">
      {isOpen && (
        <div className="kochking-window">
          <div className="kochking-header">
            <div className="kochking-title">
              <span className="kochking-avatar">👑</span>
              <div>
                <h3>KochKing</h3>
                <p>Immer für dich da</p>
              </div>
            </div>
            <button className="kochking-close" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="kochking-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`kochking-message-wrapper ${msg.role}`}>
                <div className="kochking-message">
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="kochking-message-wrapper model">
                <div className="kochking-message loading">
                  <Loader2 size={16} className="spin" />
                  <span>Schreibt...</span>
                </div>
              </div>
            )}

            {escalationTriggered && (
              <div className="kochking-escalation-box">
                <h4><span className="kochking-avatar" style={{fontSize: '18px', marginRight: '8px', padding: '2px 6px'}}>👑</span> Problem melden</h4>
                <p>Bitte hinterlasse deine Daten und beschreibe dein Problem, damit wir uns schnell darum kümmern können.</p>
                <form onSubmit={handleEscalationSubmit}>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input 
                      type="text" 
                      placeholder="Vorname" 
                      value={escalationFirstName}
                      onChange={(e) => setEscalationFirstName(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                    />
                    <input 
                      type="text" 
                      placeholder="Nachname" 
                      value={escalationLastName}
                      onChange={(e) => setEscalationLastName(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                    />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Bestellnummer (optional)" 
                    value={escalationOrderId}
                    onChange={(e) => setEscalationOrderId(e.target.value)}
                    style={{ width: '100%', marginBottom: '10px', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                  />
                  <input 
                    type="email" 
                    placeholder="Deine E-Mail Adresse" 
                    value={escalationEmail}
                    onChange={(e) => setEscalationEmail(e.target.value)}
                    required
                    style={{ width: '100%', marginBottom: '10px', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                  />

                  <textarea
                    placeholder="Beschreibe dein Problem..."
                    value={escalationDescription}
                    onChange={(e) => setEscalationDescription(e.target.value)}
                    rows={3}
                    style={{ width: '100%', marginBottom: '10px', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', resize: 'vertical' }}
                  />
                  <div className="kochking-file-upload">
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="kochking-btn-secondary"
                    >
                      <Paperclip size={16} /> {escalationImage ? 'Bild ausgewählt' : 'Bild anhängen'}
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                      onChange={handleImageUpload}
                    />
                  </div>
                  {escalationImage && (
                    <img src={escalationImage} alt="Preview" className="kochking-image-preview" />
                  )}
                  <button 
                    type="submit" 
                    className="kochking-btn-primary" 
                    disabled={escalationStatus === 'sending'}
                  >
                    {escalationStatus === 'sending' ? 'Wird gesendet...' : 'An Mitarbeiter senden'}
                  </button>
                  {escalationStatus === 'error' && (
                    <p className="kochking-error">Fehler beim Senden. Bitte versuche es noch einmal.</p>
                  )}
                </form>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="kochking-input-container">
            {chatImage && (
              <div className="chat-image-preview">
                <img src={chatImage} alt="Upload preview" />
                <span>Bild angehängt</span>
                <button onClick={() => setChatImage(null)}><X size={16} /></button>
              </div>
            )}
            <div className="messageBox">
              <div className="fileUploadWrapper">
                <label htmlFor="file">
                  <svg viewBox="0 0 337 337" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M168.5 0C75.44 0 0 75.44 0 168.5C0 261.56 75.44 337 168.5 337C261.56 337 337 261.56 337 168.5C337 75.44 261.56 0 168.5 0ZM249.5 188.5H188.5V249.5H148.5V188.5H87.5V148.5H148.5V87.5H188.5V148.5H249.5V188.5Z" fill="currentColor"/>
                  </svg>
                  <span className="tooltip">Bild hinzufügen</span>
                </label>
                <input 
                  type="file" 
                  id="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setChatImage(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }} 
                />
              </div>
              <input 
                required 
                placeholder="Message..." 
                type="text" 
                id="messageInput"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={escalationTriggered || isLoading}
              />
              <button 
                id="sendButton"
                onClick={handleSend}
                disabled={(!input.trim() && !chatImage) || escalationTriggered || isLoading}
              >
                <svg viewBox="0 0 664 663" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M646.293 331.888L17.7538 17.6122C15.2014 15.0598 11.5365 14.1627 8.1691 15.2268C4.80175 16.2909 2.21577 19.0988 1.4116 22.5694L1.24296 23.3644L105.748 331.888L1.24296 640.412L1.4116 641.207C2.21577 644.678 4.80175 647.485 8.1691 648.549C11.5365 649.613 15.2014 648.716 17.7538 646.164L646.293 331.888ZM138.835 301.888H365.17V361.888H138.835L48.165 596.111L570.671 331.888L48.165 67.6657L138.835 301.888Z" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {!isOpen && (
        <button className="kochking-toggle" onClick={() => setIsOpen(true)}>
          <span className="kochking-tooltip">Brauchst du Hilfe?</span>
          <span style={{ fontSize: '26px' }}>👨‍🍳</span>
        </button>
      )}
    </div>
  );
};

export default KochKingChat;

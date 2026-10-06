import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import './Captcha.css';

export default function Captcha({ onVerify }) {
  const generateMathQuestion = () => {
    const num1 = Math.floor(Math.random() * 9) + 1;
    const num2 = Math.floor(Math.random() * 9) + 1;
    return { num1, num2, answer: num1 + num2 };
  };

  const [question, setQuestion] = useState(generateMathQuestion);
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');

  const refreshCaptcha = () => {
    setQuestion(generateMathQuestion());
    setUserAnswer('');
    setIsVerified(false);
    setError('');
    if (onVerify) onVerify(false);
  };

  const handleCheck = (e) => {
    e.preventDefault();
    if (parseInt(userAnswer.trim(), 10) === question.answer) {
      setIsVerified(true);
      setError('');
      if (onVerify) onVerify(true);
    } else {
      setError('Falsches Ergebnis, bitte versuche es erneut.');
      setIsVerified(false);
      if (onVerify) onVerify(false);
    }
  };

  return (
    <div className="captcha-wrapper">
      <div className="captcha-card">
        <div className="captcha-header">
          <ShieldCheck size={20} color="var(--color-primary)" />
          <span>Sicherheitsabfrage (Anti-Bot Captcha)</span>
        </div>

        {isVerified ? (
          <div className="captcha-verified">
            <CheckCircle2 size={24} color="#22c55e" />
            <span>Du wurdest erfolgreich als Mensch verifiziert!</span>
          </div>
        ) : (
          <form onSubmit={handleCheck} className="captcha-form">
            <div className="captcha-question">
              <span>Was ist <strong>{question.num1} + {question.num2}</strong>?</span>
              <button 
                type="button" 
                onClick={refreshCaptcha} 
                className="captcha-refresh-btn"
                title="Neue Aufgabe laden"
              >
                <RefreshCw size={15} />
              </button>
            </div>
            
            <div className="captcha-input-group">
              <input
                type="number"
                required
                value={userAnswer}
                onChange={(e) => {
                  setUserAnswer(e.target.value);
                  setError('');
                }}
                placeholder="Ergebnis eingeben..."
                className="captcha-input"
              />
              <button type="submit" className="captcha-submit-btn">
                Bestätigen
              </button>
            </div>
            {error && <div className="captcha-error">{error}</div>}
          </form>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { User, Mail, Lock, CheckCircle, Clock, ShieldCheck, Tag, ShoppingBag, LogOut, ArrowRight, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sendVerificationEmail } from '../services/emailService';
import { storeData } from '../data/storeData';

export default function Account() {
  const { currentUser, userSignUp, userVerifyAndSetPassword, userLogin, userVerifyLogin, userLogout, orders, updateOrderStatus } = useAdmin();

  // Mode: 'login' | 'login_step2' | 'signup_step1' | 'signup_step2'
  const [mode, setMode] = useState('login');

  // Login Form
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Login Verifizierung State
  const [loginTempUser, setLoginTempUser] = useState(null);
  const [loginGeneratedCode, setLoginGeneratedCode] = useState('');
  const [loginVerifyCodeInput, setLoginVerifyCodeInput] = useState('');

  // Sign Up Form
  const [nameInput, setNameInput] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [streetInput, setStreetInput] = useState('');
  const [houseNumberInput, setHouseNumberInput] = useState('');
  const [zipInput, setZipInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [tempUser, setTempUser] = useState(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [verifyCodeInput, setVerifyCodeInput] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Newsletter Promo Code
  const [newsletterCode, setNewsletterCode] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const res = userLogin(emailInput, passwordInput);
    if (!res.success) {
      setErrorMsg(res.message);
    } else if (res.requireVerification) {
      setLoginTempUser(res.tempUser);
      setLoginGeneratedCode(res.code);
      await sendVerificationEmail(emailInput, res.tempUser.name, res.code);
      setMode('login_step2');
    }
  };

  const handleLoginStep2 = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const res = userVerifyLogin(loginTempUser, loginGeneratedCode, loginVerifyCodeInput);
    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  const handleSignUpStep1 = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const fullAddress = `${streetInput} ${houseNumberInput}, ${zipInput} ${cityInput}`;
    const res = userSignUp(signUpEmail, nameInput, fullAddress);
    setTempUser(res.tempUser);
    setGeneratedCode(res.code);
    
    // Sende echten Verifizierungscode per Resend E-Mail
    await sendVerificationEmail(signUpEmail, nameInput, res.code);

    setMode('signup_step2');
  };

  const handleSignUpStep2 = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const res = userVerifyAndSetPassword(tempUser, verifyCodeInput, newPassword);
    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  const generateNewsletterCoupon = () => {
    const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase();
    const numPart = Math.floor(100 + Math.random() * 900);
    setNewsletterCode(`KING-${numPart}-${randomPart}`);
  };

  // User's orders
  const myOrders = orders.filter(o => o.customerEmail && currentUser && o.customerEmail.toLowerCase() === currentUser.email.toLowerCase());

  // IF USER IS LOGGED IN: SHOW CUSTOMER DASHBOARD
  if (currentUser) {
    return (
      <div className="page-container container" style={{ padding: '60px 20px', maxWidth: '1000px', margin: '0 auto', color: '#fff' }}>
        {/* Header Profile Box */}
        <div style={{ background: 'linear-gradient(135deg, rgba(207,166,112,0.15) 0%, rgba(20,22,20,0.95) 100%)', border: '1px solid rgba(207,166,112,0.3)', borderRadius: '24px', padding: '40px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#cfa670', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.8rem', color: '#fff', margin: 0 }}>Willkommen, {currentUser.name}!</h2>
                <span style={{ fontSize: '0.85rem', color: '#cfa670', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <ShieldCheck size={16} /> Verifiziertes Kundenkonto ({currentUser.email})
                </span>
              </div>
            </div>
          </div>

          <button onClick={userLogout} style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '10px 20px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogOut size={16} /> Abmelden
          </button>
        </div>

        {/* Section 1: Order History */}
        <div style={{ background: '#121312', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '30px', marginBottom: '40px' }}>
          <h3 style={{ fontFamily: 'Cinzel, serif', color: '#cfa670', fontSize: '1.4rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={22} /> Meine Bestellungen ({myOrders.length})
          </h3>

          {myOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
              <p>Du hast noch keine Bestellungen mit diesem Konto aufgegeben.</p>
              <Link to="/menu" className="bestseller-btn" style={{ marginTop: '15px' }}>
                JETZT ERSTE BESTELLUNG AUFGEBEN <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {myOrders.map(order => (
                <div key={order.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <strong style={{ color: '#cfa670', fontSize: '1.1rem' }}>{order.id}</strong>
                      <span style={{ fontSize: '0.85rem', color: '#888', marginLeft: '12px' }}>{order.date} um {order.time} Uhr</span>
                    </div>
                    <span className={`status-badge ${order.status}`} style={{ textTransform: 'uppercase', fontSize: '0.8rem' }}>
                      {order.status === 'eingegangen' && 'Eingegangen'}
                      {order.status === 'zubereitung' && 'In Zubereitung'}
                      {order.status === 'zustellung' && 'In Zustellung 🛵'}
                      {order.status === 'erledigt' && 'Zugestellt ✅'}
                      {order.status === 'storniert' && 'Storniert ❌'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.9rem', color: '#ccc', marginBottom: '12px' }}>
                    {(order.items || []).map((it, idx) => (
                      <div key={idx}>• {typeof it === 'string' ? it : `${it.quantity}x ${it.name}`}</div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.9rem' }}>
                    <span>Lieferadresse: <strong style={{ color: '#fff' }}>{order.address}</strong></span>
                    <strong style={{ fontSize: '1.1rem', color: '#cfa670' }}>{(order.total || 0).toFixed(2).replace('.', ',')} €</strong>
                  </div>
                  
                  {order.status === 'eingegangen' && (
                    <div style={{ marginTop: '15px', textAlign: 'right' }}>
                      <button onClick={() => {
                        if(window.confirm('Möchten Sie diese Bestellung wirklich stornieren?')) {
                          updateOrderStatus(order.id, 'storniert');
                        }
                      }} className="bestseller-btn" style={{ padding: '8px 16px', fontSize: '0.8rem', background: 'rgba(239,68,68,0.15)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
                        Bestellung Stornieren
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Newsletter Gutschein Code */}
        <div style={{ background: 'linear-gradient(135deg, rgba(207,166,112,0.1) 0%, rgba(18,19,18,0.95) 100%)', border: '1px solid rgba(207,166,112,0.3)', borderRadius: '20px', padding: '30px', textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'Cinzel, serif', color: '#fff', fontSize: '1.5rem', marginBottom: '10px' }}>
            🎁 Exklusiver Newsletter & Willkommens-Gutschein
          </h3>
          <p style={{ color: '#aaa', maxWidth: '550px', margin: '0 auto 20px', fontSize: '0.95rem' }}>
            Erstelle einen persönlichen 10% Rabattcode. Jeder Code ist exklusiv für dich generiert und 1 Monat lang für deine Bestellung gültig!
          </p>

          {newsletterCode ? (
            <div style={{ background: 'rgba(207,166,112,0.2)', border: '1px solid #cfa670', color: '#fff', padding: '16px 24px', borderRadius: '40px', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              <Tag size={20} color="#cfa670" />
              <span>Dein 1-Monats-Code lautet: <strong style={{ color: '#cfa670', fontSize: '1.2rem', letterSpacing: '2px' }}>{newsletterCode}</strong> (Gültig bis {new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('de-DE')})</span>
            </div>
          ) : (
            <button onClick={generateNewsletterCoupon} className="bestseller-btn" style={{ padding: '14px 28px', fontSize: '0.9rem' }}>
              GUTSCHEINCODE JETZT GENERIEREN <Tag size={16} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // IF NOT LOGGED IN: SHOW SIGN UP / LOGIN FORM
  return (
    <div className="page-container container" style={{ padding: '80px 20px', display: 'flex', justifyContent: 'center', minHeight: '75vh' }}>
      <div style={{ background: '#121312', border: '1px solid rgba(207,166,112,0.3)', borderRadius: '24px', padding: '50px 40px', width: '100%', maxWidth: '460px', color: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.9)' }}>
        
        {/* Toggle Login vs Sign Up */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '30px' }}>
          <button 
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            style={{ flex: 1, padding: '14px', background: 'none', border: 'none', color: mode === 'login' ? '#cfa670' : '#888', borderBottom: mode === 'login' ? '2px solid #cfa670' : 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
          >
            ANMELDEN
          </button>
          <button 
            onClick={() => { setMode('signup_step1'); setErrorMsg(''); }}
            style={{ flex: 1, padding: '14px', background: 'none', border: 'none', color: mode.startsWith('signup') ? '#cfa670' : '#888', borderBottom: mode.startsWith('signup') ? '2px solid #cfa670' : 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
          >
            REGISTRIEREN
          </button>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '12px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '20px', textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}

        {/* MODE: LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontFamily: 'Cinzel, serif', color: '#fff', margin: 0, fontSize: '1.5rem', textAlign: 'center' }}>Willkommen zurück</h2>
            <p style={{ color: '#888', fontSize: '0.85rem', textAlign: 'center', margin: '0 0 10px 0' }}>Melde dich an, um deinen Bestellstatus einzusehen.</p>

            <div>
              <label style={{ display: 'block', color: '#cfa670', fontSize: '0.8rem', marginBottom: '6px' }}>E-Mail-Adresse</label>
              <input type="email" required value={emailInput} onChange={e => setEmailInput(e.target.value)} placeholder="deine@email.de" style={{ width: '100%', padding: '14px', background: '#1a1b1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', color: '#cfa670', fontSize: '0.8rem', marginBottom: '6px' }}>Passwort</label>
              <input type="password" required value={passwordInput} onChange={e => setPasswordInput(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '14px', background: '#1a1b1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <button type="submit" style={{ background: '#cfa670', color: '#000', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
              WEITER ZUR VERIFIZIERUNG
            </button>
          </form>
        )}

        {/* MODE: LOGIN STEP 2 (2FA) */}
        {mode === 'login_step2' && (
          <form onSubmit={handleLoginStep2} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontFamily: 'Cinzel, serif', color: '#fff', margin: 0, fontSize: '1.5rem', textAlign: 'center' }}>Sicherheitscheck</h2>
            <p style={{ color: '#888', fontSize: '0.85rem', textAlign: 'center', margin: '0 0 10px 0' }}>Wir haben dir einen 6-stelligen Code an {emailInput} gesendet.</p>

            <div>
              <label style={{ display: 'block', color: '#cfa670', fontSize: '0.8rem', marginBottom: '6px' }}>Verifizierungscode</label>
              <input type="text" required value={loginVerifyCodeInput} onChange={e => setLoginVerifyCodeInput(e.target.value)} placeholder="••••••" style={{ width: '100%', padding: '14px', background: '#1a1b1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#cfa670', outline: 'none', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '4px', fontWeight: 'bold', boxSizing: 'border-box' }} />
            </div>

            <button type="submit" style={{ background: '#cfa670', color: '#000', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
              ANMELDUNG ABSCHLIEßEN
            </button>

            <button type="button" onClick={() => setMode('login')} style={{ background: 'transparent', color: '#888', border: 'none', fontSize: '0.85rem', cursor: 'pointer', marginTop: '10px' }}>
              Zurück zur Passworteingabe
            </button>
          </form>
        )}

        {/* MODE: SIGN UP STEP 1 */}
        {mode === 'signup_step1' && (
          <form onSubmit={handleSignUpStep1} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontFamily: 'Cinzel, serif', color: '#fff', margin: 0, fontSize: '1.5rem', textAlign: 'center' }}>Neues Konto Erstellen</h2>
            <p style={{ color: '#888', fontSize: '0.85rem', textAlign: 'center', margin: '0 0 10px 0' }}>Wir senden dir einen Verifizierungscode an deine E-Mail.</p>

            <div>
              <label style={{ display: 'block', color: '#cfa670', fontSize: '0.8rem', marginBottom: '6px' }}>Dein Name</label>
              <input type="text" required value={nameInput} onChange={e => setNameInput(e.target.value)} placeholder="Max Mustermann" style={{ width: '100%', padding: '14px', background: '#1a1b1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', color: '#cfa670', fontSize: '0.8rem', marginBottom: '6px' }}>E-Mail-Adresse</label>
              <input type="email" required value={signUpEmail} onChange={e => setSignUpEmail(e.target.value)} placeholder="deine@email.de" style={{ width: '100%', padding: '14px', background: '#1a1b1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 2 }}>
                <label style={{ display: 'block', color: '#cfa670', fontSize: '0.8rem', marginBottom: '6px' }}>Straße</label>
                <input type="text" required value={streetInput} onChange={e => setStreetInput(e.target.value)} placeholder="Musterstraße" style={{ width: '100%', padding: '14px', background: '#1a1b1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', color: '#cfa670', fontSize: '0.8rem', marginBottom: '6px' }}>Hausnr.</label>
                <input type="text" required value={houseNumberInput} onChange={e => setHouseNumberInput(e.target.value)} placeholder="1a" style={{ width: '100%', padding: '14px', background: '#1a1b1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', color: '#cfa670', fontSize: '0.8rem', marginBottom: '6px' }}>Postleitzahl</label>
                <input type="text" required value={zipInput} onChange={e => setZipInput(e.target.value)} placeholder="24837" style={{ width: '100%', padding: '14px', background: '#1a1b1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 2 }}>
                <label style={{ display: 'block', color: '#cfa670', fontSize: '0.8rem', marginBottom: '6px' }}>Ort</label>
                <select required value={cityInput} onChange={e => {
                  setCityInput(e.target.value);
                  const selectedZone = storeData.deliveryZones.find(z => z.city === e.target.value);
                  if (selectedZone && selectedZone.zip !== "—") {
                    setZipInput(selectedZone.zip);
                  }
                }} style={{ width: '100%', padding: '14px', background: '#1a1b1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none', boxSizing: 'border-box', appearance: 'none' }}>
                  <option value="" disabled>Ort auswählen...</option>
                  <option value="Abholung (Vor Ort)">Abholung (Vor Ort)</option>
                  {storeData.deliveryZones.filter(z => z.zip !== "—").map((zone, idx) => (
                    <option key={idx} value={zone.city}>{zone.city}</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" style={{ background: '#cfa670', color: '#000', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
              VERIFIZIERUNGSCODE ANFORDERN
            </button>
          </form>
        )}

        {/* MODE: SIGN UP STEP 2 (VERIFICATION & PASSWORD) */}
        {mode === 'signup_step2' && (
          <form onSubmit={handleSignUpStep2} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontFamily: 'Cinzel, serif', color: '#fff', margin: 0, fontSize: '1.5rem', textAlign: 'center' }}>E-Mail Verifizierung</h2>
            
            <div style={{ background: 'rgba(207,166,112,0.12)', border: '1px solid rgba(207,166,112,0.3)', padding: '16px', borderRadius: '12px', textAlign: 'center', fontSize: '0.9rem', color: '#dddddd', lineHeight: '1.5' }}>
              📧 Ein 6-stelliger Verifizierungscode wurde soeben per E-Mail an <strong style={{ color: '#cfa670' }}>{signUpEmail}</strong> gesendet.
              <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: '#aaaaaa' }}>Bitte schaue in dein E-Mail-Postfach (auch im Spam-Ordner nachsehen).</p>
            </div>

            <div>
              <label style={{ display: 'block', color: '#cfa670', fontSize: '0.8rem', marginBottom: '6px' }}>6-Stelligen Code eingeben</label>
              <input type="text" required value={verifyCodeInput} onChange={e => setVerifyCodeInput(e.target.value)} placeholder="6-stelligen Code eingeben..." style={{ width: '100%', padding: '14px', background: '#1a1b1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none', textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', color: '#cfa670', fontSize: '0.8rem', marginBottom: '6px' }}>Neues Passwort festlegen</label>
              <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mindestens 6 Zeichen..." style={{ width: '100%', padding: '14px', background: '#1a1b1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <button type="submit" style={{ background: '#cfa670', color: '#000', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
              KONTO VERIFIZIEREN & SPEICHERN
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  UtensilsCrossed, 
  Settings, 
  TrendingUp, 
  Clock, 
  Printer, 
  Search, 
  Power, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  Tag, 
  CheckCircle,
  Euro,
  User,
  MapPin,
  Phone,
  LogOut,
  X
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { sendVerificationEmail } from '../services/emailService';
import './Admin.css';

export default function Admin() {
  const { 
    isAuthenticated, 
    login, 
    verifyAdminLogin,
    logout, 
    orders, 
    updateOrderStatus, 
    offers, 
    removeOffer, 
    menu, 
    updateMenuItem,
    allUsers,
    newsletterSubscribers
  } = useAdmin();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // 2FA Admin Login State
  const [isVerifying, setIsVerifying] = useState(false);
  const [generatedAdminCode, setGeneratedAdminCode] = useState('');
  const [adminVerifyInput, setAdminVerifyInput] = useState('');

  // Dashboard Tab state
  const [activeTab, setActiveTab] = useState('orders'); // orders, offers, menu, stats, settings
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // New Offer Form State
  const [showNewOfferModal, setShowNewOfferModal] = useState(false);
  const [newOfferTitle, setNewOfferTitle] = useState('');
  const [newOfferDesc, setNewOfferDesc] = useState('');
  const [newOfferPrice, setNewOfferPrice] = useState('');
  const [newOfferBadge, setNewOfferBadge] = useState('HOT DEAL');
  const [newOfferImage, setNewOfferImage] = useState('/images/pizzen/pizzen%20fleisch/pizza%20king%20II.jpeg');

  // Edit Menu Item Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editImage, setEditImage] = useState('');

  // Store Controls
  const [isOpenStore, setIsOpenStore] = useState(true);
  const [estimatedTime, setEstimatedTime] = useState('25-35 min');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    const res = login(loginEmail, loginPassword);
    if (!res.success) {
      setLoginError(res.message);
    } else if (res.requireVerification) {
      setGeneratedAdminCode(res.code);
      setIsVerifying(true);
      await sendVerificationEmail(loginEmail, res.name, res.code);
    }
  };

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    const res = verifyAdminLogin(generatedAdminCode, adminVerifyInput);
    if (!res.success) {
      setLoginError(res.message);
    }
  };

  const handleCreateOffer = (e) => {
    e.preventDefault();
    if (!newOfferTitle || !newOfferPrice) return;
    addOffer({
      title: newOfferTitle,
      description: newOfferDesc,
      price: newOfferPrice.includes('€') ? newOfferPrice : `${newOfferPrice} €`,
      badge: newOfferBadge,
      image: newOfferImage
    });
    setShowNewOfferModal(false);
    setNewOfferTitle('');
    setNewOfferDesc('');
    setNewOfferPrice('');
  };

  const handleSaveMenuItem = (e) => {
    e.preventDefault();
    if (!editingItem) return;
    updateMenuItem(editingItem.id, {
      name: editName,
      price: editPrice.includes('€') ? editPrice : `${editPrice} €`,
      desc: editDesc,
      image: editImage
    });
    setEditingItem(null);
  };

  // Compute Revenue
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  // IF NOT AUTHENTICATED: RENDER ADMIN LOGIN GATE
  if (!isAuthenticated) {
    return (
      <div className="admin-container" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '85vh', background: 'radial-gradient(circle at center, #181918 0%, #0a0b0a 100%)' }}>
        <div style={{ background: '#121312', border: '1px solid rgba(207, 166, 112, 0.3)', borderRadius: '24px', padding: '50px 40px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.9)' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(207,166,112,0.15)', border: '1px solid #cfa670', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#cfa670' }}>
            <Lock size={28} />
          </div>

          <h2 style={{ fontFamily: 'Cinzel, serif', textAlign: 'center', color: '#ffffff', fontSize: '1.8rem', letterSpacing: '1px', margin: '0 0 8px 0' }}>
            ADMIN LOGIN
          </h2>
          <p style={{ textAlign: 'center', color: '#888888', fontSize: '0.85rem', marginBottom: '30px' }}>
            Pizza King Schleswig – Geschützter Verwaltungsbereich
          </p>

          {loginError && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '12px 16px', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '20px', textAlign: 'center' }}>
              {loginError}
            </div>
          )}

          {!isVerifying ? (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', color: '#cfa670', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                  Admin E-Mail Adresse
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="#666" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="admin@pizzaking.de"
                    style={{ width: '100%', padding: '14px 14px 14px 44px', background: '#1a1b1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#cfa670', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                  Passwort
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="#666" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    style={{ width: '100%', padding: '14px 44px', background: '#1a1b1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none', fontSize: '0.95rem', letterSpacing: showPassword ? 'normal' : '2px', boxSizing: 'border-box' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                style={{ background: '#cfa670', color: '#000000', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', letterSpacing: '1px', cursor: 'pointer', marginTop: '10px', transition: 'all 0.2s ease' }}
              >
                WEITER
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', color: '#cfa670', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                  Verifizierungscode (E-Mail)
                </label>
                <input 
                  type="text" 
                  required
                  value={adminVerifyInput}
                  onChange={(e) => setAdminVerifyInput(e.target.value)}
                  placeholder="6-stelliger Code"
                  style={{ width: '100%', padding: '14px', background: '#1a1b1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#cfa670', outline: 'none', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '4px', fontWeight: 'bold', boxSizing: 'border-box' }}
                />
              </div>

              <button 
                type="submit"
                style={{ background: '#cfa670', color: '#000000', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', letterSpacing: '1px', cursor: 'pointer', marginTop: '10px', transition: 'all 0.2s ease' }}
              >
                ANMELDEN
              </button>
              
              <button 
                type="button"
                onClick={() => setIsVerifying(false)}
                style={{ background: 'transparent', color: '#888', border: 'none', fontSize: '0.85rem', cursor: 'pointer', marginTop: '10px' }}
              >
                Zurück zur Passworteingabe
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // IF AUTHENTICATED: RENDER FULL ADMIN DASHBOARD
  return (
    <div className="admin-container">
      {/* Top Header Bar */}
      <header className="admin-header-bar">
        <div className="admin-title-group">
          <h1>PIZZA KING DASHBOARD</h1>
          <p>Echtzeit-Verwaltung für Pizza King Schleswig (Domziegelhof 12-14)</p>
        </div>

        <div className="admin-status-pills">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '0.85rem', color: '#888' }}>Lieferzeit:</span>
            <select 
              value={estimatedTime} 
              onChange={(e) => setEstimatedTime(e.target.value)}
              style={{ background: '#181918', color: '#cfa670', border: '1px solid rgba(207,166,112,0.3)', padding: '6px 12px', borderRadius: '8px', outline: 'none' }}
            >
              <option value="20-30 min">⚡ 20-30 min (Schnell)</option>
              <option value="25-35 min">🟢 25-35 min (Normal)</option>
              <option value="40-55 min">🟡 40-55 min (Hochbetrieb)</option>
              <option value="60+ min">🔴 60+ min (Überlastet)</option>
            </select>
          </div>

          <button 
            className={`admin-pill ${isOpenStore ? 'open' : 'closed'}`}
            onClick={() => setIsOpenStore(!isOpenStore)}
          >
            <Power size={16} />
            {isOpenStore ? 'RESTAURANT GEÖFFNET' : 'GESCHLOSSEN'}
          </button>

          <button className="admin-btn" onClick={logout} style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }} title="Abmelden">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="admin-body">
        {/* Sidebar Nav */}
        <aside className="admin-sidebar">
          <button 
            className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={18} />
            <span>Bestellungen ({orders.length})</span>
          </button>
          
          <button 
            className={`admin-nav-item ${activeTab === 'offers' ? 'active' : ''}`}
            onClick={() => setActiveTab('offers')}
          >
            <Tag size={18} />
            <span>Angebote & Banners ({offers.length})</span>
          </button>

          <button 
            className={`admin-nav-item ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => setActiveTab('menu')}
          >
            <UtensilsCrossed size={18} />
            <span>Speisen & Bilder Editor</span>
          </button>

          <button 
            className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Umsatz & Kennzahlen</span>
          </button>

          <button 
            className={`admin-nav-item ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            <User size={18} />
            <span>Kunden ({allUsers.length})</span>
          </button>

          <button 
            className={`admin-nav-item ${activeTab === 'newsletter' ? 'active' : ''}`}
            onClick={() => setActiveTab('newsletter')}
          >
            <Mail size={18} />
            <span>Newsletter ({newsletterSubscribers?.length || 0})</span>
          </button>
        </aside>

        {/* Main Content Pane */}
        <main className="admin-content">

          {/* TAB 1: LIVE ORDERS */}
          {activeTab === 'orders' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.8rem', color: '#ffffff', margin: 0 }}>
                  Eingegangene Bestellungen
                </h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span className="status-badge eingegangen">Neu: {orders.filter(o => o.status === 'eingegangen').length}</span>
                  <span className="status-badge zubereitung">In Küche: {orders.filter(o => o.status === 'zubereitung').length}</span>
                  <span className="status-badge zustellung">Unterwegs: {orders.filter(o => o.status === 'zustellung').length}</span>
                </div>
              </div>

              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID & Uhrzeit</th>
                      <th>Kunde & Lieferadresse</th>
                      <th>Bestellte Artikel</th>
                      <th>Gesamtsumme</th>
                      <th>Zahlungsart</th>
                      <th>Status</th>
                      <th>Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td>
                          <strong style={{ color: '#cfa670', display: 'block', fontSize: '1rem' }}>{order.id}</strong>
                          <span style={{ fontSize: '0.8rem', color: '#888' }}>{order.time} Uhr ({order.date})</span>
                        </td>
                        <td>
                          <strong style={{ color: '#fff', display: 'block' }}>{order.customer}</strong>
                          <span style={{ fontSize: '0.8rem', color: '#aaa', display: 'block' }}>{order.address}</span>
                          <span style={{ fontSize: '0.8rem', color: '#cfa670' }}>Tel: {order.phone}</span>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem' }}>
                            {order.items.map((it, idx) => (
                              <div key={idx}>
                                {typeof it === 'string' ? it : `${it.quantity || 1}x ${it.name} (${(it.price * (it.quantity || 1)).toFixed(2).replace('.', ',')} €)`}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td>
                          <strong style={{ fontSize: '1.1rem', color: '#ffffff' }}>{(order.total || 0).toFixed(2).replace('.', ',')} €</strong>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.85rem', color: '#cfa670', background: 'rgba(207,166,112,0.1)', padding: '4px 8px', borderRadius: '6px' }}>
                            {order.payment}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${order.status}`}>
                            {order.status === 'eingegangen' && 'Eingegangen'}
                            {order.status === 'zubereitung' && 'In Zubereitung'}
                            {order.status === 'zustellung' && 'In Zustellung'}
                            {order.status === 'erledigt' && 'Geliefert'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {order.status === 'eingegangen' && (
                              <button className="admin-btn" style={{ background: '#3b82f6', color: '#fff' }} onClick={() => updateOrderStatus(order.id, 'zubereitung')}>
                                Zubereitung
                              </button>
                            )}
                            {order.status === 'zubereitung' && (
                              <button className="admin-btn" style={{ background: '#a855f7', color: '#fff' }} onClick={() => updateOrderStatus(order.id, 'zustellung')}>
                                In Zustellung
                              </button>
                            )}
                            {order.status === 'zustellung' && (
                              <button className="admin-btn" style={{ background: '#22c55e', color: '#fff' }} onClick={() => updateOrderStatus(order.id, 'erledigt')}>
                                Erledigt
                              </button>
                            )}
                            <button className="admin-btn" onClick={() => setSelectedOrderDetails(order)} title="Details & Bon">
                              <Printer size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 1.5: CUSTOMERS */}
          {activeTab === 'customers' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.8rem', color: '#ffffff', margin: 0 }}>
                  Registrierte Kunden
                </h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span className="status-badge" style={{ background: 'rgba(207,166,112,0.15)', color: '#cfa670', border: '1px solid rgba(207,166,112,0.3)' }}>
                    Gesamt: {allUsers.length}
                  </span>
                </div>
              </div>

              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>E-Mail Adresse</th>
                      <th>Registrierungsdatum</th>
                      <th>Verifiziert</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: '#888', padding: '30px' }}>
                          Noch keine Kunden registriert.
                        </td>
                      </tr>
                    ) : (
                      allUsers.map((user, idx) => (
                        <tr key={idx}>
                          <td>
                            <strong style={{ color: '#fff', display: 'block', fontSize: '1rem' }}>{user.name}</strong>
                          </td>
                          <td>
                            <span style={{ color: '#aaa' }}>{user.email}</span>
                          </td>
                          <td>
                            <span style={{ color: '#cfa670' }}>{user.joined}</span>
                          </td>
                          <td>
                            {user.isVerified ? (
                              <CheckCircle size={16} color="#22c55e" title="Verifiziert" />
                            ) : (
                              <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>Nein</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 1.7: NEWSLETTER */}
          {activeTab === 'newsletter' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <div>
                  <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.8rem', color: '#ffffff', margin: 0 }}>
                    Newsletter-Abonnenten
                  </h2>
                  <p style={{ color: '#888', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                    Alle Kunden, die den VIP King-Club abonniert haben.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span className="status-badge" style={{ background: 'rgba(207,166,112,0.15)', color: '#cfa670', border: '1px solid rgba(207,166,112,0.3)' }}>
                    Gesamt: {newsletterSubscribers?.length || 0}
                  </span>
                </div>
              </div>

              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>E-Mail Adresse</th>
                      <th>Anmeldedatum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!newsletterSubscribers || newsletterSubscribers.length === 0 ? (
                      <tr>
                        <td colSpan="2" style={{ textAlign: 'center', color: '#888', padding: '30px' }}>
                          Noch keine Newsletter-Abonnenten.
                        </td>
                      </tr>
                    ) : (
                      newsletterSubscribers.map((sub, idx) => (
                        <tr key={idx}>
                          <td>
                            <strong style={{ color: '#fff', fontSize: '1rem' }}>{sub.email}</strong>
                          </td>
                          <td>
                            <span style={{ color: '#cfa670' }}>{sub.date}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: OFFERS MANAGER */}
          {activeTab === 'offers' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <div>
                  <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.8rem', color: '#ffffff', margin: 0 }}>
                    Angebote & Banners (Live auf Startseite)
                  </h2>
                  <p style={{ color: '#888', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                    Hier erstellte Angebote erscheinen direkt oben auf der Home-Seite für alle Kunden.
                  </p>
                </div>

                <button 
                  className="admin-btn" 
                  style={{ background: '#cfa670', color: '#000', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px' }}
                  onClick={() => setShowNewOfferModal(true)}
                >
                  <Plus size={18} /> Neues Angebot Erstellen
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
                {offers.map(offer => (
                  <div key={offer.id} style={{ background: '#121312', border: '1px solid rgba(207,166,112,0.3)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {offer.image && (
                      <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                        <img src={offer.image} alt={offer.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span style={{ position: 'absolute', top: '12px', right: '12px', background: '#cfa670', color: '#000', fontWeight: 'bold', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px' }}>
                          {offer.badge || 'DEAL'}
                        </span>
                      </div>
                    )}
                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h3 style={{ fontFamily: 'Cinzel, serif', color: '#fff', fontSize: '1.3rem', margin: '0 0 8px 0' }}>{offer.title}</h3>
                        <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>{offer.description}</p>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                        <span style={{ fontFamily: 'Cinzel, serif', color: '#cfa670', fontSize: '1.4rem', fontWeight: 'bold' }}>{offer.price}</span>
                        <button className="admin-btn" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }} onClick={() => removeOffer(offer.id)}>
                          <Trash2 size={16} /> Löschen
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MENU & IMAGE EDITOR */}
          {activeTab === 'menu' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <div>
                  <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.8rem', color: '#ffffff', margin: 0 }}>
                    Speisen & Bilder Editor
                  </h2>
                  <p style={{ color: '#888', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                    Ändere Preise, Beschreibungen & Bildpfade aller Speisen in Echtzeit.
                  </p>
                </div>

                <div style={{ position: 'relative' }}>
                  <Search size={16} color="#888" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Gericht suchen..."
                    style={{ padding: '10px 14px 10px 38px', background: '#121312', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', outline: 'none', width: '250px' }}
                  />
                </div>
              </div>

              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Bild</th>
                      <th>Gerichtsname</th>
                      <th>Kategorie</th>
                      <th>Preis</th>
                      <th>Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menu.flatMap(cat => cat.items.map(item => ({ ...item, category: cat.category })))
                      .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .slice(0, 20)
                      .map(item => (
                        <tr key={item.id}>
                          <td>
                            <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                          </td>
                          <td>
                            <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{item.name}</strong>
                            <span style={{ display: 'block', fontSize: '0.8rem', color: '#888' }}>{item.desc || 'Keine Beschreibung'}</span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.85rem', color: '#cfa670', background: 'rgba(207,166,112,0.1)', padding: '4px 8px', borderRadius: '6px' }}>{item.category}</span>
                          </td>
                          <td>
                            <strong style={{ color: '#22c55e', fontSize: '1rem' }}>{item.price}</strong>
                          </td>
                          <td>
                            <button 
                              className="admin-btn"
                              onClick={() => {
                                setEditingItem(item);
                                setEditName(item.name);
                                setEditPrice(item.price);
                                setEditDesc(item.desc || '');
                                setEditImage(item.image || '');
                              }}
                            >
                              Bearbeiten
                            </button>
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: REVENUE & ANALYTICS */}
          {activeTab === 'dashboard' && (
            <div>
              <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.8rem', color: '#ffffff', marginBottom: '25px' }}>
                Umsatz & Restaurant Kennzahlen
              </h2>

              <div className="kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-card-header">
                    <span>Gesamtumsatz (Live)</span>
                    <Euro size={18} color="#cfa670" />
                  </div>
                  <h3 className="kpi-value">{totalRevenue.toFixed(2).replace('.', ',')} €</h3>
                  <span className="kpi-trend">
                    <TrendingUp size={14} /> Berechnet aus allen echten Bestellungen
                  </span>
                </div>

                <div className="kpi-card">
                  <div className="kpi-card-header">
                    <span>Gesamt-Bestellungen</span>
                    <ShoppingBag size={18} color="#3b82f6" />
                  </div>
                  <h3 className="kpi-value">{orders.length}</h3>
                  <span style={{ fontSize: '0.8rem', color: '#aaa' }}>Live in der Datenbank</span>
                </div>

                <div className="kpi-card">
                  <div className="kpi-card-header">
                    <span>Ø Bestellwert</span>
                    <TrendingUp size={18} color="#22c55e" />
                  </div>
                  <h3 className="kpi-value">
                    {orders.length > 0 ? (totalRevenue / orders.length).toFixed(2).replace('.', ',') : '0,00'} €
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#aaa' }}>Pro Kunde</span>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL 1: CREATE NEW OFFER */}
      {showNewOfferModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#121312', border: '1px solid rgba(207,166,112,0.3)', borderRadius: '20px', padding: '35px', width: '100%', maxWidth: '500px', color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'Cinzel, serif', margin: 0, color: '#cfa670' }}>Neues Angebot Erstellen</h3>
              <button onClick={() => setShowNewOfferModal(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateOffer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px' }}>Titel des Angebots</label>
                <input type="text" required value={newOfferTitle} onChange={e => setNewOfferTitle(e.target.value)} placeholder="z.B. 2x Pizza Deal + Cola Gratis" style={{ width: '100%', padding: '12px', background: '#1a1b1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px' }}>Beschreibung</label>
                <textarea required value={newOfferDesc} onChange={e => setNewOfferDesc(e.target.value)} placeholder="Inhalt und Details des Angebots..." style={{ width: '100%', padding: '12px', background: '#1a1b1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', minHeight: '80px', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px' }}>Aktionspreis (€)</label>
                  <input type="text" required value={newOfferPrice} onChange={e => setNewOfferPrice(e.target.value)} placeholder="24,90 €" style={{ width: '100%', padding: '12px', background: '#1a1b1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px' }}>Badge Tag</label>
                  <input type="text" value={newOfferBadge} onChange={e => setNewOfferBadge(e.target.value)} placeholder="HOT DEAL" style={{ width: '100%', padding: '12px', background: '#1a1b1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px' }}>Bild URL</label>
                <input type="text" value={newOfferImage} onChange={e => setNewOfferImage(e.target.value)} style={{ width: '100%', padding: '12px', background: '#1a1b1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
              </div>

              <button type="submit" style={{ background: '#cfa670', color: '#000', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                Angebot Live Schalten
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT MENU ITEM */}
      {editingItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#121312', border: '1px solid rgba(207,166,112,0.3)', borderRadius: '20px', padding: '35px', width: '100%', maxWidth: '500px', color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'Cinzel, serif', margin: 0, color: '#cfa670' }}>Gericht Bearbeiten ({editingItem.id})</h3>
              <button onClick={() => setEditingItem(null)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveMenuItem} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px' }}>Gerichtsname</label>
                <input type="text" required value={editName} onChange={e => setEditName(e.target.value)} style={{ width: '100%', padding: '12px', background: '#1a1b1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px' }}>Preis</label>
                <input type="text" required value={editPrice} onChange={e => setEditPrice(e.target.value)} style={{ width: '100%', padding: '12px', background: '#1a1b1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px' }}>Beschreibung</label>
                <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} style={{ width: '100%', padding: '12px', background: '#1a1b1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', minHeight: '70px', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px' }}>Bild Pfad / URL</label>
                <input type="text" value={editImage} onChange={e => setEditImage(e.target.value)} style={{ width: '100%', padding: '12px', background: '#1a1b1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
              </div>

              <button type="submit" style={{ background: '#cfa670', color: '#000', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                Speichern & Live Übernehmen
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ORDER DETAILS & RECEIPT PRINT */}
      {selectedOrderDetails && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', color: '#000000', borderRadius: '16px', padding: '30px', width: '100%', maxWidth: '420px', fontFamily: 'monospace' }}>
            <div style={{ textAlign: 'center', borderBottom: '2px dashed #000', paddingBottom: '15px', marginBottom: '15px' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem' }}>PIZZA KING SCHLESWIG</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>Domziegelhof 12-14 | Tel: 04621 - 30 11 11</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>Bestell-ID: <strong>{selectedOrderDetails.id}</strong></p>
            </div>

            <div style={{ marginBottom: '15px', fontSize: '0.85rem' }}>
              <div>Kunde: <strong>{selectedOrderDetails.customer}</strong></div>
              <div>Telefon: {selectedOrderDetails.phone}</div>
              <div>Adresse: {selectedOrderDetails.address}</div>
              <div>Zahlungsart: <strong>{selectedOrderDetails.payment}</strong></div>
            </div>

            <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '10px 0', marginBottom: '15px' }}>
              {selectedOrderDetails.items.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span>{typeof it === 'string' ? it : `${it.quantity || 1}x ${it.name}`}</span>
                  <span>{typeof it === 'object' && it.price ? `${(it.price * (it.quantity || 1)).toFixed(2)} €` : ''}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '20px' }}>
              <span>GESAMTSUMME:</span>
              <span>{(selectedOrderDetails.total || 0).toFixed(2)} €</span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => window.print()} style={{ flex: 1, padding: '12px', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                🖨️ Bon Drucken
              </button>
              <button onClick={() => setSelectedOrderDetails(null)} style={{ padding: '12px 20px', background: '#ccc', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle, Trash2, Plus, Minus } from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useCart } from '../context/CartContext';
import { useAdmin } from '../context/AdminContext';
import { storeData } from '../data/storeData';
import { sendOrderConfirmationEmail } from '../services/emailService';
import './Checkout.css';

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

export default function Checkout() {
  const { cartItems, cartTotal, clearCart, removeFromCart, updateQuantity } = useCart();
  const { addOrder } = useAdmin();
  const [step, setStep] = useState(1);
  const [orderType, setOrderType] = useState('delivery'); // delivery or pickup
  const [payment, setPayment] = useState('paypal');

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [plz, setPlz] = useState('24837');
  const [city, setCity] = useState('Schleswig');

  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountError, setDiscountError] = useState('');
  
  const finalTotal = cartTotal * (1 - discountAmount / 100);

  const applyDiscount = async () => {
    setDiscountError('');
    if (!discountCode) return;
    const cleanCode = discountCode.trim().toUpperCase();

    // Client-side fallback check for KING10 or static codes
    if (cleanCode === 'KING10') {
      setDiscountAmount(10);
      return;
    }

    try {
      const { API_URL } = await import('../api');
      const res = await fetch(`${API_URL}/discount/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cleanCode })
      });
      const data = await res.json();
      if (data.success) {
        setDiscountAmount(data.discount);
      } else {
        setDiscountError(data.error || 'Ungültiger Code');
        setDiscountAmount(0);
      }
    } catch (err) {
      // If server check fails (e.g. offline/network), allow KING10 or valid pattern KING-
      if (cleanCode.startsWith('KING-')) {
        setDiscountAmount(10);
      } else {
        setDiscountError('Fehler bei der Überprüfung');
      }
    }
  };

  const handleNext = () => {
    if (cartItems.length === 0) return;
    setStep(s => s + 1);
  };
  const handlePrev = () => setStep(s => s - 1);
  const handleCheckoutComplete = () => {
    if (cartItems.length === 0) return;
    const paymentLabel = storeData.paymentMethods.find(p => p.id === payment)?.label || payment;
    const addressStr = orderType === 'delivery' ? `${street}, ${plz} ${city}` : 'Abholung im Restaurant (Domziegelhof 12-14)';
    
    const newOrder = addOrder({
      customer: customerName || 'Gast',
      customerEmail: customerEmail,
      phone: phone || 'Keine Angabe',
      address: addressStr,
      items: cartItems.map(i => ({ name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
      total: finalTotal,
      payment: paymentLabel,
      discount: discountAmount > 0 ? discountCode : null
    });

    if (newOrder.customerEmail) {
      sendOrderConfirmationEmail(newOrder.customerEmail, newOrder);
    }

    setStep(4);
    clearCart();
  };

  if (cartItems.length === 0 && step !== 4) {
    return (
      <div className="page-container container animate-fade-in" style={{ padding: '140px 20px 60px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', padding: '50px 30px' }}>
          <h1 className="text-gradient" style={{ marginBottom: '15px', fontSize: '2rem' }}>Ihr Warenkorb ist leer</h1>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '30px' }}>
            Sie haben noch keine leckeren Gerichte zu Ihrer Bestellung hinzugefügt.
          </p>
          <a href="/menu" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            Zur Speisekarte <ArrowRight size={20} />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container container animate-fade-in" style={{ padding: '120px 20px 40px' }}>
      <h1 className="text-gradient text-center" style={{ marginBottom: '10px' }}>Kasse</h1>
      <p style={{ textAlign: 'center', color: 'var(--color-primary)', marginBottom: '40px', fontSize: '0.9rem' }}>
        Unsere Lieferzeiten sind von 11-22 Uhr. Bitte Lieferzeiten beachten, wenn Sie vorbestellen möchten.
      </p>
      
      <div className="checkout-layout">
        <div className="checkout-steps glass-panel">
          
          {/* Step 1: Order Type */}
          {step === 1 && (
            <div className="step-content animate-fade-in">
              <h2>1. Lieferart wählen</h2>
              <div className="options-grid">
                <button 
                  className={`option-card ${orderType === 'delivery' ? 'active' : ''}`}
                  onClick={() => setOrderType('delivery')}
                >
                  <h3>Lieferung</h3>
                  <p>Bequem nach Hause</p>
                </button>
                <button 
                  className={`option-card ${orderType === 'pickup' ? 'active' : ''}`}
                  onClick={() => setOrderType('pickup')}
                >
                  <h3>Abholung</h3>
                  <p>Domziegelhof 12-14, Schleswig</p>
                </button>
              </div>
              <div className="step-actions">
                <button className="btn btn-primary" onClick={handleNext}>Weiter <ArrowRight size={20} className="ml-2"/></button>
              </div>
            </div>
          )}

          {/* Step 2: Address */}
          {step === 2 && (
            <div className="step-content animate-fade-in">
              <h2>2. {orderType === 'delivery' ? 'Lieferadresse' : 'Kontaktdaten'}</h2>
              <form className="checkout-form" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" required value={customerName} onChange={e => setCustomerName(e.target.value)} className="form-input" placeholder="Max Mustermann" />
                </div>
                <div className="form-group">
                  <label>E-Mail</label>
                  <input type="email" required value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="form-input" placeholder="deine@email.de" />
                </div>
                <div className="form-group">
                  <label>Telefon</label>
                  <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="form-input" placeholder="Für Rückfragen" />
                </div>
                {orderType === 'delivery' && (
                  <>
                    <div className="form-group">
                      <label>Straße & Hausnummer</label>
                      <input type="text" required value={street} onChange={e => setStreet(e.target.value)} className="form-input" placeholder="Mühlenstraße 12" />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>PLZ</label>
                        <input type="text" required value={plz} onChange={e => setPlz(e.target.value)} className="form-input" />
                      </div>
                      <div className="form-group">
                        <label>Ort</label>
                        <input type="text" required value={city} onChange={e => setCity(e.target.value)} className="form-input" />
                      </div>
                    </div>
                  </>
                )}
                <div className="step-actions split">
                  <button type="button" className="btn btn-outline" onClick={handlePrev}><ArrowLeft size={20} className="mr-2"/> Zurück</button>
                  <button type="submit" className="btn btn-primary">Weiter <ArrowRight size={20} className="ml-2"/></button>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="step-content animate-fade-in">
              <h2>3. Zahlart</h2>
              <div className="options-list">
                {storeData.paymentMethods.map(method => (
                  <label key={method.id} className={`payment-option ${payment === method.id ? 'active' : ''}`}>
                    <input type="radio" name="payment" value={method.id} checked={payment === method.id} onChange={() => setPayment(method.id)} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '600' }}>{method.label}</span>
                      {method.id === 'ec' && (
                        <small style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginTop: '2px' }}>
                          Die Zahlung erfolgt unkompliziert per mobilem Kartengerät direkt beim Lieferanten oder an der Kasse.
                        </small>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              {payment === 'paypal' ? (
                <div style={{ marginTop: '25px' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '15px' }}>
                    Klicken Sie auf den PayPal-Button, um die Zahlung im Live-Modus abzuschließen:
                  </p>
                  <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID, currency: "EUR" }}>
                    <PayPalButtons 
                      style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          purchase_units: [{
                            description: `Bestellung Pizza King Schleswig (${orderType === 'delivery' ? 'Lieferung' : 'Abholung'})`,
                            amount: {
                              currency_code: "EUR",
                              value: finalTotal.toFixed(2)
                            }
                          }]
                        });
                      }}
                      onApprove={(data, actions) => {
                        return actions.order.capture().then((details) => {
                          handleCheckoutComplete();
                        });
                      }}
                      onError={(err) => {
                        console.error("PayPal Error:", err);
                        alert("Bei der PayPal-Zahlung ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder wählen Sie eine andere Zahlungsart.");
                      }}
                    />
                  </PayPalScriptProvider>
                  <div className="step-actions" style={{ marginTop: '15px' }}>
                    <button className="btn btn-outline" onClick={handlePrev}><ArrowLeft size={20} className="mr-2"/> Zurück</button>
                  </div>
                </div>
              ) : (
                <div className="step-actions split">
                  <button className="btn btn-outline" onClick={handlePrev}><ArrowLeft size={20} className="mr-2"/> Zurück</button>
                  <button className="btn btn-primary" onClick={handleCheckoutComplete}>Zahlungspflichtig bestellen <CheckCircle size={20} className="ml-2"/></button>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="step-content animate-fade-in text-center success-step">
              <CheckCircle size={60} color="var(--color-brand-secondary)" style={{ margin: '0 auto 20px' }} />
              <h2>Vielen Dank für Ihre Bestellung!</h2>
              <p>Ihre Pizza wird nun frisch zubereitet.</p>
            </div>
          )}

        </div>

        {/* Order Summary Sidebar */}
        <aside className="order-summary glass-panel">
          <h3>Bestellübersicht</h3>
          <div className="summary-items">
            {cartItems.map(item => (
              <div key={item.id} className="summary-item">
                <div className="summary-item-info">
                  <div className="summary-item-controls">
                    <button 
                      className="qty-btn" 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      title="Menge verringern"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="summary-item-qty">{item.quantity}x</span>
                    <button 
                      className="qty-btn" 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      title="Menge erhöhen"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <span className="summary-item-name">{item.name}</span>
                </div>
                <div className="summary-item-right">
                  <span className="summary-item-price">{(item.price * item.quantity).toFixed(2).replace('.', ',')} €</span>
                  <button 
                    className="remove-item-btn" 
                    onClick={() => removeFromCart(item.id)}
                    title="Artikel entfernen"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
            {cartItems.length === 0 && (
              <div className="summary-item">
                <span className="summary-item-name" style={{ color: 'rgba(255,255,255,0.5)' }}>Ihr Warenkorb ist leer.</span>
              </div>
            )}
          </div>
          <div style={{ marginTop: '20px', marginBottom: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                placeholder="Newsletter-Code" 
                value={discountCode} 
                onChange={e => setDiscountCode(e.target.value)} 
                style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', outline: 'none' }} 
              />
              <button onClick={applyDiscount} className="bestseller-btn" style={{ padding: '10px 16px', fontSize: '0.8rem' }}>Einlösen</button>
            </div>
            {discountError && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '8px' }}>{discountError}</div>}
            {discountAmount > 0 && <div style={{ color: '#22c55e', fontSize: '0.8rem', marginTop: '8px' }}>Gutschein aktiv: -{discountAmount}%!</div>}
          </div>
          <div className="summary-total" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Gesamt</span>
              <span className="total-price">{finalTotal.toFixed(2).replace('.', ',')} €</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', textAlign: 'right', marginTop: '4px' }}>
              * Inkl. MwSt. & Pfand bei Flaschen
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}

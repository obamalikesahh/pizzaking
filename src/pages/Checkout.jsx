import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAdmin } from '../context/AdminContext';
import { storeData } from '../data/storeData';
import { sendOrderConfirmationEmail } from '../services/emailService';
import './Checkout.css';

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
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
    try {
      const { API_URL } = await import('../api');
      const res = await fetch(`${API_URL}/discount/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode })
      });
      const data = await res.json();
      if (data.success) {
        setDiscountAmount(data.discount);
      } else {
        setDiscountError(data.error || 'Ungültiger Code');
        setDiscountAmount(0);
      }
    } catch (err) {
      setDiscountError('Fehler bei der Überprüfung');
    }
  };

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);
  const handleCheckoutComplete = () => {
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

  return (
    <div className="page-container container animate-fade-in" style={{ padding: '120px 20px 40px' }}>
      <h1 className="text-gradient text-center" style={{ marginBottom: '40px' }}>Kasse</h1>
      
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
                {storeData.paymentMethods.map(method => {
                  if (orderType !== 'delivery' && method.id === 'ec') return null;
                  return (
                    <label key={method.id} className={`payment-option ${payment === method.id ? 'active' : ''}`}>
                      <input type="radio" name="payment" value={method.id} checked={payment === method.id} onChange={() => setPayment(method.id)} />
                      <span>{method.label}</span>
                    </label>
                  );
                })}
              </div>
              <div className="step-actions split">
                <button className="btn btn-outline" onClick={handlePrev}><ArrowLeft size={20} className="mr-2"/> Zurück</button>
                <button className="btn btn-primary" onClick={handleCheckoutComplete}>Zahlungspflichtig bestellen <CheckCircle size={20} className="ml-2"/></button>
              </div>
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
                <span>{item.quantity}x {item.name}</span>
                <span>{(item.price * item.quantity).toFixed(2).replace('.', ',')} €</span>
              </div>
            ))}
            {cartItems.length === 0 && (
              <div className="summary-item">
                <span>Ihr Warenkorb ist leer.</span>
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

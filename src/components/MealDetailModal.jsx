import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Check, Plus, Minus } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { getTranslation } from '../data/translations';
import './MealDetailModal.css';

const EXTRA_DRESSINGS = [
  { id: 'd1', name: 'Haus-Dressing (125 ml)', price: 1.50, image: '/mayo.jpeg' },
  { id: 'd2', name: 'Knoblauch-Dressing (125 ml)', price: 1.50, image: '/mayo.jpeg' },
  { id: 'd3', name: 'American Dressing (125 ml)', price: 1.50, image: '/mayo.jpeg' },
  { id: 'd4', name: 'Portion Sauce Hollandaise', price: 1.50, image: '/Sauce_hollandaise_in_gravy_boat_202608121901.jpeg' },
  { id: 'd5', name: 'Tsatsiki', price: 1.50, image: '/Tzatziki_served_in_ceramic_bowl_202608121901.jpeg' },
  { id: 'd6', name: 'Barbecue Sauce', price: 1.00, image: '/mayo.jpeg' },
  { id: 'd7', name: 'Remoulade', price: 1.00, image: '/mayo.jpeg' },
  { id: 'd8', name: 'Chillisauce', price: 1.00, image: '/mayo.jpeg' },
  { id: 'd9', name: 'Ketchup', price: 0.50, image: '/ketchuip.jpeg' },
  { id: 'd10', name: 'Mayo', price: 0.50, image: '/mayo.jpeg' }
];

const EXTRA_DRINKS = [
  { id: 'dr1', name: 'Coca Cola 1l', price: 2.50, image: '/cola 1l.jpeg' },
  { id: 'dr2', name: 'Fanta 1l', price: 2.50, image: '/Fanta_bottle_served_with_ice_202608121848.jpeg' },
  { id: 'dr3', name: 'Sprite 1l', price: 2.50, image: '/Sprite_bottle_with_ice_and_202608121848.jpeg' },
  { id: 'dr4', name: 'Mezzo Mix 1l', price: 2.50, image: '/Mezzo_Mix_bottle_with_ice_202608121848.jpeg' },
  { id: 'dr5', name: 'Coca Cola Light 1l', price: 2.50, image: '/cola light.jpeg' },
  { id: 'dr6', name: 'Red Bull 0,25l', price: 2.50, image: '/redbull.jpeg' },
  { id: 'dr7', name: 'Flensburger Pilsener 0,33l', price: 2.20, image: '/Flensburger_Pilsener_beer_bottle_2K_202608121849.jpeg' },
  { id: 'dr8', name: 'Flensburger Gold 0,33l', price: 2.20, image: '/flensburger gold.jpeg' },
  { id: 'dr9', name: 'Flensburger Wasser 0,33l', price: 1.80, image: '/flensburger Wasser.jpeg' }
];

const PIZZA_EXTRA_TOPPINGS = [
  { id: 't1', name: 'Extra Käse Gouda', price: 2.00, image: '/mozzarella.png' },
  { id: 't2', name: 'Sauce Hollandaise', price: 1.50, image: '/Sauce_hollandaise_in_gravy_boat_202608121901.jpeg' },
  { id: 't3', name: 'Gyros', price: 2.50, image: '/potato_wedge.png' },
  { id: 't4', name: 'Knoblauchwurst (Sucuk)', price: 2.00, image: '/ham.png' },
  { id: 't5', name: 'Dönerfleisch (Halal)', price: 2.50, image: '/champignons_beef.png' },
  { id: 't6', name: 'Ananas', price: 1.50, image: '/fresh_tomatoes.png' },
  { id: 't7', name: 'Weichkäse', price: 2.00, image: '/mozzarella_piece.png' },
  { id: 't8', name: 'Frische Champignons', price: 1.50, image: '/champignons_beef.png' },
  { id: 't9', name: 'Schinken', price: 1.50, image: '/ham.png' },
  { id: 't10', name: 'Salami', price: 1.50, image: '/prosciutto_slice.png' },
  { id: 't11', name: 'Bacon', price: 2.00, image: '/prosciutto_slice.png' },
  { id: 't12', name: 'Thunfisch', price: 2.00, image: '/champignons_beef.png' }
];

export default function MealDetailModal({ isOpen, onClose, product, addToCart }) {
  const { language } = useAdmin();
  const t = getTranslation(language);
  if (!isOpen || !product) return null;

  // Parse multi-price strings
  const parsePrices = (priceStr) => {
    if (!priceStr) return [{ label: 'Standard', price: 0, rawStr: '' }];
    
    const parts = priceStr.split('|').map(s => s.trim());
    if (parts.length === 1) {
      const p = parseFloat(parts[0].replace(',', '.').replace(/[^\d\.]/g, '')) || 0;
      return [{ label: 'Standard', price: p, rawStr: parts[0] }];
    }

    const defaultLabels = ['26 cm', '32 cm', '36 cm'];
    return parts.map((part, index) => {
      let label = defaultLabels[index] || `Größe ${index + 1}`;
      if (part.includes(':')) {
        const splitColon = part.split(':');
        label = splitColon[0].trim();
      }
      const priceVal = parseFloat(part.replace(',', '.').replace(/[^\d\.]/g, '')) || 0;
      return { label, price: priceVal, rawStr: part };
    });
  };

  const options = parsePrices(product.fullPrice || product.price);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [kaeserand, setKaeserand] = useState(false);
  const [selectedFilling, setSelectedFilling] = useState('Käse (mit Käse gefüllt)');

  // Wunschpizza State (4 Textfelder)
  const isWunschpizza = product.name.toLowerCase().includes('wunsch') || product.id === '29';
  const [wunschBelag1, setWunschBelag1] = useState('');
  const [wunschBelag2, setWunschBelag2] = useState('');
  const [wunschBelag3, setWunschBelag3] = useState('');
  const [wunschBelag4, setWunschBelag4] = useState('');

  // Selected Extra Dressings, Drinks, Toppings
  const [selectedDressings, setSelectedDressings] = useState([]);
  const [selectedDrinks, setSelectedDrinks] = useState([]);
  const [selectedExtraToppings, setSelectedExtraToppings] = useState([]);

  const isPizzabroetchen = product.name.toLowerCase().includes('pizzabrötchen') || product.name.toLowerCase().includes('pizza brötchen');
  const fillingOptions = ['Käse (mit Käse gefüllt)', 'Salami', 'Schinken', 'Thunfisch', 'Hackfleisch', 'Gyros', 'Dönerfleisch'];

  useEffect(() => {
    setSelectedOptionIndex(0);
    setKaeserand(false);
    setSelectedFilling('Käse (mit Käse gefüllt)');
    setWunschBelag1('');
    setWunschBelag2('');
    setWunschBelag3('');
    setWunschBelag4('');
    setSelectedDressings([]);
    setSelectedDrinks([]);
    setSelectedExtraToppings([]);
  }, [product]);

  const selectedOption = options[selectedOptionIndex] || options[0];

  const getKaeserandPrice = () => {
    if (!kaeserand) return 0;
    if (selectedOption.label.includes('26')) return 2.20;
    if (selectedOption.label.includes('32')) return 3.40;
    if (selectedOption.label.includes('36')) return 4.60;
    return 2.50;
  };

  // Calculate total price including all selected extras
  const extrasDressingsPrice = selectedDressings.reduce((sum, d) => sum + d.price, 0);
  const extrasDrinksPrice = selectedDrinks.reduce((sum, dr) => sum + dr.price, 0);
  const extrasToppingsPrice = selectedExtraToppings.reduce((sum, tp) => sum + tp.price, 0);

  const finalPrice = selectedOption.price + getKaeserandPrice() + extrasDressingsPrice + extrasDrinksPrice + extrasToppingsPrice;
  const isPizza = product.category === 'Pizza' || (product.imageUrl && product.imageUrl.includes('pizza')) || product.name.toLowerCase().includes('pizza');

  const toggleDressing = (item) => {
    if (selectedDressings.some(d => d.id === item.id)) {
      setSelectedDressings(selectedDressings.filter(d => d.id !== item.id));
    } else {
      setSelectedDressings([...selectedDressings, item]);
    }
  };

  const toggleDrink = (item) => {
    if (selectedDrinks.some(dr => dr.id === item.id)) {
      setSelectedDrinks(selectedDrinks.filter(dr => dr.id !== item.id));
    } else {
      setSelectedDrinks([...selectedDrinks, item]);
    }
  };

  const toggleExtraTopping = (item) => {
    if (selectedExtraToppings.some(tp => tp.id === item.id)) {
      setSelectedExtraToppings(selectedExtraToppings.filter(tp => tp.id !== item.id));
    } else {
      setSelectedExtraToppings([...selectedExtraToppings, item]);
    }
  };

  const autofillWunschBelag = (name) => {
    if (!wunschBelag1) setWunschBelag1(name);
    else if (!wunschBelag2) setWunschBelag2(name);
    else if (!wunschBelag3) setWunschBelag3(name);
    else if (!wunschBelag4) setWunschBelag4(name);
  };

  const handleAdd = () => {
    let itemName = product.name;
    if (options.length > 1) {
      itemName += ` (${selectedOption.label})`;
    }

    if (isWunschpizza) {
      const belaege = [wunschBelag1, wunschBelag2, wunschBelag3, wunschBelag4].filter(Boolean).join(', ');
      if (belaege) {
        itemName += ` - Beläge: ${belaege}`;
      }
    }

    if (isPizzabroetchen) {
      itemName += ` - Füllung: ${selectedFilling}`;
    }
    if (kaeserand) {
      itemName += ' + Käserand';
    }

    if (selectedExtraToppings.length > 0) {
      itemName += ` + Extra: ${selectedExtraToppings.map(t => t.name).join(', ')}`;
    }

    if (selectedDressings.length > 0) {
      itemName += ` + Dressing: ${selectedDressings.map(d => d.name).join(', ')}`;
    }

    if (selectedDrinks.length > 0) {
      itemName += ` + Getränk: ${selectedDrinks.map(dr => dr.name).join(', ')}`;
    }

    addToCart({
      id: `${product.id}-${selectedOptionIndex}-${Date.now()}`,
      name: itemName,
      price: finalPrice,
      imageUrl: product.imageUrl || product.image
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="q-modal-overlay">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: 'absolute', inset: 0 }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.25 }}
          className="q-modal-card"
        >
          <button className="q-modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>

          <div className="q-modal-image-header">
            <img src={product.imageUrl || product.image} alt={product.name} />
            <div className="q-modal-image-gradient"></div>
          </div>

          <div className="q-modal-body">
            <div>
              <h2 className="q-modal-title">{product.name.toUpperCase()}</h2>
              {product.description && <p className="q-modal-desc">{product.description}</p>}
            </div>

            {/* WUNSCH-PIZZA: 4 Beläge Textfelder */}
            {isWunschpizza && (
              <div className="wunschpizza-container" style={{ background: 'rgba(207, 166, 112, 0.08)', border: '1px solid rgba(207, 166, 112, 0.3)', borderRadius: '16px', padding: '20px' }}>
                <div className="q-modal-section-title" style={{ color: '#cfa670', margin: '0 0 12px 0' }}>
                  ✨ DEINE 4 WUNSCH-BELÄGE EINGEBEN
                </div>
                <p style={{ fontSize: '0.85rem', color: '#aaa', margin: '0 0 15px 0' }}>
                  Schreibe deine 4 Lieblingszutaten in die Textfelder oder klicke unten auf die Zutaten!
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#cfa670', display: 'block', marginBottom: '4px' }}>1. Belag</label>
                    <input 
                      type="text" 
                      value={wunschBelag1} 
                      onChange={e => setWunschBelag1(e.target.value)} 
                      placeholder="z.B. Salami" 
                      style={{ width: '100%', padding: '10px 14px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#cfa670', display: 'block', marginBottom: '4px' }}>2. Belag</label>
                    <input 
                      type="text" 
                      value={wunschBelag2} 
                      onChange={e => setWunschBelag2(e.target.value)} 
                      placeholder="z.B. Schinken" 
                      style={{ width: '100%', padding: '10px 14px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#cfa670', display: 'block', marginBottom: '4px' }}>3. Belag</label>
                    <input 
                      type="text" 
                      value={wunschBelag3} 
                      onChange={e => setWunschBelag3(e.target.value)} 
                      placeholder="z.B. Champignons" 
                      style={{ width: '100%', padding: '10px 14px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#cfa670', display: 'block', marginBottom: '4px' }}>4. Belag</label>
                    <input 
                      type="text" 
                      value={wunschBelag4} 
                      onChange={e => setWunschBelag4(e.target.value)} 
                      placeholder="z.B. Sauce Hollandaise" 
                      style={{ width: '100%', padding: '10px 14px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                {/* Quick Add Chips */}
                <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '8px' }}>Beliebte Zutaten zum Antippen:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {['Salami', 'Schinken', 'Champignons', 'Sauce Hollandaise', 'Gyros', 'Dönerfleisch', 'Bacon', 'Ananas', 'Mozzarella', 'Zwiebeln', 'Brokkoli', 'Thunfisch', 'Knoblauchwurst', 'Weichkäse', 'Gorgonzola'].map((name, i) => (
                    <button 
                      key={i} 
                      onClick={() => autofillWunschBelag(name)}
                      style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(207,166,112,0.2)', borderRadius: '20px', color: '#ddd', fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.borderColor = '#cfa670'}
                      onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(207,166,112,0.2)'}
                    >
                      + {name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selection */}
            {options.length > 1 && (
              <div>
                <div className="q-modal-section-title">{t.chooseSize}</div>
                <div className="q-modal-sizes-grid">
                  {options.map((opt, idx) => (
                    <div
                      key={idx}
                      className={`q-modal-size-btn ${selectedOptionIndex === idx ? 'active' : ''}`}
                      onClick={() => setSelectedOptionIndex(idx)}
                    >
                      <span className="q-modal-size-label">{opt.label}</span>
                      <span className="q-modal-size-price">{opt.price.toFixed(2).replace('.', ',')} €</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Käserand option for Pizza */}
            {isPizza && !isPizzabroetchen && (
              <div>
                <div className="q-modal-section-title">{t.extras}</div>
                <div
                  className={`q-modal-size-btn ${kaeserand ? 'active' : ''}`}
                  onClick={() => setKaeserand(!kaeserand)}
                  style={{ flexDirection: 'row', justifyContent: 'space-between', padding: '14px 20px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 4,
                      border: kaeserand ? 'none' : '1px solid rgba(255,255,255,0.3)',
                      background: kaeserand ? '#cfa670' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {kaeserand && <Check size={14} color="#000" />}
                    </div>
                    <span>{t.cheeseCrust} (+{getKaeserandPrice() > 0 ? getKaeserandPrice().toFixed(2).replace('.', ',') : (selectedOption.label.includes('36') ? '4,60' : selectedOption.label.includes('32') ? '3,40' : '2,20')} €)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Filling selection for Pizzabrötchen */}
            {isPizzabroetchen && (
              <div>
                <div className="q-modal-section-title">{t.chooseFilling}</div>
                <div className="q-modal-sizes-grid">
                  {fillingOptions.map((fill, idx) => (
                    <div
                      key={idx}
                      className={`q-modal-size-btn ${selectedFilling === fill ? 'active' : ''}`}
                      onClick={() => setSelectedFilling(fill)}
                      style={{ padding: '12px 14px', textAlign: 'center' }}
                    >
                      <span className="q-modal-size-label">{fill}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extra Pizza Toppings (Mit Aufpreis) */}
            {isPizza && (
              <div>
                <div className="q-modal-section-title">🍕 EXTRA BELÄGE (MIT AUFPREIS)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
                  {PIZZA_EXTRA_TOPPINGS.map(item => {
                    const isSelected = selectedExtraToppings.some(t => t.id === item.id);
                    return (
                      <div 
                        key={item.id}
                        onClick={() => toggleExtraTopping(item)}
                        style={{
                          background: isSelected ? 'rgba(207, 166, 112, 0.2)' : '#1a1a1a',
                          border: isSelected ? '1px solid #cfa670' : '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '12px',
                          padding: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <img src={item.image} alt={item.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: '50%' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: isSelected ? '#cfa670' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#aaa' }}>+{item.price.toFixed(2).replace('.', ',')} €</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Extra Dressings & Saucen */}
            <div>
              <div className="q-modal-section-title">🥣 EXTRA DRESSINGS / SAUCEN</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
                {EXTRA_DRESSINGS.map(item => {
                  const isSelected = selectedDressings.some(d => d.id === item.id);
                  return (
                    <div 
                      key={item.id}
                      onClick={() => toggleDressing(item)}
                      style={{
                        background: isSelected ? 'rgba(207, 166, 112, 0.2)' : '#1a1a1a',
                        border: isSelected ? '1px solid #cfa670' : '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        padding: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <img src={item.image} alt={item.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: '50%' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: isSelected ? '#cfa670' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#aaa' }}>+{item.price.toFixed(2).replace('.', ',')} €</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Extra Getränke */}
            <div>
              <div className="q-modal-section-title">🥤 EXTRA GETRÄNKE</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
                {EXTRA_DRINKS.map(item => {
                  const isSelected = selectedDrinks.some(dr => dr.id === item.id);
                  return (
                    <div 
                      key={item.id}
                      onClick={() => toggleDrink(item)}
                      style={{
                        background: isSelected ? 'rgba(207, 166, 112, 0.2)' : '#1a1a1a',
                        border: isSelected ? '1px solid #cfa670' : '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        padding: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <img src={item.image} alt={item.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: '8px' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: isSelected ? '#cfa670' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#aaa' }}>+{item.price.toFixed(2).replace('.', ',')} €</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="q-modal-footer">
              <div>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#888', display: 'block' }}>{t.totalPrice}</span>
                <span className="q-modal-final-price">{finalPrice.toFixed(2).replace('.', ',')} €</span>
              </div>
              <button className="q-modal-add-btn" onClick={handleAdd}>
                <ShoppingBag size={18} />
                {t.addToCart}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

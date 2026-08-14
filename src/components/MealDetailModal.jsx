import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Check } from 'lucide-react';
import './MealDetailModal.css';

export default function MealDetailModal({ isOpen, onClose, product, addToCart }) {
  if (!isOpen || !product) return null;

  // Parse multi-price strings (e.g. "11,40 € | 13,20 € | 17,40 €")
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

  const isPizzabroetchen = product.name.toLowerCase().includes('pizzabrötchen') || product.name.toLowerCase().includes('pizza brötchen');
  const fillingOptions = ['Käse (mit Käse gefüllt)', 'Salami', 'Schinken', 'Thunfisch', 'Hackfleisch', 'Gyros', 'Dönerfleisch'];

  useEffect(() => {
    setSelectedOptionIndex(0);
    setKaeserand(false);
    setSelectedFilling('Käse (mit Käse gefüllt)');
  }, [product]);

  const selectedOption = options[selectedOptionIndex] || options[0];

  // Käserand prices depending on size
  const getKaeserandPrice = () => {
    if (!kaeserand) return 0;
    if (selectedOption.label.includes('26')) return 2.20;
    if (selectedOption.label.includes('32')) return 3.40;
    if (selectedOption.label.includes('36')) return 4.60;
    return 2.50;
  };

  const finalPrice = selectedOption.price + getKaeserandPrice();
  const isPizza = product.category === 'Pizza' || (product.imageUrl && product.imageUrl.includes('pizza'));

  const handleAdd = () => {
    let itemName = product.name;
    if (options.length > 1) {
      itemName += ` (${selectedOption.label})`;
    }
    if (isPizzabroetchen) {
      itemName += ` - Füllung: ${selectedFilling}`;
    }
    if (kaeserand) {
      itemName += ' + Käserand';
    }

    addToCart({
      id: `${product.id}-${selectedOptionIndex}-${isPizzabroetchen ? selectedFilling : ''}-${kaeserand ? 'k' : 'n'}`,
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

            {/* Size selection */}
            {options.length > 1 && (
              <div>
                <div className="q-modal-section-title">Größe Wählen</div>
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
                <div className="q-modal-section-title">Extras</div>
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
                    <span>Käserand (+{getKaeserandPrice() > 0 ? getKaeserandPrice().toFixed(2).replace('.', ',') : (selectedOption.label.includes('36') ? '4,60' : selectedOption.label.includes('32') ? '3,40' : '2,20')} €)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Filling selection for Pizzabrötchen */}
            {isPizzabroetchen && (
              <div>
                <div className="q-modal-section-title">Füllung / Belag Wählen</div>
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

            <div className="q-modal-footer">
              <div>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#888', display: 'block' }}>Gesamtpreis</span>
                <span className="q-modal-final-price">{finalPrice.toFixed(2).replace('.', ',')} €</span>
              </div>
              <button className="q-modal-add-btn" onClick={handleAdd}>
                <ShoppingBag size={18} />
                In den Warenkorb
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

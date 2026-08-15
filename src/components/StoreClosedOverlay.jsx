import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock } from 'lucide-react';
import './StoreClosedOverlay.css';

export default function StoreClosedOverlay({ isVisible, onClose }) {
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="store-closed-overlay" onClick={onClose}>
        <motion.div 
          className="store-closed-modal"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="store-closed-image">
            <img src="/images/oven_closed.png" alt="Pizzaofen aus" />
            <div className="store-closed-gradient"></div>
            <button className="store-closed-close-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
          
          <div className="store-closed-content">
            <Clock size={32} color="#cfa670" style={{ marginBottom: '15px' }} />
            <h2 className="store-closed-title">UNSERE ÖFEN RUHEN</h2>
            <div className="store-closed-divider"></div>
            <p className="store-closed-text">
              Pizza King hat aktuell geschlossen. Die Öfen glühen morgen ab 11:00 Uhr wieder für dich, um frische Pizzen zu backen.
            </p>
            <button className="btn btn-primary" style={{ marginTop: '10px', width: '100%' }} onClick={onClose}>
              Verstanden
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

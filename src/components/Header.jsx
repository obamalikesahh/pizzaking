import React, { useState } from 'react';
import { Menu as MenuIcon, ShoppingCart, User, Globe } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAdmin } from '../context/AdminContext';
import './Header.css';

export default function Header() {
  const { cartItems } = useCart();
  const { language, setLanguage, currentUser } = useAdmin();
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(true);
  
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Translations map for Header links
  const t = {
    de: { menu: 'SPEISEKARTE', about: 'ÜBER UNS', rent: 'SAAL MIETEN', login: 'ANMELDEN', account: 'MEIN KONTO', cart: 'WARENKORB' },
    en: { menu: 'MENU', about: 'ABOUT', rent: 'RENT HALL', login: 'LOGIN', account: 'MY ACCOUNT', cart: 'CART' },
    ru: { menu: 'МЕНЮ', about: 'О НАС', rent: 'АРЕНДА ЗАЛА', login: 'ВОЙТИ', account: 'КАБИНЕТ', cart: 'КОРЗИНА' }
  }[language] || { menu: 'MENU', about: 'ABOUT', rent: 'RENT HALL', login: 'LOGIN', account: 'ACCOUNT', cart: 'CART' };

  return (
    <>
      <div style={{ background: '#ff3333', color: 'white', textAlign: 'center', padding: '8px', fontSize: '0.9rem', fontWeight: 'bold', zIndex: 2000, position: 'relative' }}>
        Pizza King hat aktuell geschlossen. Die Öfen glühen morgen ab 11:00 Uhr wieder für dich, um frische Pizzen zu backen. <br />
        <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>Täglich von 11:00 Uhr bis 22:00 Uhr GEÖFFNET</span>
      </div>
      <header className="pill-header">
      <div className="pill-container">
        
        <button 
          className="pill-menu-btn" 
          aria-label="Menu"
          onClick={() => setIsNavOpen(!isNavOpen)}
        >
          <MenuIcon size={18} />
        </button>

        <Link to="/" className="pill-brand">
          PIZZA KING
        </Link>

        {/* Mobile: Language Switcher and Cart */}
        <div className="mobile-only mobile-actions">
          <div className="lang-switcher">
            <Globe size={14} color="#cfa670" />
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="lang-select"
            >
              <option value="de">DE</option>
              <option value="en">EN</option>
              <option value="ru">RU</option>
            </select>
          </div>

          <Link to="/checkout" className="pill-link pill-cta cart-btn">
            <ShoppingCart size={14} />
            <span className="cart-text">{t.cart}</span> {totalItems > 0 && `(${totalItems})`}
          </Link>
        </div>

        <AnimatePresence initial={false}>
          {isNavOpen && (
            <motion.nav 
              className="pill-nav"
              initial={{ opacity: 0, width: 0, x: 20 }}
              animate={{ opacity: 1, width: 'auto', x: 0 }}
              exit={{ opacity: 0, width: 0, x: 20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <Link to="/menu" className="pill-link">{t.menu}</Link>
              <Link to="/about" className="pill-link">{t.about}</Link>
              <a href="https://www.festsaal-morena.de" target="_blank" rel="noopener noreferrer" className="pill-link">{t.rent}</a>
              
              {/* User Account / Login Link */}
              <Link to="/account" className="pill-link" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cfa670' }}>
                <User size={15} />
                {currentUser ? currentUser.name.split(' ')[0] : t.login}
              </Link>

              {/* Desktop: Language Switcher and Cart */}
              <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div className="lang-switcher">
                  <Globe size={14} color="#cfa670" />
                  <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)}
                    className="lang-select"
                  >
                    <option value="de">DE</option>
                    <option value="en">EN</option>
                    <option value="ru">RU</option>
                  </select>
                </div>

                <Link to="/checkout" className="pill-link pill-cta cart-btn">
                  <ShoppingCart size={14} />
                  {t.cart} {totalItems > 0 && `(${totalItems})`}
                </Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
    </>
  );
}

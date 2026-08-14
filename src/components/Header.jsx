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
    de: { menu: 'SPEISEKARTE', about: 'ÜBER UNS', login: 'ANMELDEN', account: 'MEIN KONTO', cart: 'WARENKORB' },
    en: { menu: 'MENU', about: 'ABOUT', login: 'LOGIN', account: 'MY ACCOUNT', cart: 'CART' },
    ru: { menu: 'МЕНЮ', about: 'О НАС', login: 'ВОЙТИ', account: 'КАБИНЕТ', cart: 'КОРЗИНА' }
  }[language] || { menu: 'MENU', about: 'ABOUT', login: 'LOGIN', account: 'ACCOUNT', cart: 'CART' };

  return (
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

        <AnimatePresence initial={false}>
          {isNavOpen && (
            <motion.nav 
              className="pill-nav"
              initial={{ opacity: 0, width: 0, x: 20 }}
              animate={{ opacity: 1, width: 'auto', x: 0 }}
              exit={{ opacity: 0, width: 0, x: 20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{ display: 'flex', alignItems: 'center', gap: '15px', overflow: 'hidden', whiteSpace: 'nowrap' }}
            >
              <Link to="/menu" className="pill-link">{t.menu}</Link>
              <Link to="/about" className="pill-link">{t.about}</Link>
              
              {/* User Account / Login Link */}
              <Link to="/account" className="pill-link" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cfa670' }}>
                <User size={15} />
                {currentUser ? currentUser.name.split(' ')[0] : t.login}
              </Link>

              {/* Language Switcher */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '20px' }}>
                <Globe size={14} color="#cfa670" />
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: '#ffffff', outline: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.5px' }}
                >
                  <option value="de" style={{ background: '#111', color: '#fff' }}>DE</option>
                  <option value="en" style={{ background: '#111', color: '#fff' }}>EN</option>
                  <option value="ru" style={{ background: '#111', color: '#fff' }}>RU</option>
                </select>
              </div>

              {/* Cart CTA */}
              <Link to="/checkout" className="pill-link pill-cta" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingCart size={14} />
                {t.cart} {totalItems > 0 && `(${totalItems})`}
              </Link>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

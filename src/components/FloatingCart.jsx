import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './FloatingCart.css';

export default function FloatingCart() {
  const { cartItems, cartTotal } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show floating cart on admin pages or on checkout page itself
  if (location.pathname.startsWith('/admin') || location.pathname === '/checkout') {
    return null;
  }

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="floating-cart-container animate-fade-in">
      <button 
        className="floating-cart-btn"
        onClick={() => navigate('/checkout')}
        title="Zum Warenkorb / Kasse"
        aria-label="Zum Warenkorb"
      >
        <div className="floating-cart-icon-wrapper">
          <ShoppingCart size={24} />
          {totalItems > 0 && (
            <span className="floating-cart-badge">{totalItems}</span>
          )}
        </div>
        {totalItems > 0 && (
          <span className="floating-cart-price">
            {cartTotal.toFixed(2).replace('.', ',')} €
          </span>
        )}
      </button>
    </div>
  );
}

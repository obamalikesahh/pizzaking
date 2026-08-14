import React, { createContext, useContext, useState, useEffect } from 'react';
import { menuData as defaultMenuData } from '../data/menu';

const AdminContext = createContext();

export function useAdmin() {
  return useContext(AdminContext);
}

export function AdminProvider({ children }) {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Language state: 'de', 'en', 'ru'
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('pk_lang') || 'de';
  });

  // User auth state
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('pk_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });

  // All registered users state (for admin dashboard)
  const [allUsers, setAllUsers] = useState(() => {
    const saved = localStorage.getItem('pk_all_users');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // Newsletter subscribers state
  const [newsletterSubscribers, setNewsletterSubscribers] = useState(() => {
    const saved = localStorage.getItem('pk_newsletter');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // Placed orders state (starts empty if no user orders exist)
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('pk_orders_live');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // Active Special Offers (Angebote)
  const [offers, setOffers] = useState(() => {
    const saved = localStorage.getItem('pk_offers');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: "OFFER-1",
        title: "KÖNIGLICHES WOCHENEND-ANGEBOT",
        description: "2x Pizza (32 cm nach Wahl) + 1x Flasche Coca-Cola 1l gratis!",
        badge: "HOT DEAL",
        price: "26,90 €",
        image: "/images/pizzen/pizzen%20fleisch/pizza%20king%20II.jpeg"
      }
    ];
  });

  // Custom Menu Data
  const [menu, setMenu] = useState(() => {
    const saved = localStorage.getItem('pk_menu_data');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return defaultMenuData;
  });

  // Save state
  // (Removed localStorage persistence for admin auth to require login every time)

  useEffect(() => {
    localStorage.setItem('pk_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('pk_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('pk_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('pk_newsletter', JSON.stringify(newsletterSubscribers));
  }, [newsletterSubscribers]);

  useEffect(() => {
    localStorage.setItem('pk_orders_live', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('pk_offers', JSON.stringify(offers));
  }, [offers]);

  useEffect(() => {
    localStorage.setItem('pk_menu_data', JSON.stringify(menu));
  }, [menu]);

  // Auth functions
  const login = (email, password) => {
    const envEmail = import.meta.env.VITE_ADMIN_EMAIL || 'info@pizzaking-schleswig.de';
    const envPass = import.meta.env.VITE_ADMIN_PASSWORD || 'King';

    if (email.toLowerCase() === envEmail.toLowerCase() && password === envPass) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      return { success: true, requireVerification: true, code, name: 'Admin' };
    }
    return { success: false, message: 'Ungültige Admin-E-Mail oder Passwort!' };
  };

  const verifyAdminLogin = (expectedCode, inputCode) => {
    if (expectedCode === inputCode.trim()) {
      setIsAuthenticated(true);
      return { success: true };
    }
    return { success: false, message: 'Falscher Verifizierungscode!' };
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  // User Auth functions
  const userSignUp = (email, name) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const tempUser = { email, name, verificationCode: code, isVerified: false };
    return { success: true, code, tempUser };
  };

  const userVerifyAndSetPassword = (tempUser, inputCode, password) => {
    if (tempUser && tempUser.verificationCode === inputCode.trim()) {
      const verifiedUser = { email: tempUser.email, name: tempUser.name, password, isVerified: true, joined: new Date().toLocaleDateString('de-DE') + ' ' + new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) };
      setCurrentUser(verifiedUser);
      setAllUsers(prev => [...prev, verifiedUser]);
      return { success: true };
    }
    return { success: false, message: 'Falscher Verifizierungscode!' };
  };

  const userLogin = (email, password) => {
    const foundUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (foundUser) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      return { success: true, requireVerification: true, code, tempUser: foundUser };
    }
    return { success: false, message: 'E-Mail oder Passwort nicht gefunden!' };
  };

  const userVerifyLogin = (tempUser, expectedCode, inputCode) => {
    if (expectedCode === inputCode.trim()) {
      setCurrentUser(tempUser);
      return { success: true };
    }
    return { success: false, message: 'Falscher Verifizierungscode!' };
  };

  const userLogout = () => {
    setCurrentUser(null);
  };

  // Order functions
  const addOrder = (newOrder) => {
    const orderWithId = {
      id: `${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleDateString('de-DE'),
      time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      status: 'eingegangen',
      customerEmail: newOrder.customerEmail || (currentUser ? currentUser.email : null),
      ...newOrder
    };
    setOrders(prev => [orderWithId, ...prev]);
    return orderWithId;
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const clearOrders = () => {
    setOrders([]);
  };

  // Offer functions
  const addOffer = (offer) => {
    setOffers(prev => [{ id: `OFFER-${Date.now()}`, ...offer }, ...prev]);
  };

  const removeOffer = (offerId) => {
    setOffers(prev => prev.filter(o => o.id !== offerId));
  };

  // Newsletter functions
  const addNewsletterSubscriber = (email) => {
    if (!newsletterSubscribers.some(sub => sub.email === email)) {
      setNewsletterSubscribers(prev => [{ email, date: new Date().toLocaleDateString('de-DE') + ' ' + new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) }, ...prev]);
    }
  };

  // Menu editing functions
  const updateMenuItem = (itemId, updatedFields) => {
    setMenu(prevData => prevData.map(cat => ({
      ...cat,
      items: cat.items.map(item => item.id === itemId ? { ...item, ...updatedFields } : item)
    })));
  };

  return (
    <AdminContext.Provider value={{
      isAuthenticated,
      login,
      verifyAdminLogin,
      logout,
      language,
      setLanguage,
      currentUser,
      allUsers,
      newsletterSubscribers,
      addNewsletterSubscriber,
      userSignUp,
      userVerifyAndSetPassword,
      userLogin,
      userVerifyLogin,
      userLogout,
      orders,
      addOrder,
      updateOrderStatus,
      clearOrders,
      offers,
      addOffer,
      removeOffer,
      menu,
      updateMenuItem
    }}>
      {children}
    </AdminContext.Provider>
  );
}

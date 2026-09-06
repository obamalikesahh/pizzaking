import React, { createContext, useContext, useState, useEffect } from 'react';
import { menuData as defaultMenuData } from '../data/menu';
import { API_URL } from '../api';

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
      try { const parsed = JSON.parse(saved); return Array.isArray(parsed) ? parsed : []; } catch (e) {}
    }
    return [];
  });

  // Newsletter subscribers state
  const [newsletterSubscribers, setNewsletterSubscribers] = useState(() => {
    const saved = localStorage.getItem('pk_newsletter');
    if (saved) {
      try { const parsed = JSON.parse(saved); return Array.isArray(parsed) ? parsed : []; } catch (e) {}
    }
    return [];
  });

  // Backend state
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('pk_admin_token') || null);
  const [orders, setOrders] = useState([]);
  const [offers, setOffers] = useState([]);
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    if (adminToken) {
      localStorage.setItem('pk_admin_token', adminToken);
    } else {
      localStorage.removeItem('pk_admin_token');
    }
  }, [adminToken]);

  // Fetch initial data from backend
  useEffect(() => {
    fetch(`${API_URL}/offers`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setOffers(Array.isArray(data) ? data : []))
      .catch(err => console.error("Fehler beim Laden der Angebote:", err));

    if (adminToken) {
      fetch(`${API_URL}/orders`, { 
        cache: 'no-store',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      })
        .then(res => res.json())
        .then(data => setOrders(Array.isArray(data) ? data : []))
        .catch(err => console.error("Fehler beim Laden der Bestellungen:", err));
    }

    fetch(`${API_URL}/menu`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          // Format backend data to match frontend structure
          const formattedMenu = data.map(cat => ({
            category: cat.title,
            items: cat.items.map(item => ({
              ...item,
              badges: item.badges ? item.badges.split(',') : []
            }))
          }));
          setMenu(formattedMenu);
        } else {
          // If empty, seed from default data
          seedMenu(defaultMenuData);
        }
      })
      .catch(err => {
        console.error("Fehler beim Laden der Speisekarte:", err);
        setMenu(defaultMenuData); // Fallback
      });
  }, []);

  const seedMenu = async (menuData) => {
    try {
      await fetch(`${API_URL}/menu/seed`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ menu: menuData })
      });
      setMenu(menuData);
    } catch (err) {
      console.error("Fehler beim Seeden:", err);
    }
  };

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

  // Auth functions
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setAdminToken(data.token);
        setIsAuthenticated(true);
        
        // Fetch orders now that we're admin
        fetch(`${API_URL}/orders`, { 
          cache: 'no-store',
          headers: { 'Authorization': `Bearer ${data.token}` }
        })
          .then(r => r.json())
          .then(ordersData => setOrders(Array.isArray(ordersData) ? ordersData : []))
          .catch(err => console.error(err));
          
        return { success: true };
      }
      return { success: false, message: data.error || 'Ungültige Admin-E-Mail oder Passwort!' };
    } catch (err) {
      return { success: false, message: 'Serverfehler bei der Anmeldung' };
    }
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
    setAdminToken(null);
  };

  // User Auth functions
  const userSignUp = (email, name, address) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const tempUser = { email, name, address, verificationCode: code, isVerified: false };
    return { success: true, code, tempUser };
  };

  const userVerifyAndSetPassword = (tempUser, inputCode, password) => {
    if (tempUser && String(tempUser.verificationCode) === String(inputCode).trim()) {
      const verifiedUser = { email: tempUser.email, name: tempUser.name, address: tempUser.address, password, isVerified: true, joined: new Date().toLocaleDateString('de-DE') + ' ' + new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) };
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
    if (String(expectedCode) === String(inputCode).trim()) {
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

    // Automatically deduct stock for items that have tracked stock
    if (newOrder.items && Array.isArray(newOrder.items)) {
      setMenu(prevMenu => {
        return prevMenu.map(cat => ({
          ...cat,
          items: cat.items.map(item => {
            // Find if item was ordered
            const orderedItem = newOrder.items.find(oi => {
              if (oi.id && String(oi.id).startsWith(String(item.id))) return true;
              if (oi.name && oi.name.toLowerCase().includes(item.name.toLowerCase())) return true;
              return false;
            });

            if (orderedItem && item.stock !== undefined && item.stock !== null) {
              const qty = orderedItem.quantity || 1;
              const newStock = Math.max(0, Number(item.stock) - qty);
              return {
                ...item,
                stock: newStock,
                isSoldOut: newStock <= 0 ? true : item.isSoldOut
              };
            }
            return item;
          })
        }));
      });
    }

    return orderWithId;
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error("Fehler beim Update des Bestellstatus:", err);
    }
  };

  const clearOrders = () => {
    setOrders([]);
  };

  // Offer functions
  const addOffer = async (offer) => {
    try {
      const res = await fetch(`${API_URL}/offers`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(offer)
      });
      if (res.ok) {
        const newOffer = await res.json();
        setOffers(prev => [newOffer, ...prev]);
      }
    } catch (err) {
      console.error("Fehler beim Hinzufügen:", err);
    }
  };

  const removeOffer = async (offerId) => {
    try {
      const res = await fetch(`${API_URL}/offers/${offerId}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        setOffers(prev => prev.filter(o => o.id !== offerId));
      }
    } catch (err) {
      console.error("Fehler beim Löschen:", err);
    }
  };

  // Newsletter functions
  const addNewsletterSubscriber = (email) => {
    if (!newsletterSubscribers.some(sub => sub.email === email)) {
      setNewsletterSubscribers(prev => [{ email, date: new Date().toLocaleDateString('de-DE') + ' ' + new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) }, ...prev]);
    }
  };

  // Menu editing functions
  const updateMenuItem = async (itemId, updatedFields) => {
    const fieldsToUpdate = { ...updatedFields };
    if (fieldsToUpdate.stock !== undefined && fieldsToUpdate.stock !== null && fieldsToUpdate.stock !== '') {
      const stockNum = parseInt(fieldsToUpdate.stock, 10);
      fieldsToUpdate.stock = isNaN(stockNum) ? null : stockNum;
      if (fieldsToUpdate.stock !== null && fieldsToUpdate.stock <= 0) {
        fieldsToUpdate.isSoldOut = true;
      }
    } else if (fieldsToUpdate.stock === '') {
      fieldsToUpdate.stock = null;
    }

    try {
      const res = await fetch(`${API_URL}/menu/item/${itemId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(fieldsToUpdate)
      });
      if (res.ok) {
        setMenu(prevData => prevData.map(cat => ({
          ...cat,
          items: cat.items.map(item => item.id === itemId ? { ...item, ...fieldsToUpdate } : item)
        })));
      } else {
        setMenu(prevData => prevData.map(cat => ({
          ...cat,
          items: cat.items.map(item => item.id === itemId ? { ...item, ...fieldsToUpdate } : item)
        })));
      }
    } catch (err) {
      console.error("Fehler beim Update des Menü-Artikels:", err);
      // Fallback state update
      setMenu(prevData => prevData.map(cat => ({
        ...cat,
        items: cat.items.map(item => item.id === itemId ? { ...item, ...fieldsToUpdate } : item)
      })));
    }
  };

  const bulkUpdatePrices = async (itemIds, newPrice) => {
    const formattedPrice = newPrice.includes('€') ? newPrice : `${newPrice} €`;
    const idSet = new Set(itemIds.map(String));

    // Update state immediately in real time across the app
    setMenu(prevData => prevData.map(cat => ({
      ...cat,
      items: cat.items.map(item => idSet.has(String(item.id)) ? { ...item, price: formattedPrice } : item)
    })));

    // Send backend requests for each item
    try {
      await Promise.all(itemIds.map(id => 
        fetch(`${API_URL}/menu/item/${id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify({ price: formattedPrice })
        }).catch(e => console.error("Bulk update item error", id, e))
      ));
    } catch (err) {
      console.error("Fehler beim Bulk Price Update:", err);
    }
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
      updateMenuItem,
      bulkUpdatePrices
    }}>
      {children}
    </AdminContext.Provider>
  );
}

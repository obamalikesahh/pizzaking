import React, { createContext, useContext, useState, useEffect } from 'react';
import { menuData as defaultMenuData } from '../data/menu';
import { API_URL } from '../api';

const AdminContext = createContext();

export function useAdmin() {
  return useContext(AdminContext);
}

export function AdminProvider({ children }) {
  // Auth state - require password login on page reload / navigation
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

  // Blacklisted/Banned emails list
  const [blacklistedEmails, setBlacklistedEmails] = useState(() => {
    const saved = localStorage.getItem('pk_blacklisted_emails');
    if (saved) {
      try { const parsed = JSON.parse(saved); return Array.isArray(parsed) ? parsed : []; } catch (e) {}
    }
    return [];
  });

  // Backend state
  const [adminToken, setAdminToken] = useState(null);
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('pk_orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });
  const [offers, setOffers] = useState([]);
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    localStorage.setItem('pk_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('pk_blacklisted_emails', JSON.stringify(blacklistedEmails));
  }, [blacklistedEmails]);

  // Fetch initial data & 5-Second Auto-Polling for live orders while logged in
  useEffect(() => {
    fetch(`${API_URL}/offers`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setOffers(Array.isArray(data) ? data : []))
      .catch(err => console.error("Fehler beim Laden der Angebote:", err));

    fetch(`${API_URL}/menu`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const formattedMenu = data.map(cat => ({
            category: cat.title,
            items: cat.items.map(item => ({
              ...item,
              badges: item.badges ? item.badges.split(',') : []
            }))
          }));
          setMenu(formattedMenu);
        } else {
          seedMenu(defaultMenuData);
        }
      })
      .catch(err => {
        console.error("Fehler beim Laden der Speisekarte:", err);
        setMenu(defaultMenuData);
      });
  }, []);

  // 🔄 5-Second Auto Polling for Admin Orders, Users, Newsletter & Blacklist (active while admin is logged in)
  useEffect(() => {
    if (!isAuthenticated) return;

    const tokenHeader = adminToken && adminToken !== 'local-admin-token' 
      ? { 'Authorization': `Bearer ${adminToken}` } 
      : { 'Authorization': 'Bearer local-admin-token' };

    const pollAll = () => {
      // 1. Orders
      fetch(`${API_URL}/orders`, { cache: 'no-store', headers: tokenHeader })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setOrders(data);
        })
        .catch(err => console.error("Auto-Polling Fehler (Bestellungen):", err));

      // 2. All Users
      fetch(`${API_URL}/admin/users`, { cache: 'no-store', headers: tokenHeader })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setAllUsers(data);
        })
        .catch(err => console.error("Auto-Polling Fehler (Benutzer):", err));

      // 3. Newsletter Subscribers
      fetch(`${API_URL}/admin/newsletter`, { cache: 'no-store', headers: tokenHeader })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setNewsletterSubscribers(data);
        })
        .catch(err => console.error("Auto-Polling Fehler (Newsletter):", err));

      // 4. Blacklist
      fetch(`${API_URL}/admin/blacklist`, { cache: 'no-store', headers: tokenHeader })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setBlacklistedEmails(data);
        })
        .catch(err => console.error("Auto-Polling Fehler (Blacklist):", err));
    };

    pollAll();
    const interval = setInterval(pollAll, 5000); // 5 seconds live polling
    return () => clearInterval(interval);
  }, [adminToken, isAuthenticated]);

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

  // Blacklist helper
  const isEmailBlacklisted = (email) => {
    if (!email) return false;
    const clean = email.trim().toLowerCase();
    return blacklistedEmails.some(b => b.toLowerCase() === clean);
  };

  const toggleBlacklistEmail = async (email) => {
    if (!email) return;
    const clean = email.trim().toLowerCase();
    setBlacklistedEmails(prev => {
      if (prev.some(b => b.toLowerCase() === clean)) {
        return prev.filter(b => b.toLowerCase() !== clean);
      } else {
        return [...prev, clean];
      }
    });

    try {
      const tokenHeader = adminToken && adminToken !== 'local-admin-token' 
        ? { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' } 
        : { 'Authorization': 'Bearer local-admin-token', 'Content-Type': 'application/json' };
      await fetch(`${API_URL}/admin/blacklist/toggle`, {
        method: 'POST',
        headers: tokenHeader,
        body: JSON.stringify({ email: clean })
      });
    } catch (err) {
      console.error("Fehler beim Blacklist-Toggle:", err);
    }
  };

  // Auth functions
  const login = async (email, password) => {
    const envEmail = (import.meta.env.VITE_ADMIN_EMAIL || process.env.VITE_ADMIN_EMAIL || '').toLowerCase();
    const envPass = import.meta.env.VITE_ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD || '';
    
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
        return { success: true };
      }
    } catch (err) {
      console.warn("Backend admin login failed, checking local credentials:", err);
    }

    if (envEmail && envPass && email.trim().toLowerCase() === envEmail && password === envPass) {
      setIsAuthenticated(true);
      setAdminToken('local-admin-token');
      return { success: true };
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
    setAdminToken(null);
  };

  // User Auth functions (Synchronized with Neon PostgreSQL)
  const userSignUp = (email, name, address) => {
    if (isEmailBlacklisted(email)) {
      return { success: false, message: 'Registrierung fehlgeschlagen: Dieses Konto / E-Mail wurde gesperrt.' };
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const tempUser = { email, name, address, verificationCode: code, isVerified: false };
    return { success: true, code, tempUser };
  };

  const userVerifyAndSetPassword = async (tempUser, inputCode, password) => {
    if (tempUser && isEmailBlacklisted(tempUser.email)) {
      return { success: false, message: 'Dieses Konto wurde gesperrt.' };
    }
    if (tempUser && String(tempUser.verificationCode) === String(inputCode).trim()) {
      try {
        const res = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: tempUser.name,
            email: tempUser.email,
            password: password,
            address: tempUser.address
          })
        });
        const data = await res.json();
        if (!res.ok) {
          return { success: false, message: data.error || 'Registrierung fehlgeschlagen' };
        }
        
        if (data.token) {
          localStorage.setItem('pk_token', data.token);
        }
        setCurrentUser(data.user);
        setAllUsers(prev => {
          const filtered = prev.filter(u => u.email.toLowerCase() !== tempUser.email.toLowerCase());
          return [data.user, ...filtered];
        });
        return { success: true };
      } catch (err) {
        return { success: false, message: 'Verbindung zum Server fehlgeschlagen: ' + err.message };
      }
    }
    return { success: false, message: 'Falscher Verifizierungscode!' };
  };

  const userLogin = async (email, password) => {
    if (isEmailBlacklisted(email)) {
      return { success: false, message: 'Ihr Kundenkonto wurde gesperrt. Bitte wenden Sie sich an den Inhaber.' };
    }
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'E-Mail oder Passwort nicht gefunden!' };
      }
      
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const tempUserWithToken = { ...data.user, token: data.token };
      return { success: true, requireVerification: true, code, tempUser: tempUserWithToken };
    } catch (err) {
      return { success: false, message: 'Verbindung zum Server fehlgeschlagen!' };
    }
  };

  const userVerifyLogin = (tempUser, expectedCode, inputCode) => {
    if (String(expectedCode) === String(inputCode).trim()) {
      if (tempUser.token) {
        localStorage.setItem('pk_token', tempUser.token);
      }
      setCurrentUser(tempUser);
      return { success: true };
    }
    return { success: false, message: 'Falscher Verifizierungscode!' };
  };

  const userRequestPasswordReset = (email) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const tempUser = { email, verificationCode: code };
    return { success: true, code, tempUser };
  };

  const userResetPassword = async (tempUser, expectedCode, inputCode, newPassword) => {
    if (String(expectedCode) !== String(inputCode).trim()) {
      return { success: false, message: 'Falscher Verifizierungscode!' };
    }
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: tempUser.email, password: newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Fehler beim Zurücksetzen des Passworts' };
      }
      return { success: true };
    } catch (err) {
      return { success: false, message: 'Server-Fehler: ' + err.message };
    }
  };

  const userLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pk_user');
    localStorage.removeItem('pk_token');
  };

  // Order functions (Synchronized worldwide with Neon PostgreSQL)
  const addOrder = (newOrder) => {
    const orderWithId = {
      id: `${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleDateString('de-DE'),
      time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      status: 'eingegangen',
      customerEmail: newOrder.customerEmail || (currentUser ? currentUser.email : null),
      userId: currentUser ? currentUser.id : null,
      ...newOrder
    };
    setOrders(prev => [orderWithId, ...prev]);

    // Sync order to backend Neon PostgreSQL
    fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderWithId)
    })
      .then(res => res.json())
      .then(resData => {
        if (resData && resData.order) {
          setOrders(prev => prev.map(o => o.id === orderWithId.id ? { ...o, ...resData.order } : o));
        }
      })
      .catch(err => console.warn('Order sync to backend failed:', err));

    // Automatically deduct stock for items that have tracked stock
    if (newOrder.items && Array.isArray(newOrder.items)) {
      setMenu(prevMenu => {
        return prevMenu.map(cat => ({
          ...cat,
          items: cat.items.map(item => {
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
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    try {
      const tokenHeader = adminToken && adminToken !== 'local-admin-token' 
        ? { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' } 
        : { 'Authorization': 'Bearer local-admin-token', 'Content-Type': 'application/json' };

      await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: tokenHeader,
        body: JSON.stringify({ status: newStatus })
      });
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

  const deleteUser = async (email) => {
    if (!email) return;
    const clean = email.trim().toLowerCase();
    setAllUsers(prev => prev.filter(u => u.email.toLowerCase() !== clean));

    try {
      const tokenHeader = adminToken && adminToken !== 'local-admin-token' 
        ? { 'Authorization': `Bearer ${adminToken}` } 
        : { 'Authorization': 'Bearer local-admin-token' };
      await fetch(`${API_URL}/admin/users/${encodeURIComponent(clean)}`, {
        method: 'DELETE',
        headers: tokenHeader
      });
    } catch (err) {
      console.error("Fehler beim Löschen des Benutzers:", err);
    }
  };

  const bulkDeleteUsers = async (emails) => {
    if (!Array.isArray(emails) || emails.length === 0) return;
    const emailSet = new Set(emails.map(e => e.trim().toLowerCase()));
    setAllUsers(prev => prev.filter(u => !emailSet.has(u.email.toLowerCase())));

    try {
      const tokenHeader = adminToken && adminToken !== 'local-admin-token' 
        ? { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' } 
        : { 'Authorization': 'Bearer local-admin-token', 'Content-Type': 'application/json' };
      await fetch(`${API_URL}/admin/users/bulk-delete`, {
        method: 'POST',
        headers: tokenHeader,
        body: JSON.stringify({ emails })
      });
    } catch (err) {
      console.error("Fehler beim Bulk-Löschen:", err);
    }
  };

  const bulkBanUsers = async (emails) => {
    if (!Array.isArray(emails) || emails.length === 0) return;
    const emailSet = new Set(emails.map(e => e.trim().toLowerCase()));
    setBlacklistedEmails(prev => {
      const existing = new Set(prev.map(b => b.toLowerCase()));
      const updated = [...prev];
      emailSet.forEach(e => {
        if (!existing.has(e)) updated.push(e);
      });
      return updated;
    });
    setAllUsers(prev => prev.map(u => emailSet.has(u.email.toLowerCase()) ? { ...u, isBanned: true } : u));

    try {
      const tokenHeader = adminToken && adminToken !== 'local-admin-token' 
        ? { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' } 
        : { 'Authorization': 'Bearer local-admin-token', 'Content-Type': 'application/json' };
      await fetch(`${API_URL}/admin/users/bulk-ban`, {
        method: 'POST',
        headers: tokenHeader,
        body: JSON.stringify({ emails })
      });
    } catch (err) {
      console.error("Fehler beim Bulk-Bannen:", err);
    }
  };

  const bulkUnbanUsers = async (emails) => {
    if (!Array.isArray(emails) || emails.length === 0) return;
    const emailSet = new Set(emails.map(e => e.trim().toLowerCase()));
    setBlacklistedEmails(prev => prev.filter(b => !emailSet.has(b.toLowerCase())));
    setAllUsers(prev => prev.map(u => emailSet.has(u.email.toLowerCase()) ? { ...u, isBanned: false } : u));

    try {
      const tokenHeader = adminToken && adminToken !== 'local-admin-token' 
        ? { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' } 
        : { 'Authorization': 'Bearer local-admin-token', 'Content-Type': 'application/json' };
      await fetch(`${API_URL}/admin/users/bulk-unban`, {
        method: 'POST',
        headers: tokenHeader,
        body: JSON.stringify({ emails })
      });
    } catch (err) {
      console.error("Fehler beim Bulk-Entbannen:", err);
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
      deleteUser,
      bulkDeleteUsers,
      bulkBanUsers,
      bulkUnbanUsers,
      blacklistedEmails,
      isEmailBlacklisted,
      toggleBlacklistEmail,
      newsletterSubscribers,
      addNewsletterSubscriber,
      userSignUp,
      userVerifyAndSetPassword,
      userLogin,
      userVerifyLogin,
      userRequestPasswordReset,
      userResetPassword,
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

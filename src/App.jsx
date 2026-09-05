import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Checkout from './pages/Checkout';
import DeliveryZones from './pages/DeliveryZones';
import Account from './pages/Account';
import Contact from './pages/Contact';
import ScrollToTop from './components/ScrollToTop';
import Admin from './pages/Admin';
import DeliveryZoneModal from './components/DeliveryZoneModal';
import JivoChat from './components/JivoChat';
import Impressum from './pages/Impressum';
import { CartProvider } from './context/CartContext';
import { AdminProvider } from './context/AdminContext';

import { useLocation } from 'react-router-dom';

function Layout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);

  return (
    <div className="app-container">
      {!isAdminRoute && <DeliveryZoneModal />}
      {!isAdminRoute && <Header />}
      
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/delivery-zones" element={<DeliveryZones />} />
          <Route path="/account" element={<Account />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/impressum" element={<Impressum />} />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <JivoChat />}
    </div>
  );
}

function App() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": "Pizza King Schleswig",
    "image": "https://www.pizzaking-schleswig.com/logo.png",
    "url": "https://www.pizzaking-schleswig.com",
    "telephone": "04621999460",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Domziegelhof 12-14",
      "addressLocality": "Schleswig",
      "postalCode": "24837",
      "addressCountry": "DE"
    },
    "servesCuisine": "Pizza",
    "priceRange": "€€",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "11:00",
        "closes": "22:00"
      }
    ]
  };

  return (
    <HelmetProvider>
      <CartProvider>
        <AdminProvider>
          <Router>
            <ScrollToTop />
            <Helmet>
              <title>Pizza King Schleswig - Lieferservice</title>
              <meta name="description" content="Essen, wie ein König bei Pizza King Schleswig. Pizza bestellen in Schleswig und Umgebung. Frische Zutaten, schnelle Lieferung." />
              <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
            </Helmet>
            
            <Layout />

          </Router>
        </AdminProvider>
      </CartProvider>
    </HelmetProvider>
  );
}
export default App;

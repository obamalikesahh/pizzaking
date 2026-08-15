import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, Quote, Mail, CheckCircle, Tag } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { getTranslation } from '../data/translations';
import { useCart } from '../context/CartContext';
import { menuData } from '../data/menu';
import MealDetailModal from '../components/MealDetailModal';
import { sendNewsletterEmail } from '../services/emailService';
import './Home.css';

export default function Home() {
  const { offers, language, addNewsletterSubscriber } = useAdmin();
  const { addToCart } = useCart();
  const t = getTranslation(language);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(() => {
    return localStorage.getItem('pk_newsletter_subscribed') === 'true';
  });
  const [createdCode, setCreatedCode] = useState(() => {
    return localStorage.getItem('pk_newsletter_code') || '';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const getProduct = (id) => {
    for (const category of menuData) {
      const item = category.items.find(p => p.id === id);
      if (item) {
        return { ...item, _category: category.category };
      }
    }
    return null;
  };

  const renderMiniMenuItem = (id, delay) => {
    const pizza = getProduct(id);
    if (!pizza) return null;
    const desc = typeof pizza.desc === 'object' ? (pizza.desc[language] || pizza.desc.de) : pizza.desc;
    
    return (
      <motion.div 
        key={id}
        className="mini-menu-item" 
        initial={{ opacity: 0, x: 20 }} 
        whileInView={{ opacity: 1, x: 0 }} 
        viewport={{ once: true }} 
        transition={{ delay }}
        onClick={() => setSelectedProduct({
          id: pizza.id,
          name: pizza.name,
          price: parseFloat(pizza.price.split(' ')[0].replace(',', '.')) || 0,
          description: desc,
          imageUrl: pizza.image,
          fullPrice: pizza.price,
          category: pizza._category
        })}
        style={{ cursor: 'pointer' }}
      >
        <div className="mini-menu-img">
          <img src={pizza.image} alt={pizza.name} />
        </div>
        <div className="mini-menu-details">
          <div className="mini-menu-title-row">
            <h4>{pizza.name.toUpperCase()}</h4>
            <span className="dotted-leader"></span>
            <span className="mini-menu-price">{pizza.price.split('|')[0].trim()}</span>
          </div>
          <p className="mini-menu-desc">{desc}</p>
        </div>
      </motion.div>
    );
  };

  const handleBestsellerClick = (id) => {
    const product = getProduct(id);
    if (product) {
      const desc = typeof product.desc === 'object' ? (product.desc[language] || product.desc.de) : product.desc;
      setSelectedProduct({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price.split(' ')[0].replace(',', '.')) || 0,
        description: desc,
        imageUrl: product.image,
        fullPrice: product.price,
        category: product._category
      });
    }
  };

  return (
    <div className="home-container">
      
      {/* 0. Hero Bento Grid */}
      <div className="bento-grid">
        <motion.div 
          className="bento-main"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <video autoPlay muted loop playsInline className="bento-main-video">
            <source src="/pizza_hero_video.mp4" type="video/mp4" />
          </video>
          <div className="bento-main-content">
            <h1 className="bento-main-title">PIZZA<br />KING</h1>
          </div>
        </motion.div>

        <div className="bento-side">
          <Link to="/menu" className="bento-link">
            <motion.div className="bento-box" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
              <img src="/cinematic_pizza.png" alt="Menu" className="bento-img" />
              <div className="bento-label" style={{ textTransform: 'uppercase' }}>{t.menu} <ArrowRight size={16} /></div>
            </motion.div>
          </Link>
          <Link to="/about" className="bento-link">
            <motion.div className="bento-box" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
              <img src="/burger_cinematic.png" alt="About Us" className="bento-img" />
              <div className="bento-label" style={{ textTransform: 'uppercase' }}>{t.about} <ArrowRight size={16} /></div>
            </motion.div>
          </Link>
          <Link to="/contact" className="bento-link">
            <motion.div className="bento-box" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }}>
              <img src="/salad_cinematic.png" alt="Contact Us" className="bento-img" />
              <div className="bento-label" style={{ textTransform: 'uppercase' }}>{t.contact} <ArrowRight size={16} /></div>
            </motion.div>
          </Link>
        </div>
      </div>
      
      <div className="scroll-indicator-container">
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <ChevronDown size={30} color="var(--color-text-muted)" />
        </motion.div>
      </div>

      {/* 1. Master 3-Column Culinary Workshop */}
      <section className="luxury-section testimonials-section" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
        <div className="section-container testimonials-bento-container">
          
          {/* Column 1: Left Images */}
          <div className="testimonials-side-images" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <img src="/pasta_cinematic.png" alt="Pasta" className="test-side-img" style={{ height: '50%', objectFit: 'cover', borderRadius: '16px' }} />
            <img src="/burger_cinematic.png" alt="Burger" className="test-side-img" style={{ height: '50%', objectFit: 'cover', borderRadius: '16px' }} />
          </div>

          {/* Column 2: Center Workshop Content */}
          <div className="workshop-center-column">
            <motion.div className="testimonials-header-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2>{t.ourCulinaryWorkshop}</h2>
              <p>{t.experienceArt}</p>
            </motion.div>

            <div className="workshop-grid">
              {/* Ingredients Column */}
              <div className="workshop-ingredients">
                <motion.div className="ingredient-card tall" initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
                  <img src="/fresh_tomatoes.png" alt="Fresh Tomatoes" className="ingredient-img" />
                  <div className="ingredient-label">{t.freshTomatoes.split('\n').map((line, i) => <React.Fragment key={i}>{line}{i === 0 && <br/>}</React.Fragment>)}</div>
                </motion.div>
                
                <div className="ingredient-col-small">
                  <motion.div className="ingredient-card small" initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                    <img src="/mozzarella.png" alt="Buffalo Mozzarella" className="ingredient-img" />
                    <div className="ingredient-label small-text">{t.buffaloMozzarella.split('\n').map((line, i) => <React.Fragment key={i}>{line}{i === 0 && <br/>}</React.Fragment>)}</div>
                  </motion.div>
                  <motion.div className="ingredient-card small" initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                    <img src="/basil.png" alt="Fresh Basil" className="ingredient-img" />
                    <div className="ingredient-label small-text">{t.freshBasil}</div>
                  </motion.div>
                </div>

                <div className="ingredient-col-small">
                  <motion.div className="ingredient-card small" initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
                    <img src="/ham.png" alt="Artisan Ham" className="ingredient-img" />
                    <div className="ingredient-label small-text">{t.artisanHam.split('\n').map((line, i) => <React.Fragment key={i}>{line}{i === 0 && <br/>}</React.Fragment>)}</div>
                  </motion.div>
                  <motion.div className="ingredient-card small" initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
                    <img src="/champignons_beef.png" alt="Champignons & Beef" className="ingredient-img" />
                    <div className="ingredient-label small-text">{t.champignonsBeef.split('\n').map((line, i) => <React.Fragment key={i}>{line}{i === 0 && <br/>}</React.Fragment>)}</div>
                  </motion.div>
                </div>
              </div>

              {/* Pizza Making Process (Video) */}
              <motion.div className="workshop-process" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <video autoPlay muted loop playsInline className="process-img">
                  <source src="/pizza.mp4" type="video/mp4" />
                </video>
                <div className="process-steps">
                  <div className="step"><strong>{t.step1}</strong> {t.step1Desc}</div>
                  <div className="step"><strong>{t.step2}</strong> {t.step2Desc}</div>
                  <div className="step"><strong>{t.step3}</strong> {t.step3Desc}</div>
                </div>
                <div style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 10 }}>
                  <Link to="/menu" className="bestseller-btn">{t.customizePizza} <ArrowRight size={14} /></Link>
                </div>
              </motion.div>
            </div>

            <div className="workshop-bottom-row" style={{ marginTop: '20px' }}>
              <motion.div className="workshop-info-box" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <img src="/potato_wedge.png" alt="Pairing" className="info-icon-img" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '50%' }} />
                <div>
                  <h4 style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)', fontSize: '1.1rem', margin: '0 0 5px 0' }}>{t.chefsSignature}</h4>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>{t.chefsSignatureDesc}</p>
                </div>
              </motion.div>
              <motion.div className="workshop-secret-box" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                <h4 style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.1rem', margin: '0 0 5px 0' }}>{t.ourDoughSecret}</h4>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>{t.ourDoughSecretDesc}</p>
              </motion.div>
            </div>
            
            <div className="test-footer-action" style={{ marginTop: '30px', textAlign: 'center' }}>
              <Link to="/about" className="bestseller-btn" style={{ padding: '12px 24px' }}>{t.visitWorkshop} <ArrowRight size={14} /></Link>
            </div>
          </div>

          {/* Column 3: Mini Menu (Right Side) */}
          <div className="workshop-right-column">
            <div className="mini-menu-header">
              <span className="diamond-line"></span>
              <h3>{t.signatures}</h3>
              <span className="diamond-line"></span>
            </div>

            <div className="mini-menu-list">
              {React.useMemo(() => {
                const allItems = menuData.flatMap(cat => cat.items);
                // Shuffle array
                const shuffled = allItems.sort(() => 0.5 - Math.random());
                // Select 8 items
                const selected = shuffled.slice(0, 8);
                return selected.map((item, idx) => renderMiniMenuItem(item.id, idx * 0.1));
              }, [menuData])}
            </div>
            
            <div style={{ textAlign: 'center', marginTop: 'auto', paddingTop: '20px' }}>
              <Link to="/menu" className="test-link" style={{ fontSize: '0.8rem', color: 'var(--color-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px', textTransform: 'uppercase', letterSpacing: '1px', border: '1px solid rgba(207, 190, 145, 0.3)', padding: '8px 16px', borderRadius: '30px' }}>{t.viewFullMenu} <ArrowRight size={14} /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* 1.5 Active Admin Offers Section */}
      {offers && offers.length > 0 && (
        <section className="luxury-section offers-section" style={{ padding: '60px 20px', background: '#0e100f', borderBottom: '1px solid rgba(207,166,112,0.2)' }}>
          <div className="section-container">
            <div style={{ textAlign: 'center', marginBottom: '35px' }}>
              <span style={{ color: '#cfa670', fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Tag size={16} /> {t.activeOffers}
              </span>
              <h2 style={{ fontFamily: 'Cinzel, serif', color: '#ffffff', fontSize: '2.2rem', margin: '8px 0 0 0' }}>{t.currentOffers}</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', maxWidth: '1100px', margin: '0 auto' }}>
              {offers.map(offer => (
                <motion.div 
                  key={offer.id}
                  style={{ background: 'linear-gradient(135deg, rgba(207, 166, 112, 0.1) 0%, rgba(18, 19, 18, 0.95) 100%)', border: '1px solid rgba(207, 166, 112, 0.3)', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  {offer.image && (
                    <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
                      <img src={offer.image} alt={offer.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {offer.badge && (
                        <span style={{ position: 'absolute', top: '15px', right: '15px', background: '#cfa670', color: '#000', fontWeight: 'bold', fontSize: '0.75rem', padding: '4px 12px', borderRadius: '20px', textTransform: 'uppercase' }}>
                          {offer.badge}
                        </span>
                      )}
                    </div>
                  )}
                  <div style={{ padding: '25px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontFamily: 'Cinzel, serif', color: '#ffffff', fontSize: '1.4rem', margin: '0 0 10px 0' }}>{offer.title}</h3>
                      <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: '1.5', margin: '0 0 20px 0' }}>{offer.description}</p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <span style={{ fontFamily: 'Cinzel, serif', color: '#cfa670', fontSize: '1.5rem', fontWeight: 'bold' }}>{offer.price}</span>
                      <Link to="/menu" className="bestseller-btn" style={{ fontSize: '0.8rem', padding: '10px 20px' }}>
                        {t.orderNow} <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 2. Bestsellers */}
      <section className="luxury-section bestsellers-section">
        <div className="section-container">
          
          <div className="bestsellers-bento">
            {/* Left Column */}
            <div className="bestsellers-left">
              <motion.div 
                className="bestsellers-header"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p className="bestsellers-subtitle">{t.popularDishes}</p>
                <h2 className="bestsellers-title">{t.bestsellers}</h2>
                <p className="bestsellers-desc">{t.bestsellersDesc}</p>
              </motion.div>
              
              <motion.div 
                className="bestseller-bento-card large-vertical" 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: 0.1 }}
                onClick={() => handleBestsellerClick("24")}
                style={{ cursor: 'pointer' }}
              >
                <img src="/images/pizzen/pizzen%20fleisch/pizza%20king%20II.jpeg" alt="Pizza King II" className="bestseller-img" />
                <div className="bestseller-content bottom-split">
                  <h3>PIZZA<br/>KING II</h3>
                  <div className="bestseller-btn">{t.orderNow} <ArrowRight size={14} /></div>
                </div>
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="bestsellers-right">
              <motion.div 
                className="bestseller-bento-card large-horizontal" 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: 0.2 }}
                onClick={() => handleBestsellerClick("168-M")}
                style={{ cursor: 'pointer' }}
              >
                <img src="/images/Burger%20Men%C3%BC/Big%20Cheeseburger%20Men%C3%BC.jpeg" onError={(e) => { e.target.onerror = null; e.target.src = '/burger_cinematic.png'; }} alt="Big Cheeseburger Menü" className="bestseller-img burger-img-offset" />
                <div className="bestseller-content top-left-content">
                  <h3>BIG CHEESEBURGER<br/>MENÜ</h3>
                  <div className="bestseller-btn">{t.orderNow} <ArrowRight size={14} /></div>
                </div>
              </motion.div>
              
              <div className="bestsellers-right-bottom">
                <motion.div 
                  className="bestseller-bento-card small-square" 
                  initial={{ opacity: 0, y: 30 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ delay: 0.3 }}
                  onClick={() => handleBestsellerClick("63")}
                  style={{ cursor: 'pointer' }}
                >
                  <img src="/images/Nudeln/maccheroni%20del%20giothonne.jpeg" alt="Maccheroni Del Ghiottone" className="bestseller-img" />
                  <div className="bestseller-content bottom-left">
                    <h3>MACCHERONI<br/>DEL GHIOTTONE</h3>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="bestseller-bento-card small-square" 
                  initial={{ opacity: 0, y: 30 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ delay: 0.4 }}
                  onClick={() => handleBestsellerClick("140")}
                  style={{ cursor: 'pointer' }}
                >
                  <img src="/images/Salate/Salad%20King.jpeg" alt="King-Grundsalat" className="bestseller-img" />
                  <div className="bestseller-content bottom-split">
                    <h3>KING<br/>GRUNDSALAT</h3>
                    <div className="bestseller-btn">{t.orderNow} <ArrowRight size={14} /></div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Testimonials Section */}
      <section className="luxury-section testimonials-section" style={{ padding: '100px 20px', background: '#0e100f' }}>
        <div className="section-container">
          <motion.div className="testimonials-header-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p style={{ color: '#cfa670', letterSpacing: '3px', textTransform: 'uppercase', fontSize: '0.85rem', marginBottom: '8px' }}>{t.whatGuestsSay}</p>
            <h2 style={{ color: '#ffffff', fontFamily: 'Cinzel, serif', fontSize: '2.5rem', letterSpacing: '2px' }}>{t.reviewsExperiences}</h2>
            <p style={{ color: '#888888', maxWidth: '600px', margin: '10px auto 40px' }}>{t.realOpinions}</p>
          </motion.div>

          <div className="testimonials-grid-new" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* Card 1 */}
            <motion.div 
              className="test-card-new text-only" 
              style={{ background: 'rgba(255,255,255,0.03)', padding: '35px', borderRadius: '20px', border: '1px solid rgba(207, 166, 112, 0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ delay: 0.1 }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <div style={{ color: '#cfa670', fontSize: '1.2rem' }}>★★★★★</div>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(207, 166, 112, 0.15)', color: '#cfa670', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(207, 166, 112, 0.3)' }}>{t.verifiedCustomer}</span>
                </div>
                <p className="test-quote" style={{ fontSize: '1.1rem', color: '#dddddd', marginBottom: '25px', fontStyle: 'italic', lineHeight: '1.6' }}>
                  "Absolut überragend! Das ist nicht einfach nur Pizza, das ist Handwerkskunst. Der Teig ist unglaublich luftig, die Zutaten frisch und hochwertig. Für mich die absolute Nummer 1 in Schleswig."
                </p>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ color: '#ffffff', fontWeight: '600', display: 'block' }}>Markus S.</span>
                  <small style={{ color: '#888888' }}>{t.regularCustomer}</small>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#cfa670', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '20px' }}>🍕 Pizza King II</span>
              </div>
            </motion.div>

            {/* Card 2 with Image */}
            <motion.div 
              className="test-card-new with-image" 
              style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(207, 166, 112, 0.2)', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ delay: 0.2 }}
            >
              <div className="test-card-content" style={{ padding: '35px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div style={{ color: '#cfa670', fontSize: '1.2rem' }}>★★★★★</div>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(207, 166, 112, 0.15)', color: '#cfa670', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(207, 166, 112, 0.3)' }}>{t.localGuide}</span>
                  </div>
                  <p className="test-quote" style={{ fontSize: '1.1rem', color: '#dddddd', marginBottom: '20px', fontStyle: 'italic', lineHeight: '1.6' }}>
                    "Wir bestellen hier regelmäßig für die ganze Familie. Die Portionen sind gigantisch, das Essen immer perfekt heiß und die Lieferung erfolgt schneller als man gucken kann. Eine absolute Empfehlung!"
                  </p>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ color: '#ffffff', fontWeight: '600', display: 'block' }}>Laura & Christian K.</span>
                    <small style={{ color: '#888888' }}>Local Guide Schleswig</small>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#cfa670', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '20px' }}>🍲 Döner Auflauf</span>
                </div>
              </div>
              <img src="/images/fladenbrote/Fladenbrot Gyros.jpeg" alt="Döner Auflauf" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
            </motion.div>

            {/* Card 3 */}
            <motion.div 
              className="test-card-new text-only" 
              style={{ background: 'rgba(255,255,255,0.03)', padding: '35px', borderRadius: '20px', border: '1px solid rgba(207, 166, 112, 0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ delay: 0.3 }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <div style={{ color: '#cfa670', fontSize: '1.2rem' }}>★★★★★</div>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(207, 166, 112, 0.15)', color: '#cfa670', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(207, 166, 112, 0.3)' }}>{t.verifiedCustomer}</span>
                </div>
                <p className="test-quote" style={{ fontSize: '1.1rem', color: '#dddddd', marginBottom: '25px', fontStyle: 'italic', lineHeight: '1.6' }}>
                  "Die Qualität des Fleisches bei den Burgern ist außergewöhnlich gut für einen Lieferdienst. Alles extrem frisch zubereitet, richtig saftig und pünktlich geliefert. Ein Highlight für jeden Feierabend!"
                </p>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ color: '#ffffff', fontWeight: '600', display: 'block' }}>Dennis B.</span>
                  <small style={{ color: '#888888' }}>{t.deliveryFan}</small>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#cfa670', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '20px' }}>🍔 Big Cheeseburger</span>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 4. About Us Section */}
      <section className="luxury-section about-section" style={{ padding: '100px 20px', background: '#070807' }}>
        <div className="section-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="about-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            
            {/* Left Column: Image with stat overlay */}
            <motion.div 
              style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(207, 166, 112, 0.2)', boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img src="/images/pizzen/pizzen%20fleisch/KING%20pizza.jpeg" alt="Pizza King Handwerkskunst" style={{ width: '100%', height: '480px', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #070807 0%, transparent 60%)' }}></div>
              
              <div style={{ position: 'absolute', bottom: '25px', left: '25px', right: '25px', display: 'flex', gap: '15px' }}>
                <div style={{ background: 'rgba(10,11,10,0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(207, 166, 112, 0.3)', padding: '14px 20px', borderRadius: '16px', flex: 1, textAlign: 'center' }}>
                  <span style={{ fontFamily: 'Cinzel, serif', color: '#cfa670', fontSize: '1.6rem', fontWeight: 'bold', display: 'block' }}>{t.yearsExperience}</span>
                  <span style={{ color: '#aaa', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{t.experience}</span>
                </div>
                <div style={{ background: 'rgba(10,11,10,0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(207, 166, 112, 0.3)', padding: '14px 20px', borderRadius: '16px', flex: 1, textAlign: 'center' }}>
                  <span style={{ fontFamily: 'Cinzel, serif', color: '#cfa670', fontSize: '1.6rem', fontWeight: 'bold', display: 'block' }}>{t.hoursDough}</span>
                  <span style={{ color: '#aaa', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{t.doughMaturation}</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Copy & Details */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p style={{ color: '#cfa670', letterSpacing: '3px', textTransform: 'uppercase', fontSize: '0.85rem', marginBottom: '10px', fontWeight: '600' }}>{t.ourHistory}</p>
              <h2 style={{ fontFamily: 'Cinzel, serif', color: '#ffffff', fontSize: '2.5rem', letterSpacing: '1px', lineHeight: '1.2', marginBottom: '25px' }}>
                {t.traditionPassion}
              </h2>
              
              <p style={{ color: '#cccccc', fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '20px' }}>
                {t.traditionDesc1}
              </p>
              
              <p style={{ color: '#888888', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '30px' }}>
                {t.traditionDesc2}
              </p>

              <div style={{ display: 'flex', gap: '30px', marginBottom: '35px', padding: '20px 0', borderY: '1px solid rgba(255,255,255,0.08)' }}>
                <div>
                  <h4 style={{ color: '#ffffff', fontSize: '1.5rem', margin: 0, fontFamily: 'Cinzel, serif' }}>50.000+</h4>
                  <span style={{ color: '#888', fontSize: '0.8rem' }}>{t.happyGuestsLabel}</span>
                </div>
                <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                <div>
                  <h4 style={{ color: '#ffffff', fontSize: '1.5rem', margin: 0, fontFamily: 'Cinzel, serif' }}>100%</h4>
                  <span style={{ color: '#888', fontSize: '0.8rem' }}>{t.freshIngredientsLabel}</span>
                </div>
              </div>

              <Link to="/about" className="bestseller-btn" style={{ padding: '14px 28px', fontSize: '0.85rem' }}>
                {t.learnMore} <ArrowRight size={16} />
              </Link>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 5. Newsletter Section */}
      <section className="luxury-section newsletter-section" style={{ padding: '80px 20px', background: '#0a0b0a' }}>
        <div className="section-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <motion.div 
            style={{ 
              background: 'linear-gradient(135deg, rgba(207, 166, 112, 0.12) 0%, rgba(20, 22, 20, 0.95) 100%)', 
              border: '1px solid rgba(207, 166, 112, 0.3)', 
              borderRadius: '24px', 
              padding: '60px 40px', 
              textAlign: 'center', 
              boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(207, 166, 112, 0.1)' 
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(207, 166, 112, 0.2)', border: '1px solid #cfa670', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#cfa670' }}>
              <Mail size={28} />
            </div>
            
            <h2 style={{ fontFamily: 'Cinzel, serif', color: '#ffffff', fontSize: '2.2rem', letterSpacing: '2px', marginBottom: '15px' }}>
              {t.getNewsletter}
            </h2>
            <p style={{ color: '#aaaaaa', maxWidth: '550px', margin: '0 auto 30px', fontSize: '1rem', lineHeight: '1.6' }}>
              {t.newsletterDesc.split('10%').map((part, index) => index === 0 ? <React.Fragment key={index}>{part}</React.Fragment> : <React.Fragment key={index}><strong style={{ color: '#cfa670' }}>10%</strong>{part}</React.Fragment>)}
            </p>

            {subscribed ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ background: 'rgba(207, 166, 112, 0.2)', border: '1px solid #cfa670', color: '#ffffff', padding: '18px 24px', borderRadius: '40px', display: 'inline-flex', alignItems: 'center', gap: '10px' }}
              >
                <CheckCircle size={20} color="#cfa670" />
                <span>Vielen Dank! E-Mail wurde gesendet. Dein Gutscheincode: <strong style={{ color: '#cfa670' }}>{createdCode || 'KING10'}</strong></span>
              </motion.div>
            ) : (
              <form 
                onSubmit={async (e) => { 
                  e.preventDefault(); 
                  if (email && !isSubmitting) { 
                    setIsSubmitting(true);
                    if (addNewsletterSubscriber) addNewsletterSubscriber(email);
                    const res = await sendNewsletterEmail(email);
                    if (res.code) {
                      setCreatedCode(res.code);
                      localStorage.setItem('pk_newsletter_code', res.code);
                      localStorage.setItem('pk_newsletter_subscribed', 'true');
                    }
                    setSubscribed(true);
                    setIsSubmitting(false);
                  } 
                }}
                style={{ display: 'flex', justifyContent: 'center', gap: '12px', maxWidth: '500px', margin: '0 auto', flexWrap: 'wrap' }}
              >
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder} 
                  style={{ flex: 1, minWidth: '240px', padding: '16px 24px', borderRadius: '40px', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', outline: 'none', fontSize: '0.95rem' }}
                />
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  style={{ background: '#cfa670', color: '#000000', border: 'none', padding: '16px 32px', borderRadius: '40px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s ease', opacity: isSubmitting ? 0.7 : 1 }}
                >
                  {isSubmitting ? 'WIRD GESENDET...' : t.subscribe}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      <MealDetailModal 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        product={selectedProduct} 
        addToCart={addToCart} 
      />
    </div>
  );
}

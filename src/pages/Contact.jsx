import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { getTranslation } from '../data/translations';
import './Contact.css';

export default function Contact() {
  const { language } = useAdmin();
  const t = getTranslation(language);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(t.reservationSuccess);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="contact-page">
      <div className="container contact-container">
        
        <motion.div 
          className="contact-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1>{t.reservation}</h1>
          <p>{t.reservationDesc}</p>
        </motion.div>

        <div className="contact-grid">
          
          {/* Info Panel */}
          <motion.div 
            className="contact-info-panel glass-panel"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2>{t.contactInfo}</h2>
            
            <div className="info-item">
              <MapPin className="info-icon" />
              <div>
                <h3>{t.address}</h3>
                <p>Domziegelhof 12-14</p>
                <p>24837 Schleswig</p>
              </div>
            </div>

            <div className="info-item">
              <Phone className="info-icon" />
              <div>
                <h3>{t.phone}</h3>
                <p>04621 / 999 460</p>
                <p>04621 / 999 461</p>
              </div>
            </div>

            <div className="info-item">
              <Mail className="info-icon" />
              <div>
                <h3>{t.email}</h3>
                <p>kontakt@pizzaking-schleswig.de</p>
              </div>
            </div>

            <div className="info-item">
              <Clock className="info-icon" />
              <div>
                <h3>{t.openingHours}</h3>
                <p>{t.dailyHours}</p>
              </div>
            </div>
          </motion.div>

          {/* Form Panel */}
          <motion.div 
            className="contact-form-panel glass-panel"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h2>{t.sendRequest}</h2>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label>{t.name}</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder={t.namePlaceholder}
                />
              </div>
              
              <div className="form-group">
                <label>{t.email}</label>
                <input 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder={t.emailPlaceholder}
                />
              </div>

              <div className="form-group">
                <label>{t.messageDetails}</label>
                <textarea 
                  required 
                  rows="4"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder={t.messagePlaceholder}
                ></textarea>
              </div>

              <button type="submit" className="contact-submit-btn">
                {t.requestReservation}
              </button>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

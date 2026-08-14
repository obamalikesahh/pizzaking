import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import './Contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your reservation request! We will confirm shortly.');
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
          <h1>Reservation</h1>
          <p>Book a table and experience the royal taste of Pizza King.</p>
        </motion.div>

        <div className="contact-grid">
          
          {/* Info Panel */}
          <motion.div 
            className="contact-info-panel glass-panel"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2>Contact Information</h2>
            
            <div className="info-item">
              <MapPin className="info-icon" />
              <div>
                <h3>Address</h3>
                <p>Domziegelhof 12-14</p>
                <p>24837 Schleswig</p>
              </div>
            </div>

            <div className="info-item">
              <Phone className="info-icon" />
              <div>
                <h3>Phone</h3>
                <p>04621 / 999 460</p>
                <p>04621 / 999 461</p>
              </div>
            </div>

            <div className="info-item">
              <Mail className="info-icon" />
              <div>
                <h3>Email</h3>
                <p>kontakt@pizzaking.com</p>
              </div>
            </div>

            <div className="info-item">
              <Clock className="info-icon" />
              <div>
                <h3>Opening Hours</h3>
                <p>Daily: 11:00 - 23:00</p>
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
            <h2>Send a Request</h2>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Your Full Name"
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="you@example.com"
                />
              </div>

              <div className="form-group">
                <label>Message / Details</label>
                <textarea 
                  required 
                  rows="4"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Date, Time, Number of Guests..."
                ></textarea>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Request Reservation
              </button>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

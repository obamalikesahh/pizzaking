import React, { useState, useEffect } from 'react';
import { storeData } from '../data/storeData';
import './DeliveryZoneModal.css';

export default function DeliveryZoneModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the user has already selected a delivery zone
    const hasSelectedZone = localStorage.getItem('selectedZone');
    if (!hasSelectedZone) {
      setIsOpen(true);
    }
  }, []);

  const handleSelectZone = (zone) => {
    localStorage.setItem('selectedZone', JSON.stringify(zone));
    setIsOpen(false);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  // Separate "Abholung" from the rest
  const pickupZone = storeData.deliveryZones.find(z => z.zip === "—");
  const deliveryZones = storeData.deliveryZones.filter(z => z.zip !== "—");

  return (
    <div className="dzm-overlay">
      <div className="dzm-backdrop" onClick={closeModal}></div>

      <div className="dzm-modal">
        <button className="dzm-close-btn" onClick={closeModal} aria-label="Close">
          <iconify-icon icon="solar:close-circle-linear" style={{ fontSize: '28px' }}></iconify-icon>
        </button>

        <div className="dzm-content custom-scrollbar">
          <div className="dzm-header">
            <h2>Für Lieferung bitte hier wählen</h2>
            <p>Um die Bestellung zügig bearbeiten zu können, wählen Sie bitte vorab hier Ihr Liefergebiet aus.</p>
          </div>

          <div className="dzm-grid">
            {deliveryZones.map((zone, index) => (
              <button 
                key={index}
                onClick={() => handleSelectZone(zone)}
                className="dzm-zone-card"
              >
                <div className="dzm-zone-info">
                  <span className="dzm-zip">{zone.zip}</span>
                  <span className="dzm-city">{zone.city}</span>
                </div>
                <div className="dzm-zone-price">
                  <span className="dzm-min-label">Mindestwert</span>
                  <span className="dzm-min-value">ab {zone.minOrder.toFixed(2).replace('.', ',')} €</span>
                </div>
              </button>
            ))}
          </div>

          <div className="dzm-pickup-section">
            <h2>Für Abholung bitte hier wählen:</h2>
            <div className="dzm-pickup-action">
              {pickupZone && (
                <button 
                  onClick={() => handleSelectZone(pickupZone)}
                  className="dzm-pickup-btn"
                >
                  <iconify-icon icon="solar:shop-linear" style={{ fontSize: '18px' }}></iconify-icon>
                  Abholen
                </button>
              )}
              <span className="dzm-pickup-price">ab 0,00 €</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

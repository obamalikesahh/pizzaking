import React, { useState, useEffect } from 'react';
import { storeData } from '../data/storeData';

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={closeModal}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
        
        {/* Close Button */}
        <button 
          onClick={closeModal}
          className="absolute top-6 right-6 text-zinc-400 hover:text-[#ff0f0f] transition-colors z-10"
          aria-label="Close"
        >
          <iconify-icon icon="solar:close-circle-linear" style={{ fontSize: '28px' }}></iconify-icon>
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto p-8 sm:p-10 flex flex-col gap-8 custom-scrollbar">
          
          {/* Header */}
          <div>
            <h2 className="text-4xl sm:text-5xl text-[#ff0f0f] tracking-tight leading-none mb-4" style={{ fontFamily: "'Mouse Memoirs', sans-serif" }}>
              Für Lieferung bitte hier wählen
            </h2>
            <p className="text-sm text-zinc-500 font-medium max-w-xl">
              Um die Bestellung zügig bearbeiten zu können, wählen Sie bitte vorab hier Ihr Liefergebiet aus.
            </p>
          </div>

          {/* Grid of Delivery Zones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {deliveryZones.map((zone, index) => (
              <button 
                key={index}
                onClick={() => handleSelectZone(zone)}
                className="flex items-center justify-between p-4 rounded-2xl border border-zinc-100 bg-zinc-50/50 hover:bg-[#ff0f0f]/5 hover:border-[#ff0f0f]/30 transition-all text-left group"
              >
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-400 font-semibold mb-1">{zone.zip}</span>
                  <span className="text-sm font-bold text-zinc-800 group-hover:text-[#ff0f0f] transition-colors">{zone.city}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold block">Mindestwert</span>
                  <span className="text-sm font-medium text-zinc-600">ab {zone.minOrder.toFixed(2).replace('.', ',')} €</span>
                </div>
              </button>
            ))}
          </div>

          {/* Abholung (Pickup) Section */}
          <div className="mt-4 pt-8 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-6 bg-[#F4EBE1] p-6 rounded-3xl">
            <h2 className="text-3xl sm:text-4xl text-[#ff0f0f] tracking-tight leading-none m-0" style={{ fontFamily: "'Mouse Memoirs', sans-serif" }}>
              Für Abholung bitte hier wählen:
            </h2>
            
            <div className="flex items-center gap-4 w-full sm:w-auto">
              {pickupZone && (
                <button 
                  onClick={() => handleSelectZone(pickupZone)}
                  className="flex-1 sm:flex-none bg-[#ff0f0f] hover:bg-red-700 text-white px-8 py-3.5 rounded-full font-semibold text-sm uppercase tracking-tight transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <iconify-icon icon="solar:shop-linear" style={{ fontSize: '18px' }}></iconify-icon>
                  Abholen
                </button>
              )}
              <span className="text-sm font-medium text-zinc-600 whitespace-nowrap">
                ab 0,00 €
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

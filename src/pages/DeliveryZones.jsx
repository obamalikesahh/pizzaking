import React from 'react';
import './DeliveryZones.css';

import { storeData } from '../data/storeData';

export default function DeliveryZones() {
  return (
    <div className="page-container container animate-fade-in">
      <div className="text-center" style={{ padding: '60px 0', marginBottom: '40px' }}>
        <h1 className="text-gradient">Liefergebiete</h1>
        <p className="text-muted">Prüfen Sie, ob wir zu Ihnen liefern und den Mindestbestellwert.</p>
      </div>

      <div className="glass-panel" style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
        <table className="delivery-table">
          <thead>
            <tr>
              <th>PLZ</th>
              <th>Ort</th>
              <th>Mindestbestellwert</th>
            </tr>
          </thead>
          <tbody>
            <tr className="highlight-row">
              <td>-</td>
              <td><strong>Abholung</strong> (Domziegelhof 12-14)</td>
              <td><strong>ab 0,00 €</strong></td>
            </tr>
            {storeData.deliveryZones.filter(z => z.zip !== "—").map((zone, index) => (
              <tr key={index}>
                <td>{zone.zip}</td>
                <td>{zone.city}</td>
                <td>ab {zone.minOrder.toFixed(2).replace('.', ',')} €</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

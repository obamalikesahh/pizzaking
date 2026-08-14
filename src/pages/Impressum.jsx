import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { getTranslation } from '../data/translations';
import './Impressum.css';

export default function Impressum() {
  const { language } = useAdmin();
  
  return (
    <div className="impressum-container">
      <div className="impressum-content">
        <h1 className="impressum-title">IMPRESSUM & DATENSCHUTZ</h1>
        
        <div className="impressum-card">
          <h2>Angaben gemäß § 5 TMG</h2>
          <p>
            <strong>PizzaKing Lieferservice & Restaurant</strong><br />
            Inh. Davit Gabrielyan<br />
            Domziegelhof 12-14<br />
            24837 Schleswig
          </p>

          <h3>Kontakt</h3>
          <p>
            Telefon: 04621 / 999 460<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;04621 / 999 461<br />
            E-Mail: kontakt@pizzaking-schleswig.de
          </p>

          <h3>Streitschlichtung</h3>
          <p>
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <br />
            <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a>.<br />
            Unsere E-Mail-Adresse finden Sie oben im Impressum.
          </p>
          <p>
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>

          <h3>Haftung für Inhalte</h3>
          <p>
            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
          </p>

          <h3>Datenschutz</h3>
          <p>
            Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung. 
          </p>
          <p>
            Die Nutzung unserer Webseite ist in der Regel ohne Angabe personenbezogener Daten möglich. Soweit auf unseren Seiten personenbezogene Daten (beispielsweise Name, Anschrift oder E-Mail-Adressen) erhoben werden, erfolgt dies, soweit möglich, stets auf freiwilliger Basis (z.B. im Rahmen einer Bestellung). Diese Daten werden ohne Ihre ausdrückliche Zustimmung nicht an Dritte weitergegeben.
          </p>
          <p>
            Wir weisen darauf hin, dass die Datenübertragung im Internet (z.B. bei der Kommunikation per E-Mail) Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der Daten vor dem Zugriff durch Dritte ist nicht möglich.
          </p>
        </div>
      </div>
    </div>
  );
}

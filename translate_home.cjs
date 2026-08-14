const fs = require('fs');
const path = require('path');

const homePath = path.join(__dirname, 'src/pages/Home.jsx');
let content = fs.readFileSync(homePath, 'utf8');

// Import translations
content = content.replace("import { useAdmin } from '../context/AdminContext';", "import { useAdmin } from '../context/AdminContext';\nimport { getTranslation } from '../data/translations';");

// Add t variable
content = content.replace("const { offers } = useAdmin();", "const { offers, language } = useAdmin();\n  const t = getTranslation(language);");

const replacements = {
  "<h2>OUR CULINARY WORKSHOP</h2>": "<h2>{t.ourCulinaryWorkshop}</h2>",
  "<p>Experience the art of authentic pizza-making</p>": "<p>{t.experienceArt}</p>",
  "FRESH<br/>TOMATOES": "{t.freshTomatoes.split('\\n').map((line, i) => <React.Fragment key={i}>{line}{i === 0 && <br/>}</React.Fragment>)}",
  "BUFFALO<br/>MOZZARELLA": "{t.buffaloMozzarella.split('\\n').map((line, i) => <React.Fragment key={i}>{line}{i === 0 && <br/>}</React.Fragment>)}",
  "FRESH BASIL": "{t.freshBasil}",
  "ARTISAN<br/>HAM": "{t.artisanHam.split('\\n').map((line, i) => <React.Fragment key={i}>{line}{i === 0 && <br/>}</React.Fragment>)}",
  "CHAMPIGNONS<br/>& BEEF": "{t.champignonsBeef.split('\\n').map((line, i) => <React.Fragment key={i}>{line}{i === 0 && <br/>}</React.Fragment>)}",
  "<strong>STEP 1:</strong> SELECT YOUR BASE": "<strong>{t.step1}</strong> {t.step1Desc}",
  "<strong>STEP 2:</strong> ADD A SAUCE": "<strong>{t.step2}</strong> {t.step2Desc}",
  "<strong>STEP 3:</strong> CHOOSE CHEESES & TOPPINGS": "<strong>{t.step3}</strong> {t.step3Desc}",
  "CUSTOMIZE YOUR PIZZA": "{t.customizePizza}",
  "CHEF'S SIGNATURE PAIRINGS": "{t.chefsSignature}",
  "Try our recommendation: Truffle Oil and San Marzano base": "{t.chefsSignatureDesc}",
  "OUR DOUGH SECRET": "{t.ourDoughSecret}",
  "A 48-hour slow fermentation process": "{t.ourDoughSecretDesc}",
  "VISIT THE FULL WORKSHOP": "{t.visitWorkshop}",
  "<h3>SIGNATURES</h3>": "<h3>{t.signatures}</h3>",
  "VIEW FULL MENU": "{t.viewFullMenu}",
  "AKTUELLER AKTIONEN & DEALS": "{t.activeOffers}",
  "AKTUELLE ANGEBOTE": "{t.currentOffers}",
  "JETZT BESTELLEN": "{t.orderNow}",
  "UNSERE BELIEBTESTEN GERICHTE": "{t.popularDishes}",
  "BESTSELLERS": "{t.bestsellers}",
  "Die Lieblingsgerichte unserer Gäste in Schleswig.": "{t.bestsellersDesc}",
  "ZUM MENÜ": "{t.toMenu}",
  "WAS UNSERE GÄSTE SAGEN": "{t.whatGuestsSay}",
  "BEWERTUNGEN & ERFAHRUNGEN": "{t.reviewsExperiences}",
  "Echte Meinungen von unseren treuen Kunden in Schleswig.": "{t.realOpinions}",
  "Verifizierter Kunde": "{t.verifiedCustomer}",
  "Google Local Guide": "{t.localGuide}",
  "Stammkunde aus Schleswig": "{t.regularCustomer}",
  "Lieferdienst Fan": "{t.deliveryFan}",
  "UNSERE GESCHICHTE": "{t.ourHistory}",
  "TRADITION & LEIDENSCHAFT FÜR SCHLESWIG": "{t.traditionPassion}",
  "Bei Pizza King am Domziegelhof in Schleswig dreht sich alles um echte Leidenschaft für gutes Essen. Wir backen unsere Pizzen nach traditionellen Rezepturen mit 48 Stunden langsam gereiftem Teig, feinstem Mozzarella und täglich frisch zubereiteten Soßen.": "{t.traditionDesc1}",
  "Ob unsere knusprigen Pizzen mit hausgemachtem Käserand, saftige Döner-Aufläufe mit Soße Hollandaise, krosse Burgermenüs oder bayerische & italienische Nudelspezialitäten – wir bringen königlichen Geschmack direkt zu dir nach Hause.": "{t.traditionDesc2}",
  "25+ Jahre": "{t.yearsExperience}",
  "Erfahrung": "{t.experience}",
  "48 Stunden": "{t.hoursDough}",
  "Teigreifung": "{t.doughMaturation}",
  "Zufriedene Gäste": "{t.happyGuestsLabel}",
  "Frische Zutaten": "{t.freshIngredientsLabel}",
  "MEHR ÜBER UNS ERFAHREN": "{t.learnMore}",
  "HOL DIR UNSEREN NEWSLETTER": "{t.getNewsletter}",
  "Abonniere jetzt den Pizza King Newsletter & erhalte <strong style={{ color: '#cfa670' }}>10% Rabatt</strong> auf deine nächste Bestellung sowie exklusive Angebote direkt per E-Mail!": "{t.newsletterDesc.split('10%').map((part, index) => index === 0 ? <React.Fragment key={index}>{part}</React.Fragment> : <React.Fragment key={index}><strong style={{ color: '#cfa670' }}>10%</strong>{part}</React.Fragment>)}",
  "ABONNIEREN": "{t.subscribe}",
  "Deine E-Mail-Adresse eingeben...": "{t.emailPlaceholder}",
  "Vielen Dank! Dein 10% Gutscheincode lautet: <strong style={{ color: '#cfa670' }}>KING10</strong>": "{t.thanksCode.split('KING10').map((part, index) => index === 0 ? <React.Fragment key={index}>{part}</React.Fragment> : <React.Fragment key={index}><strong style={{ color: '#cfa670' }}>KING10</strong>{part}</React.Fragment>)}"
};

for (const [key, value] of Object.entries(replacements)) {
  content = content.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
}

// Special case for placeholders since they are attributes
content = content.replace('placeholder="{t.emailPlaceholder}"', 'placeholder={t.emailPlaceholder}');

fs.writeFileSync(homePath, content);
console.log('Home.jsx translated.');

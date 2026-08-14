const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const products = [
  // --- PIZZA ---
  { name: '500 Margherita', description: 'mit Tomatensauce & Käse', price: 6.40, category: 'Pizza', imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80', isPopular: true },
  { name: '01 Funghi', description: 'mit frischen Champignons', price: 6.90, category: 'Pizza', imageUrl: 'https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?w=500&q=80' },
  { name: '02 Gemüse', description: 'mit verschiedenem Gemüse', price: 7.90, category: 'Pizza', imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80' },
  { name: '03 4 Käsesorten', description: 'mit Mozzarella, Gorgonzola & Gouda-Käse', price: 8.90, category: 'Pizza', imageUrl: 'https://images.unsplash.com/photo-1571066811602-716837d681de?w=500&q=80' },
  { name: '06 Mozzarella', description: 'mit frischen Tomaten', price: 8.90, category: 'Pizza', imageUrl: 'https://images.unsplash.com/photo-1604381536136-22462f007c52?w=500&q=80' },
  { name: '09 Tonno', description: 'mit Thunfisch, Zwiebeln & Paprika', price: 8.70, category: 'Pizza', imageUrl: 'https://images.unsplash.com/photo-1576458088443-04a19bb13da6?w=500&q=80', isPopular: true },
  { name: '12 Salami', description: 'mit Salami', price: 6.90, category: 'Pizza', imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80', isPopular: true },
  { name: '13 Prosciutto', description: 'mit Schinken', price: 7.00, category: 'Pizza', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80' },
  { name: '14 Salami-Prosciutto', description: 'mit Salami & Schinken', price: 7.50, category: 'Pizza', imageUrl: 'https://images.unsplash.com/photo-1541745537411-b8046f4d86eb?w=500&q=80' },
  { name: '18 Grande', description: 'mit Salami, Champignons & Peperoni', price: 8.00, category: 'Pizza', imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&q=80' },
  { name: '19 Gyros', description: 'mit Gyros & Zwiebeln, auf Wunsch mit Tzatziki', price: 8.90, category: 'Pizza', imageUrl: 'https://images.unsplash.com/photo-1555072956-7758afb20e8f?w=500&q=80', isPopular: true },
  { name: '22 Hawaii', description: 'mit Schinken & Ananas', price: 7.40, category: 'Pizza', imageUrl: 'https://images.unsplash.com/photo-1520201163981-8cc95007dd2a?w=500&q=80' },
  { name: '27A Chicken', description: 'mit Hähnchenfleisch, Brokkoli & Sauce Hollandaise', price: 9.40, category: 'Pizza', imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500&q=80' },

  // --- PIZZABRÖTCHEN ---
  { name: '34 Pizza Brötchen', description: '12 Stück mit Käse gefüllt', price: 4.60, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=500&q=80' },

  // --- CALZONE ---
  { name: '35 Calzone A', description: 'mit verschiedenem Gemüse', price: 7.90, category: 'Calzone', imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80' },
  { name: '38 Calzone D', description: 'mit Gyros, Zwiebeln & Weichkäse', price: 7.90, category: 'Calzone', imageUrl: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=500&q=80' },
  
  // --- FLADENBROTE ---
  { name: '43 Fladenbrot Standard', description: 'mit Salat, Zwiebeln & Käse', price: 5.40, category: 'Fladenbrote', imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500&q=80' },
  { name: '44 Fladenbrot Hawaii', description: 'mit Schinken & Ananas', price: 6.40, category: 'Fladenbrote', imageUrl: 'https://images.unsplash.com/photo-1481070414801-51fd732d7184?w=500&q=80' },

  // --- CROQUE ---
  { name: '51 Croque Salami', description: 'mit Gurke, Tomate, Salat & Käse dazu Sauce', price: 6.90, category: 'Croques', imageUrl: 'https://images.unsplash.com/photo-1550507992-eb63ffee0847?w=500&q=80' },
  { name: '52 Croque Schinken', description: 'mit Gurke, Tomate, Salat & Käse dazu Sauce', price: 6.90, category: 'Croques', imageUrl: 'https://images.unsplash.com/photo-1616031037009-58b2dc1e6fb3?w=500&q=80' },

  // --- PASTA ---
  { name: '57 Maccheroni', description: 'mit Spinat & Weichkäse in Sahnesauce', price: 9.10, category: 'Pasta', imageUrl: 'https://images.unsplash.com/photo-1621996316220-43a9e223b28b?w=500&q=80' },
  { name: '58 Spaghetti Napoli', description: 'mit Tomatensauce', price: 6.70, category: 'Pasta', imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&q=80' },
  { name: '59 Spaghetti Bolognese', description: 'mit Tomatensauce & Hackfleisch', price: 7.70, category: 'Pasta', imageUrl: 'https://images.unsplash.com/photo-1598866594230-a7c12756260f?w=500&q=80', isPopular: true },
  { name: '60 Spaghetti Carbonara', description: 'mit Schinken & Ei in Sahnesauce', price: 8.10, category: 'Pasta', imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500&q=80' },

  // --- REIS & AUFLAUF ---
  { name: '69 Reispfanne', description: 'vegetarisch mit Gemüse & Tomaten-Sahnesauce', price: 7.70, category: 'Reis', imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&q=80' },
  { name: '73 Broccoli-Auflauf', description: 'mit Schinken, Sahnesauce & Käse überbacken', price: 7.20, category: 'Aufläufe', imageUrl: 'https://images.unsplash.com/photo-1594589972322-6b95b16fccae?w=500&q=80' },

  // --- GYROS & GRILL ---
  { name: '80 Grundgyros', description: 'vom Schwein', price: 8.90, category: 'Gyros', imageUrl: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=500&q=80', isPopular: true },
  { name: '88 Grillteller', description: 'mit Gyros, Schnitzel, Cevapcici & Hacksteak', price: 12.90, category: 'Gyros', imageUrl: 'https://images.unsplash.com/photo-1544025162-8111f1816e81?w=500&q=80' },

  // --- FISCH & WRAPS ---
  { name: '152 Calamari Fritti', description: 'Tintenfisch frittiert mit Knoblauchsauce', price: 9.30, category: 'Fisch', imageUrl: 'https://images.unsplash.com/photo-1599335951664-8ab37ccda590?w=500&q=80' },
  { name: '105 Athen Wrap', description: 'mit Gyros, Weichkäse, Krautsalat & Tzatziki', price: 5.90, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&q=80' },

  // --- SALAT ---
  { name: '132 Grundsalat', description: 'groß, mit Eisbergsalat, Gurken, Tomaten, Mais', price: 6.50, category: 'Salate', imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80' },
  { name: '135 Chef Salat', description: 'Grundsalat mit Schinken, Käse & Ei', price: 7.90, category: 'Salate', imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&q=80', isPopular: true },

  // --- SCHNITZEL ---
  { name: '143 Paniertes Schnitzel', description: 'mit Salatbeilage & Pommes frites', price: 7.90, category: 'Schnitzel', imageUrl: 'https://images.unsplash.com/photo-1599921841143-819065a55cc6?w=500&q=80', isPopular: true },
  { name: '144A Jägerschnitzel', description: 'mit Champignonsauce', price: 9.90, category: 'Schnitzel', imageUrl: 'https://images.unsplash.com/photo-1544973347-19fcaf46d8f2?w=500&q=80', discount: 'Beliebt' },

  // --- BURGER ---
  { name: '165 Hamburger', description: 'ca. 100g Rindfleisch, Ketchup & Remoulade', price: 4.50, category: 'Burger', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80' },
  { name: '167 Cheeseburger', description: 'ca. 100g Rindfleisch, Cheddar-Käse', price: 5.10, category: 'Burger', imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&q=80', isPopular: true },
  { name: '184 Bacon Cheeseburger', description: 'mit 2 Baconstreifen, Cheddar-Käse', price: 5.90, category: 'Burger', imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500&q=80' },
  { name: '180 Crispy Chicken', description: 'Sweet Chili, Tomaten & süßer Chili-Sauce', price: 4.90, category: 'Burger', imageUrl: 'https://images.unsplash.com/photo-1615719413546-198b25453f85?w=500&q=80' },

  // --- GETRÄNKE ---
  { name: '119 Coca-Cola 1,0 L', description: 'Inkl. Pfand', price: 2.50, category: 'Getränke', imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80' },
  { name: '121 Holsten 0,5 L', description: 'Flaschenbier', price: 2.10, category: 'Getränke', imageUrl: 'https://images.unsplash.com/photo-1617260586940-058b8fbf4cda?w=500&q=80' }
];

async function main() {
  console.log('Clearing existing products...');
  await prisma.product.deleteMany({});
  
  console.log(`Seeding ${products.length} products with Unsplash direct images...`);
  for (const product of products) {
    await prisma.product.create({ data: product });
  }
  
  console.log('Seeding completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

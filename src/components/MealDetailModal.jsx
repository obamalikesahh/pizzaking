import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Check, Plus, Minus } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { getTranslation } from '../data/translations';
import { menuData } from '../data/menu';
import './MealDetailModal.css';

const EXTRA_DRINKS = [
  { id: 'dr1', name: 'Coca Cola 1l', price: 2.50, image: '/cola 1l.jpeg' },
  { id: 'dr2', name: 'Fanta 1l', price: 2.50, image: '/Fanta_bottle_served_with_ice_202608121848.jpeg' },
  { id: 'dr3', name: 'Sprite 1l', price: 2.50, image: '/Sprite_bottle_with_ice_and_202608121848.jpeg' },
  { id: 'dr4', name: 'Mezzo Mix 1l', price: 2.50, image: '/Mezzo_Mix_bottle_with_ice_202608121848.jpeg' },
  { id: 'dr5', name: 'Coca Cola Light 1l', price: 2.50, image: '/cola light.jpeg' },
  { id: 'dr6', name: 'Red Bull 0,25l', price: 2.50, image: '/redbull.jpeg' },
  { id: 'dr7', name: 'Flensburger Pilsener 0,33l', price: 2.20, image: '/Flensburger_Pilsener_beer_bottle_2K_202608121849.jpeg' },
  { id: 'dr8', name: 'Flensburger Gold 0,33l', price: 2.20, image: '/flensburger gold.jpeg' },
  { id: 'dr9', name: 'Flensburger Wasser 0,33l', price: 1.80, image: '/flensburger Wasser.jpeg' }
];

const PIZZA_EXTRA_TOPPINGS = [
  { id: 't1', name: 'Extra Käse Gouda', price: 2.00, image: '/mozzarella.png' },
  { id: 't2', name: 'Sauce Hollandaise', price: 1.50, image: '/Sauce_hollandaise_in_gravy_boat_202608121901.jpeg' },
  { id: 't3', name: 'Gyros', price: 2.50, image: '/potato_wedge.png' },
  { id: 't4', name: 'Knoblauchwurst (Sucuk)', price: 2.00, image: '/ham.png' },
  { id: 't5', name: 'Dönerfleisch (Halal)', price: 2.50, image: '/champignons_beef.png' },
  { id: 't6', name: 'Ananas', price: 1.50, image: '/fresh_tomatoes.png' },
  { id: 't7', name: 'Weichkäse', price: 2.00, image: '/mozzarella_piece.png' },
  { id: 't8', name: 'Frische Champignons', price: 1.50, image: '/champignons_beef.png' },
  { id: 't9', name: 'Schinken', price: 1.50, image: '/ham.png' },
  { id: 't10', name: 'Salami', price: 1.50, image: '/prosciutto_slice.png' },
  { id: 't11', name: 'Bacon', price: 2.00, image: '/prosciutto_slice.png' },
  { id: 't12', name: 'Thunfisch', price: 2.00, image: '/champignons_beef.png' },
  { id: 't13', name: 'Hackfleisch', price: 2.00, image: '/champignons_beef.png' },
  { id: 't14', name: 'Zwiebeln', price: 1.00, image: '/fresh_tomatoes.png' },
  { id: 't15', name: 'Paprika', price: 1.00, image: '/fresh_tomatoes.png' },
  { id: 't16', name: 'Peperoni', price: 1.00, image: '/fresh_tomatoes.png' },
  { id: 't17', name: 'Oliven', price: 1.00, image: '/fresh_tomatoes.png' },
  { id: 't18', name: 'Ei', price: 1.00, image: '/mozzarella_piece.png' },
  { id: 't19', name: 'Putenbrust', price: 2.00, image: '/ham.png' },
  { id: 't20', name: 'Broccoli', price: 1.50, image: '/fresh_tomatoes.png' },
  { id: 't21', name: 'Mais', price: 1.00, image: '/fresh_tomatoes.png' },
  { id: 't22', name: 'Spinat', price: 1.50, image: '/fresh_tomatoes.png' },
  { id: 't23', name: 'Meeresfrüchte', price: 2.50, image: '/champignons_beef.png' },
  { id: 't24', name: 'Krabben', price: 2.50, image: '/champignons_beef.png' },
  { id: 't25', name: 'Spargel', price: 1.50, image: '/fresh_tomatoes.png' }
];

const BURGER_EXTRAS = [
  { id: 'b1', name: 'Jalapeno', price: 1.50, image: '/images/pizzen/pizzen vegetarisch/pizza vegetables.jpeg' },
  { id: 'b2', name: 'Extra Burger-Patty (100g) 1 Fleischstück', price: 2.50, image: '/burger_cinematic.png' },
  { id: 'b3', name: 'Schmelz-Käse', price: 1.00, image: '/mozzarella.png' },
  { id: 'b4', name: 'Baconstreifen', price: 1.50, image: '/prosciutto_slice.png' },
  { id: 'b5', name: 'Röstzwiebeln', price: 1.00, image: '/fresh_tomatoes.png' }
];

const SIDE_DISHES = [
  { id: 'sd1', name: 'Pommes frites (klein)', price: 3.50, image: '/fries.png' },
  { id: 'sd2', name: 'Pommes frites (groß)', price: 4.50, image: '/fries.png' },
  { id: 'sd3', name: 'Gitterpommes', price: 4.50, image: '/fries.png' },
  { id: 'sd4', name: 'Kroketten', price: 4.00, image: '/fries.png' },
  { id: 'sd5', name: 'Bratkartoffeln', price: 4.50, image: '/potato_wedge.png' }
];

const SAUCES = [
  { id: 'sc1', name: 'Ketchup', price: 0.50, image: '/sauce.png' },
  { id: 'sc2', name: 'Mayonnaise', price: 0.50, image: '/sauce.png' },
  { id: 'sc3', name: 'Snack Sauce', price: 1.00, image: '/sauce.png' },
  { id: 'sc4', name: 'Dänische Remoulade', price: 1.00, image: '/sauce.png' },
  { id: 'sc5', name: 'Tzatziki', price: 1.50, image: '/sauce.png' },
  { id: 'sc6', name: 'Jägersauce', price: 2.00, image: '/sauce.png' },
  { id: 'sc7', name: 'Sauce Hollandaise', price: 2.00, image: '/sauce.png' }
];

const DRESSINGS = [
  { id: 'dr1', name: 'Joghurt-Dressing', price: 1.50, image: '/sauce.png' },
  { id: 'dr2', name: 'French-Dressing', price: 1.50, image: '/sauce.png' },
  { id: 'dr3', name: 'Knoblauch-Dressing', price: 1.50, image: '/sauce.png' },
  { id: 'dr4', name: 'Essig & Öl', price: 1.50, image: '/sauce.png' }
];

const SALAD_EXTRAS = [
  { id: 'se1', name: 'Schinken', price: 1.50, image: '/ham.png' },
  { id: 'se2', name: 'Ei', price: 1.00, image: '/mozzarella_piece.png' },
  { id: 'se3', name: 'Thunfisch', price: 2.00, image: '/champignons_beef.png' },
  { id: 'se4', name: 'Weichkäse', price: 2.00, image: '/mozzarella_piece.png' },
  { id: 'se5', name: 'Putenbrust', price: 2.50, image: '/ham.png' }
];

export default function MealDetailModal({ isOpen, onClose, product, addToCart }) {
  const { language } = useAdmin();
  const t = getTranslation(language);
  if (!isOpen || !product) return null;

  // Parse multi-price strings
  const parsePrices = (priceStr) => {
    if (!priceStr) return [{ label: 'Standard', price: 0, rawStr: '' }];
    
    const parts = priceStr.split('|').map(s => s.trim());
    if (parts.length === 1) {
      const p = parseFloat(parts[0].replace(',', '.').replace(/[^\d\.]/g, '')) || 0;
      return [{ label: 'Standard', price: p, rawStr: parts[0] }];
    }

    const defaultLabels = ['26 cm', '32 cm', '36 cm'];
    return parts.map((part, index) => {
      let label = defaultLabels[index] || `Größe ${index + 1}`;
      if (part.includes(':')) {
        const splitColon = part.split(':');
        label = splitColon[0].trim();
      }
      const priceVal = parseFloat(part.replace(',', '.').replace(/[^\d\.]/g, '')) || 0;
      return { label, price: priceVal, rawStr: part };
    });
  };

  const options = parsePrices(product.fullPrice || product.price);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [kaeserand, setKaeserand] = useState(false);
  const [selectedFilling, setSelectedFilling] = useState('Käse (mit Käse gefüllt)');

  // Wunschpizza State (4 Textfelder)
  const isWunschpizza = product.name.toLowerCase().includes('wunsch') || product.id === '29';
  const [wunschBelag1, setWunschBelag1] = useState('');
  const [wunschBelag2, setWunschBelag2] = useState('');
  const [wunschBelag3, setWunschBelag3] = useState('');
  const [wunschBelag4, setWunschBelag4] = useState('');

  // Selected Drinks, Toppings, Burger Extras
  const [selectedDrinks, setSelectedDrinks] = useState([]);
  const [selectedExtraToppings, setSelectedExtraToppings] = useState([]);
  const [selectedBurgerExtras, setSelectedBurgerExtras] = useState([]);


  const [selectedAktionPizzas, setSelectedAktionPizzas] = useState([]);
  const [selectedAktionEis, setSelectedAktionEis] = useState([]);
  const [selectedAktionBurgers, setSelectedAktionBurgers] = useState([]);
  const [selectedAktionBurgerMenu, setSelectedAktionBurgerMenu] = useState(null);
  const [sweetPotatoFries, setSweetPotatoFries] = useState(false);

  const isPizzabroetchen = product.name.toLowerCase().includes('pizzabrötchen') || product.name.toLowerCase().includes('pizza brötchen') || product.category === 'Pizzabrötchen & Calzone';
  const isBurger = product.category === 'Burger' || product.name.toLowerCase().includes('burger');
  const isSalad = product.category === 'Salat' || product.category === 'Salate' || product.name.toLowerCase().includes('salat');
  const isSchnitzel = product.category === 'Schnitzel';
  const isSnack = product.category === 'Snacks';
  const isPasta = product.category === 'Nudeln' || product.category === 'Pasta';
  const fillingOptions = ['Käse (mit Käse gefüllt)', 'Salami', 'Schinken', 'Thunfisch', 'Hackfleisch', 'Gyros', 'Dönerfleisch'];

  const [itemComment, setItemComment] = useState('');
  const [pizzaScharf, setPizzaScharf] = useState(false);
  const [pizzaKnoblauch, setPizzaKnoblauch] = useState(false);
  const [selectedSideDishes, setSelectedSideDishes] = useState([]);
  const [selectedSauces, setSelectedSauces] = useState([]);
  const [selectedDressings, setSelectedDressings] = useState([]);
  const [selectedSaladExtras, setSelectedSaladExtras] = useState([]);

  useEffect(() => {
    setSelectedOptionIndex(0);
    setKaeserand(false);
    setSelectedFilling('Käse (mit Käse gefüllt)');
    setWunschBelag1('');
    setWunschBelag2('');
    setWunschBelag3('');
    setWunschBelag4('');

    setSelectedDrinks([]);
    setSelectedExtraToppings([]);
    setSelectedBurgerExtras([]);

    setSelectedAktionPizzas([]);
    setSelectedAktionEis([]);
    setSelectedAktionBurgers([]);
    setSelectedAktionBurgerMenu(null);
    setSweetPotatoFries(false);

    setItemComment('');
    setPizzaScharf(false);
    setPizzaKnoblauch(false);
    setSelectedSideDishes([]);
    setSelectedSauces([]);
    setSelectedDressings([]);
    setSelectedSaladExtras([]);
  }, [product]);

  const selectedOption = options[selectedOptionIndex] || options[0];

  const getKaeserandPrice = () => {
    if (!kaeserand) return 0;
    if (selectedOption.label.includes('26')) return 2.20;
    if (selectedOption.label.includes('32')) return 3.40;
    if (selectedOption.label.includes('36')) return 4.60;
    return 2.50;
  };

  // Calculate total price including all selected extras
  const extrasDressingsPrice = 0;
  const extrasDrinksPrice = selectedDrinks.reduce((sum, dr) => sum + dr.price, 0);
  
  let extrasToppingsPrice = 0;
  if (product.id === '602') { // Partypizza
    const sorted = [...selectedExtraToppings].sort((a, b) => b.price - a.price);
    const chargeable = sorted.slice(5);
    extrasToppingsPrice = chargeable.reduce((sum, tp) => sum + tp.price, 0);
  } else {
    extrasToppingsPrice = selectedExtraToppings.reduce((sum, tp) => sum + tp.price, 0);
  }

  const extraSidesPrice = selectedSideDishes.reduce((sum, s) => sum + s.price, 0);
  const extraDressingsCost = selectedDressings.length > 1 ? selectedDressings.slice(1).reduce((sum, d) => sum + d.price, 0) : 0;
  const extraSaucesCost = (isSnack && selectedSauces.length > 0) ? selectedSauces.slice(1).reduce((sum, s) => sum + s.price, 0) : selectedSauces.reduce((sum, s) => sum + s.price, 0);
  const extraSaladCost = selectedSaladExtras.reduce((sum, s) => sum + s.price, 0);

  const burgerExtrasPrice = selectedBurgerExtras.reduce((sum, b) => sum + b.price, 0);
  const sidesPrice = extraSidesPrice + extraDressingsCost + extraSaucesCost + extraSaladCost;
  const sweetPotatoPrice = sweetPotatoFries ? 5.00 : 0;

  const finalPrice = selectedOption.price + getKaeserandPrice() + extrasDressingsPrice + extrasDrinksPrice + extrasToppingsPrice + burgerExtrasPrice + sidesPrice + sweetPotatoPrice;
  const isPizza = product.category === 'Pizza' || (product.imageUrl && product.imageUrl.includes('pizza')) || product.name.toLowerCase().includes('pizza') || product.category === 'Pizzabrötchen & Calzone';

  const toggleBurgerExtra = (item) => {
    if (selectedBurgerExtras.some(b => b.id === item.id)) {
      setSelectedBurgerExtras(selectedBurgerExtras.filter(b => b.id !== item.id));
    } else {
      setSelectedBurgerExtras([...selectedBurgerExtras, item]);
    }
  };

  const toggleSideDish = (item) => {
    if (selectedSideDishes.some(s => s.id === item.id)) {
      setSelectedSideDishes(selectedSideDishes.filter(s => s.id !== item.id));
    } else {
      setSelectedSideDishes([...selectedSideDishes, item]);
    }
  };
  const toggleSauce = (item) => {
    if (selectedSauces.some(s => s.id === item.id)) {
      setSelectedSauces(selectedSauces.filter(s => s.id !== item.id));
    } else {
      setSelectedSauces([...selectedSauces, item]);
    }
  };
  const toggleDressing = (item) => {
    if (selectedDressings.some(d => d.id === item.id)) {
      setSelectedDressings(selectedDressings.filter(d => d.id !== item.id));
    } else {
      setSelectedDressings([...selectedDressings, item]);
    }
  };
  const toggleSaladExtra = (item) => {
    if (selectedSaladExtras.some(s => s.id === item.id)) {
      setSelectedSaladExtras(selectedSaladExtras.filter(s => s.id !== item.id));
    } else {
      setSelectedSaladExtras([...selectedSaladExtras, item]);
    }
  };

  const toggleDrink = (item) => {
    if (selectedDrinks.some(dr => dr.id === item.id)) {
      setSelectedDrinks(selectedDrinks.filter(dr => dr.id !== item.id));
    } else {
      setSelectedDrinks([...selectedDrinks, item]);
    }
  };

  const toggleExtraTopping = (item) => {
    if (selectedExtraToppings.some(tp => tp.id === item.id)) {
      setSelectedExtraToppings(selectedExtraToppings.filter(tp => tp.id !== item.id));
    } else {
      setSelectedExtraToppings([...selectedExtraToppings, item]);
    }
  };

  const isAktion = product.category === 'Hammer des Tages' && product.name.toLowerCase().includes('aktion');
  const isPartyPizza = product.id === '602';
  
  let maxPizzas = 0;
  let maxEis = 0;
  let maxBurgers = 0;
  if (product.id === '600') { maxPizzas = 1; }
  if (product.id === '601') maxPizzas = 3;
  if (product.id === '603') { maxPizzas = 1; maxEis = 1; }
  if (product.id === '604') { maxPizzas = 2; maxEis = 2; }
  if (product.id === '605') maxPizzas = 2;
  if (product.id === '606') maxPizzas = 2;
  if (product.id === '609') maxPizzas = 4;
  if (product.id === '610') maxBurgers = 12;

  const availablePizzas = menuData.find(c => c.category === 'Pizza')?.items || [];
  const availableEis = menuData.find(c => c.category === 'Eis')?.items || [];
  const availableBurgers = menuData.find(c => c.category === 'Burger')?.items || [];
  const availableBurgerMenus = availableBurgers.filter(item => item.name.toLowerCase().includes('menü') || item.id.includes('-M'));

  const addAktionBurger = (item) => {
    if (selectedAktionBurgers.length < maxBurgers) {
      setSelectedAktionBurgers([...selectedAktionBurgers, { instanceId: Date.now() + Math.random(), item }]);
    }
  };

  const removeAktionBurger = (instanceId) => {
    setSelectedAktionBurgers(selectedAktionBurgers.filter(b => b.instanceId !== instanceId));
  };

  const toggleAktionPizza = (item) => {
    if (selectedAktionPizzas.some(p => p.id === item.id)) {
      setSelectedAktionPizzas(selectedAktionPizzas.filter(p => p.id !== item.id));
    } else {
      if (selectedAktionPizzas.length < maxPizzas) {
        setSelectedAktionPizzas([...selectedAktionPizzas, item]);
      }
    }
  };

  const toggleAktionEis = (item) => {
    if (selectedAktionEis.some(e => e.id === item.id)) {
      setSelectedAktionEis(selectedAktionEis.filter(e => e.id !== item.id));
    } else {
      if (selectedAktionEis.length < maxEis) {
        setSelectedAktionEis([...selectedAktionEis, item]);
      }
    }
  };

  const autofillWunschBelag = (name) => {
    if (!wunschBelag1) setWunschBelag1(name);
    else if (!wunschBelag2) setWunschBelag2(name);
    else if (!wunschBelag3) setWunschBelag3(name);
    else if (!wunschBelag4) setWunschBelag4(name);
  };

  const handleAdd = () => {
    if (maxPizzas > 0 && selectedAktionPizzas.length !== maxPizzas) {
      alert(`Bitte wählen Sie genau ${maxPizzas} Pizzen aus.`);
      return;
    }
    if (maxEis > 0 && selectedAktionEis.length !== maxEis) {
      alert(`Bitte wählen Sie genau ${maxEis} Eis aus.`);
      return;
    }
    if (maxBurgers > 0 && selectedAktionBurgers.length !== maxBurgers) {
      alert(`Bitte wählen Sie genau ${maxBurgers} Burger aus.`);
      return;
    }

    let itemName = product.name;
    if (options.length > 1) {
      itemName += ` (${selectedOption.label})`;
    }

    if (isWunschpizza) {
      const belaege = [wunschBelag1, wunschBelag2, wunschBelag3, wunschBelag4].filter(Boolean).join(', ');
      if (belaege) {
        itemName += ` - Beläge: ${belaege}`;
      }
    }

    if (isPizzabroetchen) {
      itemName += ` - Füllung: ${selectedFilling}`;
    }
    if (kaeserand) {
      itemName += ' + Käserand';
    }

    if (selectedAktionPizzas.length > 0) {
      itemName += ` - Pizzen: ${selectedAktionPizzas.map(p => p.name).join(', ')}`;
    }
    if (selectedAktionEis.length > 0) {
      itemName += ` - Eis: ${selectedAktionEis.map(e => e.name).join(', ')}`;
    }

    if (selectedAktionBurgers.length > 0) {
      const burgerCounts = {};
      selectedAktionBurgers.forEach(b => {
        burgerCounts[b.item.name] = (burgerCounts[b.item.name] || 0) + 1;
      });
      const burgerString = Object.entries(burgerCounts).map(([name, count]) => `${count}x ${name}`).join(', ');
      itemName += ` - Burger: ${burgerString}`;
    }

    if (sweetPotatoFries) {
      itemName += ` + Süßkartoffelpommes`;
    }

    if (pizzaScharf) itemName += ' + Scharf (gratis)';
    if (pizzaKnoblauch) itemName += ' + Knoblauch (gratis)';
    if (selectedSideDishes.length > 0) itemName += ' + Beilagen: ' + selectedSideDishes.map(s => s.name).join(', ');
    if (selectedSauces.length > 0) itemName += ' + Saucen: ' + selectedSauces.map(s => s.name).join(', ');
    if (selectedDressings.length > 0) itemName += ' + Dressings: ' + selectedDressings.map(d => d.name).join(', ');
    if (selectedSaladExtras.length > 0) itemName += ' + Extra: ' + selectedSaladExtras.map(s => s.name).join(', ');
    if (itemComment) itemName += ' | Anmerkung: ' + itemComment;

    if (selectedBurgerExtras.length > 0) {
      itemName += ` + Burger Extra: ${selectedBurgerExtras.map(b => b.name).join(', ')}`;
    }

    if (selectedExtraToppings.length > 0) {
      itemName += ` + Extra: ${selectedExtraToppings.map(t => t.name).join(', ')}`;
    }

    if (selectedDrinks.length > 0) {
      itemName += ` + Getränk: ${selectedDrinks.map(dr => dr.name).join(', ')}`;
    }

    addToCart({
      id: `${product.id}-${selectedOptionIndex}-${Date.now()}`,
      name: itemName,
      price: finalPrice,
      imageUrl: product.imageUrl || product.image
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="q-modal-overlay">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: 'absolute', inset: 0 }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.25 }}
          className="q-modal-card"
        >
          <button className="q-modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>

          <div className="q-modal-image-header">
            <img src={product.imageUrl || product.image} alt={product.name} loading="lazy" />
            <div className="q-modal-image-gradient"></div>
          </div>

          <div className="q-modal-body">
            <div>
              <h2 className="q-modal-title">{product.name.toUpperCase()}</h2>
              {product.description && <p className="q-modal-desc">{product.description}</p>}
            </div>

            {/* WUNSCH-PIZZA: 4 Beläge Textfelder */}
            {isWunschpizza && (
              <div className="wunschpizza-container" style={{ background: 'rgba(207, 166, 112, 0.08)', border: '1px solid rgba(207, 166, 112, 0.3)', borderRadius: '16px', padding: '20px' }}>
                <div className="q-modal-section-title" style={{ color: '#cfa670', margin: '0 0 12px 0' }}>
                  ✨ DEINE 4 WUNSCH-BELÄGE EINGEBEN
                </div>
                <p style={{ fontSize: '0.85rem', color: '#aaa', margin: '0 0 15px 0' }}>
                  Schreibe deine 4 Lieblingszutaten in die Textfelder oder klicke unten auf die Zutaten!
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#cfa670', display: 'block', marginBottom: '4px' }}>1. Belag</label>
                    <input 
                      type="text" 
                      value={wunschBelag1} 
                      onChange={e => setWunschBelag1(e.target.value)} 
                      placeholder="z.B. Salami" 
                      style={{ width: '100%', padding: '10px 14px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#cfa670', display: 'block', marginBottom: '4px' }}>2. Belag</label>
                    <input 
                      type="text" 
                      value={wunschBelag2} 
                      onChange={e => setWunschBelag2(e.target.value)} 
                      placeholder="z.B. Schinken" 
                      style={{ width: '100%', padding: '10px 14px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#cfa670', display: 'block', marginBottom: '4px' }}>3. Belag</label>
                    <input 
                      type="text" 
                      value={wunschBelag3} 
                      onChange={e => setWunschBelag3(e.target.value)} 
                      placeholder="z.B. Champignons" 
                      style={{ width: '100%', padding: '10px 14px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#cfa670', display: 'block', marginBottom: '4px' }}>4. Belag</label>
                    <input 
                      type="text" 
                      value={wunschBelag4} 
                      onChange={e => setWunschBelag4(e.target.value)} 
                      placeholder="z.B. Sauce Hollandaise" 
                      style={{ width: '100%', padding: '10px 14px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                {/* Quick Add Chips */}
                <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '8px' }}>Beliebte Zutaten zum Antippen:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {['Salami', 'Schinken', 'Champignons', 'Sauce Hollandaise', 'Gyros', 'Dönerfleisch', 'Bacon', 'Ananas', 'Mozzarella', 'Zwiebeln', 'Broccoli', 'Thunfisch', 'Knoblauchwurst', 'Weichkäse', 'Gorgonzola', 'Paprika', 'Peperoni', 'Mais', 'Oliven', 'Ei'].map((name, i) => (
                    <button 
                      key={i} 
                      onClick={() => autofillWunschBelag(name)}
                      style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(207,166,112,0.2)', borderRadius: '20px', color: '#ddd', fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.borderColor = '#cfa670'}
                      onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(207,166,112,0.2)'}
                    >
                      + {name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Aktion Pizzen */}
            {maxPizzas > 0 && selectedAktionPizzas.length < maxPizzas && (
              <div>
                <div className="q-modal-section-title" style={{ color: '#cfa670' }}>🍕 WÄHLE {maxPizzas} PIZZEN AUS</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                  {availablePizzas.map(item => {
                    const isSelected = selectedAktionPizzas.some(p => p.id === item.id);
                    return (
                      <div 
                        key={item.id}
                        onClick={() => toggleAktionPizza(item)}
                        style={{
                          background: isSelected ? 'rgba(207, 166, 112, 0.2)' : '#1a1a1a',
                          border: isSelected ? '1px solid #cfa670' : '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '12px',
                          padding: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <img src={item.image} alt={item.name} loading="lazy" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: '50%', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: isSelected ? '#cfa670' : '#fff', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.2', marginBottom: '3px' }}>{item.name}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Show selected pizzas when max reached */}
            {maxPizzas > 0 && selectedAktionPizzas.length === maxPizzas && (
              <div style={{ marginBottom: '20px' }}>
                <div className="q-modal-section-title" style={{ color: '#cfa670' }}>✅ {maxPizzas} PIZZEN GEWÄHLT</div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {selectedAktionPizzas.map(p => (
                    <div key={p.id} onClick={() => toggleAktionPizza(p)} style={{ background: 'rgba(207, 166, 112, 0.2)', border: '1px solid #cfa670', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                       <img src={p.image} alt={p.name} loading="lazy" style={{ width: 24, height: 24, objectFit: 'cover', borderRadius: '50%' }} />
                       <span style={{ fontSize: '0.8rem', color: '#fff' }}>{p.name}</span>
                       <X size={14} color="#cfa670" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Aktion Eis */}
            {maxEis > 0 && selectedAktionEis.length < maxEis && (
              <div>
                <div className="q-modal-section-title" style={{ color: '#cfa670' }}>🍦 WÄHLE {maxEis} EIS AUS</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                  {availableEis.map(item => {
                    const isSelected = selectedAktionEis.some(e => e.id === item.id);
                    return (
                      <div 
                        key={item.id}
                        onClick={() => toggleAktionEis(item)}
                        style={{
                          background: isSelected ? 'rgba(207, 166, 112, 0.2)' : '#1a1a1a',
                          border: isSelected ? '1px solid #cfa670' : '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '12px',
                          padding: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <img src={item.image} alt={item.name} loading="lazy" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: '50%', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: isSelected ? '#cfa670' : '#fff', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.2', marginBottom: '3px' }}>{item.name}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {maxEis > 0 && selectedAktionEis.length === maxEis && (
              <div style={{ marginBottom: '20px' }}>
                <div className="q-modal-section-title" style={{ color: '#cfa670' }}>✅ {maxEis} EIS GEWÄHLT</div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {selectedAktionEis.map(e => (
                    <div key={e.id} onClick={() => toggleAktionEis(e)} style={{ background: 'rgba(207, 166, 112, 0.2)', border: '1px solid #cfa670', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                       <img src={e.image} alt={e.name} style={{ width: 24, height: 24, objectFit: 'cover', borderRadius: '50%' }} />
                       <span style={{ fontSize: '0.8rem', color: '#fff' }}>{e.name}</span>
                       <X size={14} color="#cfa670" />
                    </div>
                  ))}
                </div>
              </div>
            )}


            {/* Aktion Burgers */}
            {maxBurgers > 0 && selectedAktionBurgers.length < maxBurgers && (
              <div>
                <div className="q-modal-section-title" style={{ color: '#cfa670' }}>🍔 WÄHLE {maxBurgers - selectedAktionBurgers.length} BURGER AUS ({selectedAktionBurgers.length}/{maxBurgers})</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                  {availableBurgers.map(item => {
                    const count = selectedAktionBurgers.filter(b => b.item.id === item.id).length;
                    return (
                      <div 
                        key={item.id}
                        onClick={() => addAktionBurger(item)}
                        style={{
                          background: count > 0 ? 'rgba(207, 166, 112, 0.2)' : '#1a1a1a',
                          border: count > 0 ? '1px solid #cfa670' : '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '12px',
                          padding: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <img src={item.image} alt={item.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: '50%', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: count > 0 ? '#cfa670' : '#fff', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.2', marginBottom: '3px' }}>{item.name}</div>
                          {count > 0 && <div style={{ fontSize: '0.7rem', color: '#cfa670' }}>{count}x ausgewählt</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {maxBurgers > 0 && selectedAktionBurgers.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div className="q-modal-section-title" style={{ color: '#cfa670' }}>✅ GEWÄHLTE BURGER ({selectedAktionBurgers.length}/{maxBurgers})</div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {selectedAktionBurgers.map(b => (
                    <div key={b.instanceId} onClick={() => removeAktionBurger(b.instanceId)} style={{ background: 'rgba(207, 166, 112, 0.2)', border: '1px solid #cfa670', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                       <img src={b.item.image} alt={b.item.name} style={{ width: 24, height: 24, objectFit: 'cover', borderRadius: '50%' }} />
                       <span style={{ fontSize: '0.8rem', color: '#fff' }}>{b.item.name}</span>
                       <X size={14} color="#cfa670" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Süßkartoffelpommes Option for Burger-Hammer */}
            {product.id === '610' && (
              <div>
                <div className="q-modal-section-title">🍟 EXTRA POMMES</div>
                <div
                  className={`q-modal-size-btn ${sweetPotatoFries ? 'active' : ''}`}
                  onClick={() => setSweetPotatoFries(!sweetPotatoFries)}
                  style={{ flexDirection: 'row', justifyContent: 'space-between', padding: '14px 20px', marginBottom: '20px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 4,
                      border: sweetPotatoFries ? 'none' : '1px solid rgba(255,255,255,0.3)',
                      background: sweetPotatoFries ? '#cfa670' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {sweetPotatoFries && <Check size={14} color="#000" />}
                    </div>
                    <span>Süßkartoffelpommes (+5,00 €)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Size selection */}
            {options.length > 1 && (
              <div>
                <div className="q-modal-section-title">{t.chooseSize}</div>
                <div className="q-modal-sizes-grid">
                  {options.map((opt, idx) => (
                    <div
                      key={idx}
                      className={`q-modal-size-btn ${selectedOptionIndex === idx ? 'active' : ''}`}
                      onClick={() => setSelectedOptionIndex(idx)}
                    >
                      <span className="q-modal-size-label">{opt.label}</span>
                      <span className="q-modal-size-price">{opt.price.toFixed(2).replace('.', ',')} €</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            
            {isPizza && !isPizzabroetchen && !isPartyPizza && (
              <div>
                <div className="q-modal-section-title">GRATIS EXTRAS</div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <div
                    className={`q-modal-size-btn ${pizzaScharf ? 'active' : ''}`}
                    onClick={() => setPizzaScharf(!pizzaScharf)}
                    style={{ flex: 1, padding: '14px', textAlign: 'center' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <div style={{ width: 20, height: 20, borderRadius: 4, border: pizzaScharf ? 'none' : '1px solid rgba(255,255,255,0.3)', background: pizzaScharf ? '#cfa670' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {pizzaScharf && <Check size={14} color="#000" />}
                      </div>
                      <span>Scharf</span>
                    </div>
                  </div>
                  <div
                    className={`q-modal-size-btn ${pizzaKnoblauch ? 'active' : ''}`}
                    onClick={() => setPizzaKnoblauch(!pizzaKnoblauch)}
                    style={{ flex: 1, padding: '14px', textAlign: 'center' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <div style={{ width: 20, height: 20, borderRadius: 4, border: pizzaKnoblauch ? 'none' : '1px solid rgba(255,255,255,0.3)', background: pizzaKnoblauch ? '#cfa670' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {pizzaKnoblauch && <Check size={14} color="#000" />}
                      </div>
                      <span>Knoblauch</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Käserand option for Pizza */}
            {isPizza && !isPizzabroetchen && !isPartyPizza && (
              <div>
                <div className="q-modal-section-title">{t.extras}</div>
                <div
                  className={`q-modal-size-btn ${kaeserand ? 'active' : ''}`}
                  onClick={() => setKaeserand(!kaeserand)}
                  style={{ flexDirection: 'row', justifyContent: 'space-between', padding: '14px 20px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 4,
                      border: kaeserand ? 'none' : '1px solid rgba(255,255,255,0.3)',
                      background: kaeserand ? '#cfa670' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {kaeserand && <Check size={14} color="#000" />}
                    </div>
                    <span>{t.cheeseCrust} (+{getKaeserandPrice() > 0 ? getKaeserandPrice().toFixed(2).replace('.', ',') : (selectedOption.label.includes('36') ? '4,60' : selectedOption.label.includes('32') ? '3,40' : '2,20')} €)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Filling selection for Pizzabrötchen */}
            {isPizzabroetchen && (
              <div>
                <div className="q-modal-section-title">{t.chooseFilling}</div>
                <div className="q-modal-sizes-grid">
                  {fillingOptions.map((fill, idx) => (
                    <div
                      key={idx}
                      className={`q-modal-size-btn ${selectedFilling === fill ? 'active' : ''}`}
                      onClick={() => setSelectedFilling(fill)}
                      style={{ padding: '12px 14px', textAlign: 'center' }}
                    >
                      <span className="q-modal-size-label">{fill}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extra Pizza Toppings (Mit Aufpreis) */}
            {isPizza && (
              <div>
                <div className="q-modal-section-title">🍕 EXTRA BELÄGE {isPartyPizza ? '(ERSTE 5 GRATIS)' : '(MIT AUFPREIS)'}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: '10px' }}>
                  {PIZZA_EXTRA_TOPPINGS.map(item => {
                    const isSelected = selectedExtraToppings.some(t => t.id === item.id);
                    return (
                      <div 
                        key={item.id}
                        onClick={() => toggleExtraTopping(item)}
                        style={{
                          background: isSelected ? 'rgba(207, 166, 112, 0.2)' : '#1a1a1a',
                          border: isSelected ? '1px solid #cfa670' : '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '12px',
                          padding: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <img src={item.image} alt={item.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: '50%', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: isSelected ? '#cfa670' : '#fff', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.2', marginBottom: '3px' }}>{item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#aaa' }}>+{item.price.toFixed(2).replace('.', ',')} €</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Burger Extras (Mit Aufpreis) */}
            {isBurger && (
              <div>
                <div className="q-modal-section-title">🍔 BURGER EXTRAS (MIT AUFPREIS)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: '10px' }}>
                  {BURGER_EXTRAS.map(item => {
                    const isSelected = selectedBurgerExtras.some(b => b.id === item.id);
                    return (
                      <div 
                        key={item.id}
                        onClick={() => toggleBurgerExtra(item)}
                        style={{
                          background: isSelected ? 'rgba(207, 166, 112, 0.2)' : '#1a1a1a',
                          border: isSelected ? '1px solid #cfa670' : '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '12px',
                          padding: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <img src={item.image} alt={item.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: '50%', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: isSelected ? '#cfa670' : '#fff', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.2', marginBottom: '3px' }}>{item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#aaa' }}>+{item.price.toFixed(2).replace('.', ',')} €</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            
            {/* Side Dishes */}
            {(isBurger || isSchnitzel || isSnack || isPasta) && (
              <div>
                <div className="q-modal-section-title">🍟 EXTRA BEILAGEN (MIT AUFPREIS)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                  {SIDE_DISHES.map(item => {
                    const isSelected = selectedSideDishes.some(s => s.id === item.id);
                    return (
                      <div key={item.id} onClick={() => toggleSideDish(item)} style={{ background: isSelected ? 'rgba(207, 166, 112, 0.2)' : '#1a1a1a', border: isSelected ? '1px solid #cfa670' : '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: isSelected ? '#cfa670' : '#fff' }}>{item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#aaa' }}>+{item.price.toFixed(2).replace('.', ',')} €</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sauces */}
            {(isBurger || isSnack || isSchnitzel || isPizza || isPizzabroetchen) && (
              <div>
                <div className="q-modal-section-title">🥣 SAUCEN {isSnack ? '(1 GRATIS, DANN AUFPREIS)' : '(MIT AUFPREIS)'}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                  {SAUCES.map(item => {
                    const isSelected = selectedSauces.some(s => s.id === item.id);
                    const isFirstFree = isSnack && selectedSauces.length > 0 && selectedSauces[0].id === item.id;
                    const priceLabel = isFirstFree ? 'Gratis' : `+${item.price.toFixed(2).replace('.', ',')} €`;
                    return (
                      <div key={item.id} onClick={() => toggleSauce(item)} style={{ background: isSelected ? 'rgba(207, 166, 112, 0.2)' : '#1a1a1a', border: isSelected ? '1px solid #cfa670' : '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: isSelected ? '#cfa670' : '#fff' }}>{item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: isFirstFree ? '#22c55e' : '#aaa' }}>{priceLabel}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Dressings & Salad Extras */}
            {isSalad && (
              <>
                <div>
                  <div className="q-modal-section-title">🥗 DRESSINGS (1 GRATIS, DANN AUFPREIS)</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                    {DRESSINGS.map(item => {
                      const isSelected = selectedDressings.some(d => d.id === item.id);
                      const isFirstFree = selectedDressings.length > 0 && selectedDressings[0].id === item.id;
                      const priceLabel = isFirstFree ? 'Gratis' : `+${item.price.toFixed(2).replace('.', ',')} €`;
                      return (
                        <div key={item.id} onClick={() => toggleDressing(item)} style={{ background: isSelected ? 'rgba(207, 166, 112, 0.2)' : '#1a1a1a', border: isSelected ? '1px solid #cfa670' : '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: isSelected ? '#cfa670' : '#fff' }}>{item.name}</div>
                            <div style={{ fontSize: '0.75rem', color: isFirstFree ? '#22c55e' : '#aaa' }}>{priceLabel}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div className="q-modal-section-title">🥓 EXTRA SALAT-ZUTATEN</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                    {SALAD_EXTRAS.map(item => {
                      const isSelected = selectedSaladExtras.some(s => s.id === item.id);
                      return (
                        <div key={item.id} onClick={() => toggleSaladExtra(item)} style={{ background: isSelected ? 'rgba(207, 166, 112, 0.2)' : '#1a1a1a', border: isSelected ? '1px solid #cfa670' : '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: isSelected ? '#cfa670' : '#fff' }}>{item.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#aaa' }}>+${item.price.toFixed(2).replace('.', ',')} €</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Extra Getränke */}
            <div>
              <div className="q-modal-section-title">🥤 EXTRA GETRÄNKE</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: '10px' }}>
                {EXTRA_DRINKS.map(item => {
                  const isSelected = selectedDrinks.some(dr => dr.id === item.id);
                  return (
                    <div 
                      key={item.id}
                      onClick={() => toggleDrink(item)}
                      style={{
                        background: isSelected ? 'rgba(207, 166, 112, 0.2)' : '#1a1a1a',
                        border: isSelected ? '1px solid #cfa670' : '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        padding: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <img src={item.image} alt={item.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: isSelected ? '#cfa670' : '#fff', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.2', marginBottom: '3px' }}>{item.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#aaa' }}>+{item.price.toFixed(2).replace('.', ',')} €</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            
            {/* Anmerkung */}
            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
              <div className="q-modal-section-title">📝 ANMERKUNG HINZUFÜGEN</div>
              <textarea 
                value={itemComment}
                onChange={e => setItemComment(e.target.value)}
                placeholder="Besondere Wünsche? (z.B. ohne Zwiebeln, extra knusprig...)"
                style={{ width: '100%', height: '80px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '15px', color: '#fff', outline: 'none', resize: 'none', fontFamily: 'var(--q-font)' }}
              />
            </div>

            <div className="q-modal-footer">
              <div>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#888', display: 'block' }}>{t.totalPrice}</span>
                <span className="q-modal-final-price">{finalPrice.toFixed(2).replace('.', ',')} €</span>
              </div>
              <button className="q-modal-add-btn" onClick={handleAdd}>
                <ShoppingBag size={18} />
                {t.addToCart}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

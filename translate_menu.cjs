const fs = require('fs');
const path = require('path');

// Read the menu file
const menuPath = path.join(__dirname, 'src/data/menu.js');
let menuContent = fs.readFileSync(menuPath, 'utf8');

// We need to parse the exported array. 
// A naive approach: replace the descriptions using regex, 
// but it's safer to extract it, run translation, and stringify.
// Let's create a regex to find all desc strings.
// "desc": "mit Tzatziki, Krautsalat, Pommes frites oder Reis"

const translationDict = {
  "mit": { en: "with", ru: "с" },
  "und": { en: "and", ru: "и" },
  "&": { en: "&", ru: "&" },
  "Tomatensauce": { en: "tomato sauce", ru: "томатным соусом" },
  "Käse": { en: "cheese", ru: "сыром" },
  "frischen": { en: "fresh", ru: "свежими" },
  "Champignons": { en: "mushrooms", ru: "шампиньонами" },
  "verschiedenem Gemüse": { en: "various vegetables", ru: "различными овощами" },
  "Mozzarella": { en: "mozzarella", ru: "моцареллой" },
  "Weichkäse": { en: "soft cheese", ru: "мягким сыром" },
  "Gorgonzola": { en: "gorgonzola", ru: "горгонзолой" },
  "Gouda-Käse": { en: "gouda cheese", ru: "сыром гауда" },
  "Broccoli": { en: "broccoli", ru: "брокколи" },
  "rote & grüne Paprika": { en: "red & green peppers", ru: "красным и зеленым перцем" },
  "Paprika": { en: "peppers", ru: "перцем" },
  "Peperoni": { en: "pepperoni (mild chili)", ru: "острым перцем" },
  "Oliven": { en: "olives", ru: "оливками" },
  "Blumenkohl": { en: "cauliflower", ru: "цветной капустой" },
  "Spargel": { en: "asparagus", ru: "спаржей" },
  "Sauce Hollandaise": { en: "hollandaise sauce", ru: "голландским соусом" },
  "Tomaten": { en: "tomatoes", ru: "помидорами" },
  "Sahnesauce": { en: "cream sauce", ru: "сливочным соусом" },
  "extra viel Käse": { en: "extra cheese", ru: "дополнительным сыром" },
  "Am Ende mit Bruschetta-Mix verfeinert": { en: "Refined with bruschetta mix at the end", ru: "В конце украшено брускетта-миксом" },
  "Mais": { en: "corn", ru: "кукурузой" },
  "Tiefsee-Shrimps": { en: "deep sea shrimps", ru: "глубоководными креветками" },
  "Spinat": { en: "spinach", ru: "шпинатом" },
  "Thunfisch": { en: "tuna", ru: "тунцом" },
  "Zwiebeln": { en: "onions", ru: "луком" },
  "Meeresfrüchten": { en: "seafood", ru: "морепродуктами" },
  "Knoblauch": { en: "garlic", ru: "чесноком" },
  "Salami": { en: "salami", ru: "салями" },
  "Schinken": { en: "ham", ru: "ветчиной" },
  "Hackfleisch": { en: "minced meat", ru: "мясным фаршем" },
  "Ei": { en: "egg", ru: "яйцом" },
  "Artischocken": { en: "artichokes", ru: "артишоками" },
  "Ananas": { en: "pineapple", ru: "ананасами" },
  "Putenbrust": { en: "turkey breast", ru: "грудкой индейки" },
  "Curry": { en: "curry", ru: "карри" },
  "Gyros": { en: "gyros", ru: "гиросом" },
  "Bacon": { en: "bacon", ru: "беконом" },
  "Röstzwiebeln": { en: "roasted onions", ru: "жареным луком" },
  "Gewürzgurken": { en: "pickles", ru: "маринованными огурцами" },
  "Snack-Saucen": { en: "snack sauces", ru: "соусами для снеков" },
  "Ketchup": { en: "ketchup", ru: "кетчупом" },
  "Tiger Shrimps": { en: "tiger shrimps", ru: "тигровыми креветками" },
  "Lachs": { en: "salmon", ru: "лососем" },
  "Dönerfleisch": { en: "doner meat", ru: "донер-мясом" },
  "Tzatziki": { en: "tzatziki", ru: "дзадзики" },
  "4 Belägen nach Wahl": { en: "4 toppings of your choice", ru: "4 начинками на выбор" },
  "Spaghetti Bolognese": { en: "spaghetti bolognese", ru: "спагетти болоньезе" },
  "Krautsalat": { en: "coleslaw", ru: "капустным салатом" },
  "Pommes frites oder Reis": { en: "french fries or rice", ru: "картофелем фри или рисом" },
  "Käse überbacken": { en: "baked with cheese", ru: "запеченным с сыром" },
  "überbacken": { en: "baked with cheese", ru: "запеченный сыром" },
  "½ Fladenbrot": { en: "½ flatbread", ru: "½ лепешки" },
  "ca. 100g Rindfleisch": { en: "approx. 100g beef", ru: "около 100 г говядины" },
  "ca. 200g Rindfleisch": { en: "approx. 200g beef", ru: "около 200 г говядины" },
  "dünn Remoulade": { en: "thin remoulade", ru: "тонким слоем ремулада" },
  "Cheddar-Käse": { en: "cheddar cheese", ru: "сыром чеддер" },
  "inkl. Pommes frites & 0,33 l Coca-Cola": { en: "incl. french fries & 0.33 l Coca-Cola", ru: "вкл. картофель фри и 0,33 л Coca-Cola" },
  "Jalapeños": { en: "jalapeños", ru: "халапеньо" },
  "BBQ-Sauce": { en: "BBQ sauce", ru: "соусом барбекю" },
  "2 Baconstreifen": { en: "2 bacon strips", ru: "2 полосками бекона" },
  "Eisbergsalat": { en: "iceberg lettuce", ru: "салатом айсберг" },
  "süßer Chili-Sauce": { en: "sweet chili sauce", ru: "сладким соусом чили" },
  "Mayonnaise": { en: "mayonnaise", ru: "майонезом" },
  "Gurken": { en: "cucumbers", ru: "огурцами" },
  "wie oben, kleine Portion": { en: "as above, small portion", ru: "как выше, маленькая порция" },
  "nur mit": { en: "only with", ru: "только с" },
  "Grundsalat (groß)": { en: "base salad (large)", ru: "базовым салатом (большой)" },
  "Schnitzelstreifen": { en: "schnitzel strips", ru: "полосками шницеля" },
  "Chicken Chips": { en: "chicken chips", ru: "куриными чипсами" },
  "mit Salatbeilage, Pommes frites & ½ Brot": { en: "with side salad, french fries & ½ bread", ru: "с гарниром из салата, картофелем фри и ½ хлеба" },
  "mit gebratenen Champignons & Zwiebeln": { en: "with fried mushrooms & onions", ru: "с жареными грибами и луком" },
  "Zigeunersauce": { en: "gypsy sauce", ru: "цыганским соусом" },
  "Zitrone": { en: "lemon", ru: "лимоном" },
  "Champignonsauce, Pommes & ½ Brot": { en: "mushroom sauce, fries & ½ bread", ru: "грибным соусом, картофелем фри и ½ хлеба" },
  "Jägersauce, Pommes & ½ Brot": { en: "hunter's sauce, fries & ½ bread", ru: "охотничьим соусом, картофелем фри и ½ хлеба" },
  "Rahmsauce, Pommes & ½ Brot": { en: "cream sauce, fries & ½ bread", ru: "сливочным соусом, картофелем фри и ½ хлеба" },
  "Sahnesauce, Pommes & ½ Brot": { en: "cream sauce, fries & ½ bread", ru: "сливочным соусом, картофелем фри и ½ хлеба" },
  "Pommes & 1x Sauce": { en: "fries & 1x sauce", ru: "картофелем фри и 1x соусом" },
  "Pommes & 2x Sauce": { en: "fries & 2x sauce", ru: "картофелем фри и 2x соусом" },
  "6x Chicken Wings, 10x Chicken Chips": { en: "6x chicken wings, 10x chicken chips", ru: "6x куриных крылышек, 10x куриных чипсов" },
  "6 Stück": { en: "6 pieces", ru: "6 штук" },
  "mit Pommes frites": { en: "with french fries", ru: "с картофелем фри" },
  "3 Eiern, Kartoffelscheiben, Speck & Zwiebeln, dazu Gewürzgurke": { en: "3 eggs, potato slices, bacon & onions, served with pickles", ru: "3 яйцами, ломтиками картофеля, беконом и луком, подается с маринованными огурцами" },
  "Pommes frites mit pikanter Chili-Cheese-Sauce & Jalapeños": { en: "French fries with spicy chili cheese sauce & jalapeños", ru: "Картофель фри с острым сырным соусом чили и халапеньо" },
  "knusprig gebackene Zwiebelringe": { en: "crispy baked onion rings", ru: "хрустящие жареные луковые кольца" },
  "Pommes frites mit Chili-Sauce": { en: "French fries with chili sauce", ru: "Картофель фри с соусом чили" },
  "mit Knoblauchsauce": { en: "with garlic sauce", ru: "с чесночным соусом" }
};

const fullStringTranslations = {
  "mit Tzatziki, Krautsalat, Pommes frites oder Reis": { en: "with tzatziki, coleslaw, french fries or rice", ru: "с дзадзики, капустным салатом, картофелем фри или рисом" },
  "mit Sauce Hollandaise, Käse überbacken & ½ Fladenbrot": { en: "with hollandaise sauce, baked with cheese & ½ flatbread", ru: "с голландским соусом, запеченный с сыром и ½ лепешки" },
  "mit Zwiebeln, Krautsalat & Tzatziki": { en: "with onions, coleslaw & tzatziki", ru: "с луком, капустным салатом и дзадзики" },
  "Tomatensauce & Käse": { en: "Tomato sauce & cheese", ru: "Томатный соус и сыр" }
};

function translateDesc(desc) {
  if (fullStringTranslations[desc]) {
    return { de: desc, en: fullStringTranslations[desc].en, ru: fullStringTranslations[desc].ru };
  }
  
  let en = desc;
  let ru = desc;
  
  // Replace larger phrases first
  const sortedKeys = Object.keys(translationDict).sort((a, b) => b.length - a.length);
  
  for (const key of sortedKeys) {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    if (key.includes('&') || key.includes('½')) {
       // direct replace
       en = en.split(key).join(translationDict[key].en);
       ru = ru.split(key).join(translationDict[key].ru);
    } else {
       en = en.replace(regex, translationDict[key].en);
       ru = ru.replace(regex, translationDict[key].ru);
    }
  }

  // Cleanup capitalization for English
  en = en.replace(/\s+/g, ' ').trim();
  ru = ru.replace(/\s+/g, ' ').trim();

  return { de: desc, en, ru };
}

// Regex to match "desc": "..."
const regex = /"desc":\s*"([^"]*)"/g;

menuContent = menuContent.replace(regex, (match, p1) => {
  const trans = translateDesc(p1);
  return `"desc": ${JSON.stringify(trans)}`;
});

fs.writeFileSync(menuPath, menuContent);
console.log('menu.js translation applied.');

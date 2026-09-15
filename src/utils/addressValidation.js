import { storeData } from '../data/storeData';

/**
 * Checks if a string looks like random keyboard mashing or gibberish.
 */
export function isGibberish(text) {
  if (!text || typeof text !== 'string') return true;
  const cleaned = text.trim().toLowerCase();
  
  if (cleaned.length < 2) return true;

  // 1. Common junk words
  const junkWords = [
    'test', 'asdf', 'qwer', 'pups', 'hausen', 'blabla', 'xxx', 'abc', '123',
    'üplk', 'fsdaf', 'sdsf', 'lskd', 'skdl', 'jkjk', 'dfgh', 'ghjk', 'yxcv'
  ];
  if (junkWords.some(j => cleaned.includes(j))) {
    return true;
  }

  // 2. Too many consecutive consonants without a vowel (except common German clusters sch, str, pf, st, br, gr, tr, kr, fr, dr, pr)
  // Strip common German valid consonant clusters first
  const normalized = cleaned
    .replace(/sch/g, 's')
    .replace(/str/g, 's')
    .replace(/ck/g, 'k')
    .replace(/tz/g, 'z')
    .replace(/pf/g, 'p')
    .replace(/ph/g, 'f')
    .replace(/th/g, 't')
    .replace(/ng/g, 'g')
    .replace(/nk/g, 'k');

  // Check for 4 or more consecutive consonants
  if (/[bcdfghjklmnpqrstvwxyz]{4,}/i.test(normalized)) {
    return true;
  }

  // 3. Repeating single character 3+ times (e.g., 'aaaa', 'ssss')
  if (/(.)\1{2,}/i.test(cleaned)) {
    return true;
  }

  // 4. Check vowel to consonant ratio for words > 4 chars (German words have at least 1 vowel/umlaut per 4-5 chars)
  const words = cleaned.split(/\s+/);
  for (const word of words) {
    if (word.length >= 5) {
      const vowelCount = (word.match(/[aeiouäöüy]/gi) || []).length;
      if (vowelCount === 0) return true; // No vowels in 5+ char word -> gibberish
    }
  }

  return false;
}

export function validateCustomerName(name) {
  if (!name || !name.trim()) {
    return 'Bitte geben Sie Ihren vollständigen Namen ein.';
  }
  const trimmed = name.trim();
  if (trimmed.length < 3) {
    return 'Der Name muss mindestens 3 Zeichen lang sein.';
  }
  if (isGibberish(trimmed)) {
    return 'Bitte geben Sie einen gültigen Vor- und Nachnamen ein.';
  }
  return null;
}

export function validateEmail(email) {
  if (!email || !email.trim()) {
    return 'Bitte geben Sie Ihre E-Mail-Adresse ein.';
  }
  const cleanEmail = email.trim().toLowerCase();
  
  // Standard RFC email regex with TLD check
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/;
  if (!emailRegex.test(cleanEmail)) {
    return 'Bitte geben Sie eine gültige E-Mail-Adresse ein (z. B. max@beispiel.de).';
  }

  // Reject explicit test/junk email addresses only
  const junkEmails = [
    'test@test.com', 'test@test.de', 'asdf@asdf.com', 'asdf@asdf.de',
    'xxx@xxx.com', 'abc@abc.com', 'a@a.com', '123@123.com'
  ];
  if (junkEmails.includes(cleanEmail) || cleanEmail.startsWith('test@') || cleanEmail.startsWith('asdf@')) {
    return 'Bitte geben Sie eine reale E-Mail-Adresse ein (keine Test-E-Mail).';
  }

  return null;
}

export function validatePhone(phone) {
  if (!phone || !phone.trim()) {
    return 'Bitte geben Sie Ihre Telefonnummer für Rückfragen ein.';
  }
  
  const cleanPhone = phone.trim().replace(/[\s\-\/\(\)]/g, '');

  // German / EU phone pattern: must start with 0 or + or 00
  if (!/^(0|\+49|\+45|\+43|\+41|0049|0045)/.test(cleanPhone)) {
    return 'Bitte geben Sie eine gültige deutsche/europäische Telefonnummer an (z. B. 04621 123456 oder 0170 1234567).';
  }

  // Must contain only digits (and optional leading +)
  if (!/^\+?\d{7,15}$/.test(cleanPhone)) {
    return 'Bitte geben Sie eine gültige Telefonnummer ein (7 bis 15 Ziffern, z. B. 0171 12345678).';
  }

  return null;
}

export function validateStreet(street) {
  if (!street || !street.trim()) {
    return 'Bitte geben Sie Ihre Straße und Hausnummer ein.';
  }
  const trimmed = street.trim();
  
  if (trimmed.length < 4) {
    return 'Bitte geben Sie eine vollständige Straße mit Hausnummer ein.';
  }

  // Check if house number is present (digits)
  const match = trimmed.match(/^(.*?)\s+([0-9]+\s*[a-zA-Z\/]*)$/);
  if (!match) {
    if (!/\d+/.test(trimmed)) {
      return 'Bitte geben Sie auch eine Hausnummer an (z. B. Mühlenstraße 12).';
    }
  }

  // Extract street name part
  const streetName = trimmed.replace(/[0-9]+/g, '').trim();
  if (streetName.length < 3 || isGibberish(streetName)) {
    return 'Ungültiger Straßenname. Bitte geben Sie einen realen Straßennamen ein (z. B. Mühlenstraße 12).';
  }

  return null;
}

export function validatePlzAndCity(plz, city) {
  if (!plz || !plz.trim()) {
    return 'Bitte geben Sie Ihre Postleitzahl (PLZ) ein.';
  }
  if (!city || !city.trim()) {
    return 'Bitte geben Sie Ihren Ort ein.';
  }

  const cleanPlz = plz.trim();
  const cleanCity = city.trim();

  // Validate 5-digit German PLZ format
  if (!/^\d{5}$/.test(cleanPlz)) {
    return 'Die Postleitzahl muss genau 5 Ziffern enthalten (z. B. 24837).';
  }

  if (isGibberish(cleanCity)) {
    return 'Bitte geben Sie einen gültigen Ortnamen an (z. B. Schleswig).';
  }

  // Filter delivery zones for matching PLZ
  const validZonesForPlz = storeData.deliveryZones.filter(z => z.zip === cleanPlz);

  if (validZonesForPlz.length === 0) {
    const supportedPlzs = Array.from(new Set(storeData.deliveryZones.map(z => z.zip).filter(z => z !== '—'))).join(', ');
    return `Die PLZ ${cleanPlz} liegt nicht in unserem Liefergebiet. Wir beliefern unter anderem: ${supportedPlzs}.`;
  }

  // Check if city matches one of the valid cities for this PLZ
  const cityMatch = validZonesForPlz.some(z => 
    z.city.toLowerCase() === cleanCity.toLowerCase() ||
    cleanCity.toLowerCase().includes(z.city.toLowerCase()) ||
    z.city.toLowerCase().includes(cleanCity.toLowerCase())
  );

  if (!cityMatch) {
    const validCityNames = validZonesForPlz.map(z => z.city).join(', ');
    return `Der Ort "${cleanCity}" passt nicht zur PLZ ${cleanPlz}. Gültige Orte für ${cleanPlz}: ${validCityNames}.`;
  }

  return null;
}

export function validateCheckoutForm(orderType, { customerName, customerEmail, phone, street, plz, city }) {
  const errors = {};

  const nameError = validateCustomerName(customerName);
  if (nameError) errors.customerName = nameError;

  const emailError = validateEmail(customerEmail);
  if (emailError) errors.customerEmail = emailError;

  const phoneError = validatePhone(phone);
  if (phoneError) errors.phone = phoneError;

  if (orderType === 'delivery') {
    const streetError = validateStreet(street);
    if (streetError) errors.street = streetError;

    const plzCityError = validatePlzAndCity(plz, city);
    if (plzCityError) errors.plz = plzCityError;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates real street & house number exist in the target PLZ/City using OpenStreetMap Nominatim API.
 */
export async function validateRealAddressWithOSM(street, plz, city) {
  try {
    const cleanStreet = (street || '').trim();
    const cleanPlz = (plz || '').trim();
    const cleanCity = (city || '').trim();

    if (!cleanStreet || !cleanPlz) return { isValid: true }; // Fallback if missing

    // Extract house number if present
    const houseNumberMatch = cleanStreet.match(/\b\d+\s*[a-zA-Z]?\b/);
    const houseNumber = houseNumberMatch ? houseNumberMatch[0] : '';
    const streetOnly = cleanStreet.replace(/\b\d+\s*[a-zA-Z]?\b/g, '').trim();

    // Call OpenStreetMap Nominatim API with structured parameters
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&street=${encodeURIComponent(cleanStreet)}&postalcode=${encodeURIComponent(cleanPlz)}&city=${encodeURIComponent(cleanCity)}&country=Germany`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'PizzaKingSchleswig/1.0 (kontakt@pizzaking-schleswig.de)'
      }
    });

    if (!response.ok) {
      // If OSM rate-limited or offline, don't block order
      return { isValid: true };
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      // Try searching street without house number in that PLZ to distinguish missing house number vs invalid street
      const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&street=${encodeURIComponent(streetOnly)}&postalcode=${encodeURIComponent(cleanPlz)}&country=Germany`;
      const fallbackRes = await fetch(fallbackUrl, {
        headers: { 'User-Agent': 'PizzaKingSchleswig/1.0 (kontakt@pizzaking-schleswig.de)' }
      });
      const fallbackData = await fallbackRes.json();

      if (!fallbackData || fallbackData.length === 0) {
        return {
          isValid: false,
          error: `Die Straße "${streetOnly}" existiert nicht in ${cleanCity} (${cleanPlz}). Bitte überprüfen Sie Ihre Eingabe.`
        };
      }

      if (houseNumber) {
        return {
          isValid: false,
          error: `Die Hausnummer "${houseNumber}" wurde in "${streetOnly}" in ${cleanCity} (${cleanPlz}) nicht gefunden. Bitte prüfen Sie Ihre Hausnummer.`
        };
      }

      return {
        isValid: false,
        error: `Die Adresse "${cleanStreet}" existiert nicht in ${cleanCity} (${cleanPlz}).`
      };
    }

    // Verify returning postalcode / city matches roughly
    const match = data.find(item => {
      const addr = item.address || {};
      const itemZip = addr.postcode || '';
      return itemZip.startsWith(cleanPlz.substring(0, 3));
    });

    if (!match && data.length > 0) {
      // Returned address belongs to a completely different town/region
      return {
        isValid: false,
        error: `Die Adresse "${cleanStreet}" liegt nicht in ${cleanCity} (${cleanPlz}). Bitte prüfen Sie die Straßenangabe.`
      };
    }

    return { isValid: true };
  } catch (err) {
    console.warn('OSM Address Validation error:', err);
    return { isValid: true }; // On network error, gracefully fallback to valid to not block customer
  }
}

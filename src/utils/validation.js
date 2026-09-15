import { storeData } from '../data/storeData';

/**
 * Validates full customer name (no fake entries like 'test', 'asdf', '123')
 */
export function validateName(name) {
  if (!name || name.trim().length < 3) {
    return { valid: false, error: 'Bitte gib deinen vollständigen Namen ein (mind. 3 Zeichen).' };
  }
  const cleanName = name.trim().toLowerCase();
  const fakePatterns = ['test', 'asdf', 'qwer', 'xyz', 'abc', '123', 'fake', 'pups', 'bla', 'hallo'];
  if (fakePatterns.some(p => cleanName === p || cleanName === `${p} ${p}`)) {
    return { valid: false, error: 'Bitte gib einen echten Vor- und Nachnamen ein.' };
  }
  // Must contain letters
  if (!/^[a-zA-ZäöüÄÖÜß\s\-\'\.]+$/.test(name.trim())) {
    return { valid: false, error: 'Der Name darf nur Buchstaben und Bindestriche enthalten.' };
  }
  return { valid: true };
}

/**
 * Validates Email Address format
 */
export function validateEmail(email) {
  if (!email || !email.trim()) {
    return { valid: false, error: 'Bitte gib eine gültige E-Mail-Adresse ein.' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: 'Bitte gib eine korrekte E-Mail-Adresse ein (z.B. name@beispiel.de).' };
  }
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail.includes('test@test') || cleanEmail.includes('asdf@') || cleanEmail.includes('@pups')) {
    return { valid: false, error: 'Bitte verwende eine echte E-Mail-Adresse.' };
  }
  return { valid: true };
}

/**
 * Validates Phone number
 */
export function validatePhone(phone) {
  if (!phone || !phone.trim()) {
    return { valid: false, error: 'Bitte gib eine Telefonnummer für Rückfragen an.' };
  }
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 6 || digitsOnly.length > 15) {
    return { valid: false, error: 'Bitte gib eine gültige Telefonnummer mit mind. 6 Ziffern ein.' };
  }
  if (/^0+$|^12345/.test(digitsOnly)) {
    return { valid: false, error: 'Bitte gib eine echte Telefonnummer ein.' };
  }
  return { valid: true };
}

/**
 * Validates Street and House Number
 */
export function validateStreet(street) {
  if (!street || street.trim().length < 4) {
    return { valid: false, error: 'Bitte gib Straße und Hausnummer an (z.B. Mühlenstraße 12).' };
  }
  const cleanStreet = street.trim().toLowerCase();
  const fakePatterns = ['test', 'asdf', 'pups', 'bla', 'hallo', 'straße 1', 'street'];
  if (fakePatterns.some(p => cleanStreet === p || cleanStreet.startsWith(p))) {
    return { valid: false, error: 'Bitte gib eine echte Straße und Hausnummer ein.' };
  }
  // Should contain at least one number/digit for house number
  if (!/\d/.test(street)) {
    return { valid: false, error: 'Bitte gib auch die Hausnummer an (z.B. Mühlenstraße 12).' };
  }
  return { valid: true };
}

/**
 * Validates German PLZ and matches delivery zones
 */
export function validatePlzAndCity(plz, city, orderType = 'delivery') {
  if (orderType === 'pickup') {
    return { valid: true };
  }

  const cleanPlz = plz ? plz.trim() : '';
  const cleanCity = city ? city.trim() : '';

  if (!cleanPlz || !/^\d{5}$/.test(cleanPlz)) {
    return { valid: false, error: 'Bitte gib eine gültige 5-stellige deutsche Postleitzahl (PLZ) ein.' };
  }

  if (!cleanCity || cleanCity.length < 2) {
    return { valid: false, error: 'Bitte gib einen gültigen Ort an.' };
  }

  const fakeCities = ['pupshausen', 'teststadt', 'test', 'asdf', 'fake', 'blacity'];
  if (fakeCities.includes(cleanCity.toLowerCase())) {
    return { valid: false, error: 'Ungültiger Ort. Wir beliefern nur das Liefergebiet Schleswig & Umgebung.' };
  }

  // Check if PLZ or City is in our delivery zones
  const matchedZone = storeData.deliveryZones.find(z => 
    (z.zip !== '—' && z.zip === cleanPlz) || 
    z.city.toLowerCase() === cleanCity.toLowerCase()
  );

  if (!matchedZone) {
    return { 
      valid: false, 
      error: `Der Ort "${cleanCity}" (${cleanPlz}) liegt leider außerhalb unseres Liefergebiets. Bitte überprüfe das Liefergebiet.` 
    };
  }

  return { valid: true, matchedZone };
}

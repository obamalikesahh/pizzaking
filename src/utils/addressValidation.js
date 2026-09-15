import { storeData } from '../data/storeData';

// Common junk patterns to reject
const JUNK_PATTERNS = [
  /^test/i,
  /test$/i,
  /^asdf/i,
  /^qwer/i,
  /^xxx/i,
  /^abc/i,
  /^123/i,
  /pups/i,
  /hausen$/i,
  /bla\s*bla/i,
  /(.)\1{4,}/i // 5 or more identical repeating characters
];

export function isJunkText(text) {
  if (!text || typeof text !== 'string') return true;
  const trimmed = text.trim();
  if (trimmed.length < 2) return true;
  return JUNK_PATTERNS.some(pattern => pattern.test(trimmed));
}

export function validateCustomerName(name) {
  if (!name || name.trim().length < 2) {
    return 'Bitte geben Sie Ihren vollständigen Namen ein.';
  }
  if (isJunkText(name)) {
    return 'Bitte geben Sie einen gültigen Namen ein (keine Test-Eingaben).';
  }
  return null;
}

export function validateEmail(email) {
  if (!email || !email.trim()) {
    return 'Bitte geben Sie Ihre E-Mail-Adresse ein.';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
  }
  if (isJunkText(email.split('@')[0])) {
    return 'Bitte geben Sie eine reale E-Mail-Adresse ein.';
  }
  return null;
}

export function validatePhone(phone) {
  if (!phone || !phone.trim()) {
    return 'Bitte geben Sie Ihre Telefonnummer für Rückfragen ein.';
  }
  const cleanPhone = phone.replace(/[\s\-\+\(\)]/g, '');
  if (!/^\d{6,15}$/.test(cleanPhone)) {
    return 'Bitte geben Sie eine gültige Telefonnummer ein (mind. 6 Ziffern).';
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
  // Must contain at least one number for house number
  if (!/\d+/.test(trimmed)) {
    return 'Bitte geben Sie auch eine Hausnummer an (z. B. Mühlenstraße 12).';
  }
  if (isJunkText(trimmed)) {
    return 'Bitte geben Sie eine reale Adresse ein (keine Test-Eingaben).';
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

  if (isJunkText(cleanCity) || cleanCity.length < 2) {
    return 'Bitte geben Sie einen gültigen Ortnamen an (z. B. Schleswig).';
  }

  // Check against known delivery zones
  const matchingZone = storeData.deliveryZones.find(z => 
    z.zip === cleanPlz || z.city.toLowerCase() === cleanCity.toLowerCase()
  );

  if (matchingZone) {
    // If PLZ and City are both provided, check if they align or are valid
    if (matchingZone.zip !== '—' && matchingZone.zip !== cleanPlz && matchingZone.city.toLowerCase() === cleanCity.toLowerCase()) {
      // Small adjustment suggestion or allow if city matches
    }
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

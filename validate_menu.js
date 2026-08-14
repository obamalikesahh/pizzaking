import fs from 'fs';
import { menuData } from './src/data/menu.js';

let invalidItems = [];

menuData.forEach(cat => {
  if (!cat.category || !Array.isArray(cat.items)) {
    console.error('Invalid category:', cat);
  }
  cat.items.forEach(item => {
    if (!item.id || !item.name || !item.price || typeof item.price !== 'string') {
      invalidItems.push({ cat: cat.category, item });
    }
  });
});

console.log('Invalid items found:', invalidItems.length);
if (invalidItems.length > 0) {
  console.log(invalidItems);
}

const fs = require('fs');
const path = require('path');
const https = require('https');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const foodDir = path.join(__dirname, '..', 'public', 'food');
if (!fs.existsSync(foodDir)) {
  fs.mkdirSync(foodDir, { recursive: true });
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filepath))
           .on('error', reject)
           .once('close', () => resolve(filepath));
      } else if (res.statusCode === 301 || res.statusCode === 302) {
        downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
      } else {
        res.resume();
        reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function main() {
  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} products. Downloading local images...`);

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const filename = `food_${product.id}.jpg`;
    const filepath = path.join(foodDir, filename);
    const localUrl = `/food/${filename}`;

    // Generate a perfectly matching image via Pollinations AI
    const prompt = encodeURIComponent(`Delicious ${product.name} ${product.category} top down view highly detailed food photography`);
    const aiUrl = `https://image.pollinations.ai/prompt/${prompt}?width=500&height=500&nologo=true`;

    console.log(`[${i+1}/${products.length}] Downloading image for ${product.name}...`);
    try {
      await downloadImage(aiUrl, filepath);
      
      // Update database to point to the local file
      await prisma.product.update({
        where: { id: product.id },
        data: { imageUrl: localUrl }
      });
      console.log(` -> Saved to ${localUrl}`);
    } catch (err) {
      console.error(` -> Failed to download for ${product.name}: ${err.message}`);
    }
    
    // Slight delay to not overwhelm the API
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('All images downloaded and database updated! Images are now 100% local.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

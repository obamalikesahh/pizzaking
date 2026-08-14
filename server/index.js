import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';
const { Pool } = pg;
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Groq from 'groq-sdk';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load root .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });
// Load server .env (overrides root .env if variables conflict)
dotenv.config({ override: true });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'missing-key' });

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ionos.de',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const RESTAURANT_EMAIL = process.env.RESTAURANT_EMAIL || 'info@pizzaking-schleswig.com';

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    });
    
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'User not found' });
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid password' });
    
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/user/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    res.json({ user: { id: user.id, name: user.name, email: user.email, address: user.address } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

// ✉️ BACKEND IONOS E-MAIL ENDPOINTS
app.post('/api/send-verification', async (req, res) => {
  try {
    const { toEmail, userName, code } = req.body;
    console.log(`✉️ [Server Mailer] Sende Code ${code} an ${toEmail}...`);

    const info = await transporter.sendMail({
      from: `"Pizza King Schleswig" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `🔑 Dein Verifizierungscode für Pizza King: ${code}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 25px; background: #0a0b0a; color: #ffffff; border-radius: 12px; border: 1px solid #cfa670;">
          <h2 style="color: #cfa670; margin-top: 0;">Willkommen bei Pizza King Schleswig!</h2>
          <p style="font-size: 16px;">Hallo <strong>${userName}</strong>,</p>
          <p>vielen Dank für deine Registrierung. Dein 6-stelliger Verifizierungscode lautet:</p>
          <div style="background: rgba(207, 166, 112, 0.2); border: 2px solid #cfa670; font-size: 28px; font-weight: bold; letter-spacing: 6px; padding: 18px; text-align: center; border-radius: 10px; color: #cfa670; margin: 25px 0;">
            ${code}
          </div>
          <p style="color: #aaaaaa; font-size: 13px;">Gib diesen Code im Anmeldefenster ein, um dein Kundenkonto zu aktivieren.</p>
        </div>
      `
    });

    console.log('IONOS Email gesendet:', info.messageId);
    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Server Mailer Error (IONOS):', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/send-order', async (req, res) => {
  try {
    const { toEmail, order } = req.body;
    console.log(`✉️ [Server Mailer] Sende Bestellbestätigung für Order ${order.id}...`);

    if (!RESEND_API_KEY) {
      return res.status(400).json({ error: 'No Resend API Key' });
    }

    const itemsListHtml = order.items.map(i => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); width: 60px;">
          ${i.image ? `<img src="https://www.pizzaking-schleswig.com${i.image}" alt="${i.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; border: 1px solid #cfa670;" />` : ''}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05);">
          <strong style="color: #ffffff;">${i.quantity}x ${i.name}</strong>
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: right; color: #cfa670; font-weight: bold;">
          ${(i.price * i.quantity).toFixed(2).replace('.', ',')} €
        </td>
      </tr>
    `).join('');

    // 1. Kunden Mail
    await transporter.sendMail({
      from: `"Pizza King Schleswig" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `🍕 Bestellbestätigung #${order.id} - Pizza King`,
      html: `
        <div style="font-family: 'Inter', Helvetica, sans-serif; background-color: #111111; color: #ffffff; padding: 40px 20px; text-align: center;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1px solid #cfa670;">
            <div style="background: linear-gradient(135deg, #cfa670 0%, #b88645 100%); padding: 30px 20px;">
              <h1 style="color: #111111; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">Pizza King</h1>
              <p style="color: #111111; margin: 10px 0 0; font-weight: 600;">Deine Bestellung ist eingegangen!</p>
            </div>
            <div style="padding: 30px 20px; text-align: left;">
              <h2 style="color: #cfa670; margin-top: 0; font-size: 22px;">Bestellbestätigung #${order.id}</h2>
              <p style="font-size: 16px; color: #dddddd;">Hallo ${order.customer || 'Kunde'},</p>
              <p style="font-size: 16px; color: #dddddd; line-height: 1.5;">Vielen Dank für deine Bestellung! Wir haben deine Bestellung erhalten und bereiten sie gerade frisch für dich zu.</p>
              
              <h3 style="color: #ffffff; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-top: 30px;">Deine Artikel</h3>
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                ${itemsListHtml}
              </table>
              
              <div style="margin-top: 20px; text-align: right; font-size: 20px; color: #cfa670; font-weight: bold;">
                Gesamtsumme: ${(order.total || 0).toFixed(2).replace('.', ',')} €
              </div>
            </div>
            <div style="background-color: #0a0a0a; padding: 25px 20px; font-size: 14px; color: #888888; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
              <p style="margin: 0 0 5px 0;"><strong>Euer Pizza King Team!</strong></p>
              <p style="margin: 0 0 5px 0;">Adresse: Domziegelhof 12-14, 24837 Schleswig</p>
              <p style="margin: 0 0 5px 0;">Telefon: 04621/ 999 460 oder 04621/ 999 461</p>
              <p style="margin: 0;">Email: <a href="mailto:info@pizzaking-schleswig.de" style="color: #cfa670; text-decoration: none;">info@pizzaking-schleswig.de</a></p>
            </div>
          </div>
        </div>
      `
    });

    // 2. Restaurant Inhaber Mail
    const adminEmail = process.env.RESTAURANT_EMAIL || process.env.SMTP_USER;
    await transporter.sendMail({
      from: `"Pizza King System" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `🚨 NEUE BESTELLUNG EINGEGANGEN! (${order.id} - ${(order.total || 0).toFixed(2).replace('.', ',')} €)`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 25px; background: #111111; color: #ffffff; border-radius: 12px; border: 2px solid #22c55e;">
          <h1 style="color: #22c55e; margin-top: 0;">🚨 NEUE BESTELLUNG EINGEGANGEN!</h1>
          <p><strong>Kunde:</strong> ${order.customer}</p>
          <p><strong>Telefon:</strong> ${order.phone}</p>
          <p><strong>Adresse:</strong> ${order.address}</p>
          <p><strong>Zahlung:</strong> ${order.payment}</p>
          <h3>Bestellung:</h3>
          <ul>${itemsListHtml}</ul>
          <h2>Gesamtsumme: ${(order.total || 0).toFixed(2).replace('.', ',')} €</h2>
        </div>
      `
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Server Order Mailer Error (IONOS):', error);
    res.status(500).json({ error: error.message });
  }
});

// --- NEWSLETTER API ---
app.post('/api/newsletter/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    // Generiere einen 10% Rabattcode
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const numPart = Math.floor(100 + Math.random() * 900);
    const codeStr = `KING-${numPart}-${randomPart}`;

    // Ablaufdatum in 1 Monat
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const discountCode = await prisma.discountCode.create({
      data: {
        code: codeStr,
        email: email,
        discount: 10,
        expiresAt: expiresAt
      }
    });

    // Sende Email
    await transporter.sendMail({
      from: `"Pizza King Schleswig" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `🎁 Dein 10% Willkommens-Gutschein für Pizza King!`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 25px; background: #0a0b0a; color: #ffffff; border-radius: 12px; border: 1px solid #cfa670;">
          <h2 style="color: #cfa670; margin-top: 0;">Willkommen im VIP King-Club!</h2>
          <p style="font-size: 16px;">Vielen Dank für deine Anmeldung zum Newsletter.</p>
          <p>Hier ist dein persönlicher 10% Rabattcode für deine nächste Bestellung:</p>
          <div style="background: rgba(207, 166, 112, 0.2); border: 2px solid #cfa670; font-size: 28px; font-weight: bold; letter-spacing: 4px; padding: 18px; text-align: center; border-radius: 10px; color: #cfa670; margin: 25px 0;">
            ${codeStr}
          </div>
          <p style="color: #aaaaaa; font-size: 13px;">Dieser Code ist einmalig einlösbar und gültig bis zum ${expiresAt.toLocaleDateString('de-DE')}.</p>
        </div>
      `
    });

    res.json({ success: true, code: codeStr });
  } catch (error) {
    console.error('Newsletter Subscribe Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/discount/validate', async (req, res) => {
  try {
    const { code } = req.body;
    const discountCode = await prisma.discountCode.findUnique({ where: { code } });
    if (!discountCode) return res.status(400).json({ error: 'Ungültiger Code' });
    if (discountCode.isUsed) return res.status(400).json({ error: 'Code wurde bereits verwendet' });
    if (new Date() > new Date(discountCode.expiresAt)) return res.status(400).json({ error: 'Code ist abgelaufen' });
    
    res.json({ success: true, discount: discountCode.discount });
  } catch (error) {
    res.status(500).json({ error: 'Validierungsfehler' });
  }
});

// --- KOCHKING KI CHAT ---

const systemInstruction = "Du bist KochKing, der freundliche, professionelle und hilfreiche KI-Assistent von Pizza King Schleswig. Du hilfst Kunden bei Fragen zu ihrer Bestellung. Du antwortest kurz, prägnant und freundlich. Wenn ein Kunde ein schwerwiegendes Problem meldet (z.B. falsches Essen, kaltes Essen), nutze das escalateToHuman Tool, um ihm anzubieten, sich mit einem Mitarbeiter in Verbindung zu setzen. Wenn ein Kunde nach seiner Bestellung fragt und eine Nummer angibt, nutze das checkOrderStatus Tool.";

const groqTools = [
  {
    type: "function",
    function: {
      name: "checkOrderStatus",
      description: "Überprüft den Status einer Bestellung anhand einer Bestellnummer (kann ein Teil der UUID sein).",
      parameters: {
        type: "object",
        properties: {
          orderId: {
            type: "string",
            description: "Die Bestellnummer (oder ein Teil davon, z.B. 123e456)"
          }
        },
        required: ["orderId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "escalateToHuman",
      description: "Leitet das Gespräch an einen menschlichen Mitarbeiter weiter. Nutze dies, wenn der Kunde ein Problem meldet (z.B. Pizza kalt, falsche Lieferung).",
      parameters: {
        type: "object",
        properties: {
          reason: {
            type: "string",
            description: "Der Grund für die Eskalation"
          }
        },
        required: ["reason"]
      }
    }
  }
];

// --- MENU API ---
app.get('/api/menu', async (req, res) => {
  try {
    const categories = await prisma.menuCategory.findMany({
      include: { items: true },
      orderBy: { order: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

app.put('/api/menu/item/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: updateData
    });
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

app.post('/api/menu/seed', async (req, res) => {
  try {
    const { menu } = req.body; // Expecting the defaultMenuData array
    // First clear existing
    await prisma.menuItem.deleteMany({});
    await prisma.menuCategory.deleteMany({});
    
    // Seed new
    for (let i = 0; i < menu.length; i++) {
      const cat = menu[i];
      const createdCat = await prisma.menuCategory.create({
        data: {
          title: cat.category,
          order: i,
          items: {
            create: cat.items.map(item => ({
              id: item.id || undefined,
              name: item.name,
              description: item.description,
              price: item.price,
              image: item.image,
              badges: item.badges ? item.badges.join(',') : null,
              bestseller: item.bestseller || false
            }))
          }
        }
      });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error seeding menu:', error);
    res.status(500).json({ error: 'Failed to seed menu' });
  }
});

// --- ORDERS API ---
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status }
    });
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// --- Offers API ---
app.get('/api/offers', async (req, res) => {
  try {
    const offers = await prisma.offer.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(offers);
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

app.post('/api/offers', async (req, res) => {
  try {
    const { title, description, badge, price, image } = req.body;
    const offer = await prisma.offer.create({
      data: { title, description, badge, price, image }
    });
    res.status(201).json(offer);
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).json({ error: 'Failed to create offer' });
  }
});

app.delete('/api/offers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.offer.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting offer:', error);
    res.status(500).json({ error: 'Failed to delete offer' });
  }
});
// ------------------

app.post('/api/chat', async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'missing-key') {
      return res.status(500).json({ error: 'Der GROQ_API_KEY fehlt in den Vercel Environment Variables. Bitte füge ihn in Vercel hinzu.' });
    }
    
    const { history, message, image } = req.body;
    
    // Format history for Groq
    let formattedMessages = [
      { role: "system", content: systemInstruction }
    ];

    history.forEach(msg => {
      formattedMessages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text
      });
    });

    formattedMessages.push({ role: "user", content: message });

    let escalationTriggered = false;
    let escalationReason = null;

    const chatCompletion = await groq.chat.completions.create({
      messages: formattedMessages,
      model: "llama-3.3-70b-versatile",
      tools: groqTools,
      tool_choice: "auto",
    });

    let responseMessage = chatCompletion.choices[0].message;
    let responseText = responseMessage.content || "";

    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      formattedMessages.push(responseMessage); // Add assistant's tool call message
      
      for (const toolCall of responseMessage.tool_calls) {
        const args = JSON.parse(toolCall.function.arguments);
        
        if (toolCall.function.name === 'checkOrderStatus') {
          const orderIdQuery = args.orderId;
          let toolResponseText = '';
          try {
            const order = await prisma.order.findFirst({
              where: {
                id: { startsWith: orderIdQuery }
              }
            });
            if (order) {
              toolResponseText = `Ich habe die Bestellung gefunden. Der Status ist: ${order.status}. Sie wurde am ${order.createdAt.toLocaleString('de-DE')} aufgegeben. (Total: ${order.totalPrice}€, Typ: ${order.orderType})`;
            } else {
              toolResponseText = `Ich konnte leider keine Bestellung mit der Nummer ${orderIdQuery} finden. Bitte überprüfe die Nummer.`;
            }
          } catch (dbError) {
            console.error('Datenbankfehler bei checkOrderStatus:', dbError.message);
            toolResponseText = `Ich konnte leider keine Bestellung mit der Nummer ${orderIdQuery} finden. Bitte überprüfe die Nummer.`;
          }
          
          formattedMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: toolCall.function.name,
            content: toolResponseText
          });
          
        } else if (toolCall.function.name === 'escalateToHuman') {
          escalationTriggered = true;
          escalationReason = args.reason;
          
          formattedMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: toolCall.function.name,
            content: "Bitte bestätige dem Kunden, dass wir uns darum kümmern und biete das Kontaktformular für die E-Mail und das Bild an."
          });
        }
      }
      
      // Make follow-up request to get the final response based on tool execution
      const followUpCompletion = await groq.chat.completions.create({
        messages: formattedMessages,
        model: "llama-3.3-70b-versatile"
      });
      responseText = followUpCompletion.choices[0].message.content;
    }

    res.json({
      text: responseText,
      escalationTriggered,
      escalationReason
    });
  } catch (error) {
    console.error('Chat Error:', error);
    if (error.status === 429 || (error.message && error.message.includes('429'))) {
      return res.status(429).json({ error: 'Zu viele Anfragen an die KI. Bitte warte einen kurzen Moment (ca. 30 Sekunden) und versuche es gleich noch einmal.' });
    }
    res.status(500).json({ error: 'Ein interner Fehler ist aufgetreten. Bitte versuche es später noch einmal.' });
  }
});

app.post('/api/chat/escalate', async (req, res) => {
  try {
    const { email, firstName, lastName, orderId, history, image, reason, description } = req.body;
    
    // HTML für den Verlauf
    const historyHtml = history.map(msg => `
      <div style="margin-bottom: 10px;">
        <strong>${msg.role === 'user' ? 'Kunde' : 'KochKing'}:</strong>
        <p style="margin: 5px 0;">${msg.text}</p>
      </div>
    `).join('');

    let attachments = [];
    if (image) {
      const matches = image.match(/^data:(.+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        attachments.push({
          filename: 'reklamation.jpg',
          content: matches[2],
          encoding: 'base64'
        });
      }
    }

    await transporter.sendMail({
      from: `"Pizza King Chat" <${process.env.SMTP_USER}>`,
      to: 'info@pizzaking-schleswig.de',
      subject: `🚨 Chat-Reklamation von ${email}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #e53e3e;">Neue Reklamation via Chat</h2>
          <p><strong>Name:</strong> ${firstName || ''} ${lastName || ''}</p>
          <p><strong>Kunden-Email:</strong> ${email}</p>
          <p><strong>Bestellnummer:</strong> ${orderId || 'Nicht angegeben'}</p>
          <p><strong>Kunden-Beschreibung:</strong> ${description || 'Keine Beschreibung angegeben'}</p>
          <p><strong>Grund (KI-Einschätzung):</strong> ${reason || 'Unbekannt'}</p>
          ${image ? '<p><strong>Ein Bild wurde angehängt.</strong></p>' : ''}
          <hr/>
          <h3>Chat-Verlauf:</h3>
          <div style="background: #f7fafc; padding: 15px; border-radius: 5px; color: #1a202c;">
            ${historyHtml}
          </div>
        </div>
      `,
      attachments
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Escalation Error:', error);
    res.status(500).json({ error: 'Failed to escalate' });
  }
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
  });
}

export default app;

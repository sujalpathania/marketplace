/**
 * seed.js - Populates the Campus Marketplace with demo listings across all categories.
 * Run: node seed.js
 */

const http = require('http');

const BASE = 'http://localhost:5000';

const SELLER = {
  fullName: 'Demo Seller',
  email: 'demo.seller@campus.edu',
  password: 'password123',
  studentId: 'STU00001'
};

const LISTINGS = [
  // ---------- Textbooks ----------
  {
    title: 'Engineering Mathematics Vol. 1',
    description: 'Comprehensive first-year engineering maths textbook. Covers calculus, linear algebra, and differential equations. Minimal highlighting.',
    price: 450,
    category: 'Textbooks',
    condition: 'Good',
    imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&q=80'
  },
  {
    title: 'Data Structures & Algorithms – Cormen',
    description: 'CLRS 3rd edition. A must-have for CS students. Some pencil notes in early chapters. Great condition overall.',
    price: 650,
    category: 'Textbooks',
    condition: 'Good',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80'
  },
  {
    title: 'Organic Chemistry – Morrison & Boyd',
    description: 'Classic chemistry reference text. All pages intact, spine is firm. Perfect for BSc / BTech Chemistry students.',
    price: 380,
    category: 'Textbooks',
    condition: 'Fair',
    imageUrl: 'https://images.unsplash.com/photo-1603354350317-6f7aaa5911c5?w=600&q=80'
  },
  {
    title: 'Economics – Samuelson & Nordhaus',
    description: 'Standard economics text used in most colleges. Clean copy, no writing. 19th edition.',
    price: 320,
    category: 'Textbooks',
    condition: 'Like New',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80'
  },

  // ---------- Electronics ----------
  {
    title: 'Logitech MX Keys Keyboard',
    description: 'Slim wireless keyboard with backlit keys. Barely used for one semester. Comes with USB-C cable and USB receiver.',
    price: 2800,
    category: 'Electronics',
    condition: 'Like New',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80'
  },
  {
    title: 'Sony WH-1000XM4 Headphones',
    description: 'Industry-leading noise cancelling headphones. Used for 6 months, all accessories included. Excellent sound.',
    price: 9500,
    category: 'Electronics',
    condition: 'Good',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80'
  },
  {
    title: 'Xiaomi 65W Desk Lamp',
    description: 'Smart LED desk lamp with adjustable brightness and color temperature. Perfect for late-night study sessions.',
    price: 900,
    category: 'Electronics',
    condition: 'Like New',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80'
  },

  // ---------- Furniture ----------
  {
    title: 'Ergonomic Study Chair',
    description: 'Mesh back office/study chair with lumbar support and adjustable height. Very comfortable for long study hours.',
    price: 3200,
    category: 'Furniture',
    condition: 'Good',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80'
  },
  {
    title: 'Compact Wooden Study Table',
    description: '3ft x 2ft wooden study table with a small drawer. Fits perfectly in a hostel room. Self-pickup only.',
    price: 1800,
    category: 'Furniture',
    condition: 'Good',
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&q=80'
  },
  {
    title: 'Hostel Bookshelf (3 Tier)',
    description: 'Lightweight metal bookshelf, easy to assemble and disassemble. Holds up to 20 books. Selling because I am graduating.',
    price: 950,
    category: 'Furniture',
    condition: 'Fair',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80'
  },

  // ---------- Clothing ----------
  {
    title: 'College Hoodie – Navy Blue (M)',
    description: 'Official college hoodie, size Medium. Worn only a few times. Washed and clean. Great for winter on campus.',
    price: 600,
    category: 'Clothing',
    condition: 'Good',
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80'
  },
  {
    title: 'Sports Track Pants (L)',
    description: 'Nike Dri-Fit track pants, size Large. Used during gym sessions. No damage, elastic waist in good shape.',
    price: 400,
    category: 'Clothing',
    condition: 'Good',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'
  },
  {
    title: 'Formal Shirt Set (S, M) – Pack of 2',
    description: 'Two light blue formal shirts for internships and presentations. Both in size S and M. Never ironed with a hot iron.',
    price: 550,
    category: 'Clothing',
    condition: 'Like New',
    imageUrl: 'https://images.unsplash.com/photo-1602810316693-3667c854239a?w=600&q=80'
  },

  // ---------- Other ----------
  {
    title: 'Bicycle – Hero Sprint 21-Speed',
    description: 'Great condition campus bicycle. 21-speed gear system, front and rear brakes. Ideal for commuting across campus.',
    price: 3500,
    category: 'Other',
    condition: 'Good',
    imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&q=80'
  },
  {
    title: 'Yoga Mat + Resistance Bands Set',
    description: 'Non-slip yoga mat with 5 resistance bands. Barely used. Perfect for hostel workouts.',
    price: 700,
    category: 'Other',
    condition: 'Like New',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80'
  }
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    };

    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('\n🌱  Campus Marketplace — Seed Script\n');

  // 1. Register demo seller (ignore error if already exists)
  console.log('👤  Registering demo seller...');
  const reg = await request('POST', '/api/auth/register', SELLER);
  let token = reg.body?.token;

  if (!token) {
    console.log('   Already registered, logging in...');
    const login = await request('POST', '/api/auth/login', {
      email: SELLER.email,
      password: SELLER.password
    });
    token = login.body?.token;
  }

  if (!token) {
    console.error('❌  Could not obtain auth token. Aborting.');
    process.exit(1);
  }

  console.log('✅  Authenticated as:', SELLER.email);
  console.log(`\n📦  Posting ${LISTINGS.length} listings...\n`);

  let ok = 0, fail = 0;
  for (const listing of LISTINGS) {
    // Post as JSON with imageUrl (bypass multer for seeding)
    const res = await request('POST', '/api/listings/seed', listing, token);
    if (res.status === 201 || res.status === 200) {
      console.log(`  ✅  [${listing.category}] ${listing.title}`);
      ok++;
    } else {
      console.log(`  ⚠️  [${listing.category}] ${listing.title} — ${JSON.stringify(res.body)}`);
      fail++;
    }
  }

  console.log(`\n🎉  Done! ${ok} created, ${fail} failed.\n`);
}

seed().catch(console.error);

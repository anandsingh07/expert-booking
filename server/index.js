const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config();

const expertRoutes = require('./routes/expertRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const Expert = require('./models/Expert');

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
    'http://localhost:5173',
    process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PATCH'],
    credentials: true,
};

const io = new Server(server, { cors: corsOptions });

app.set('io', io);
app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/experts', expertRoutes);
app.use('/api/bookings', bookingRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use((err, req, res, next) => { console.error(err.stack); res.status(500).json({ success: false, message: 'Internal Server Error' }); });

io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);
    socket.on('disconnect', () => console.log('🔌 Client disconnected:', socket.id));
});

// ── Seed helper ─────────────────────────────────────────────────────────────
const generateSlots = () => {
    const slots = []; const today = new Date();
    const times = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
    for (let d = 1; d <= 7; d++) {
        const date = new Date(today); date.setDate(today.getDate() + d);
        const dateStr = date.toISOString().split('T')[0];
        times.forEach(time => slots.push({ date: dateStr, time, isBooked: false }));
    }
    return slots;
};

const expertData = [
    { name: 'Dr. Aisha Patel', category: 'Technology', experience: 12, rating: 4.9, bio: 'Full-stack architect with 12 years in fintech and AI. Mentor to 200+ engineers.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha', hourlyRate: 150 },
    { name: 'Marcus Chen', category: 'Finance', experience: 8, rating: 4.7, bio: 'Investment strategist specializing in startup funding and venture capital.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus', hourlyRate: 120 },
    { name: 'Sara Williams', category: 'Design', experience: 6, rating: 4.8, bio: 'Award-winning UI/UX designer. Former design lead at Google and Airbnb.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara', hourlyRate: 100 },
    { name: 'Raj Kapoor', category: 'Technology', experience: 15, rating: 4.6, bio: 'Cloud infrastructure expert. AWS Solutions Architect specializing in scalability.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Raj', hourlyRate: 160 },
    { name: 'Dr. Emily Rodriguez', category: 'Healthcare', experience: 18, rating: 5.0, bio: 'Board-certified physician with expertise in telemedicine and health tech.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily', hourlyRate: 200 },
    { name: 'James Okafor', category: 'Marketing', experience: 9, rating: 4.5, bio: 'Growth hacker who scaled 3 startups to unicorn status. SEO & content strategist.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James', hourlyRate: 90 },
    { name: 'Lisa Thompson', category: 'Finance', experience: 11, rating: 4.8, bio: 'CFO coach and financial planning expert. Helped 50+ companies achieve profitability.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa', hourlyRate: 135 },
    { name: 'Dev Kumar', category: 'Technology', experience: 7, rating: 4.7, bio: 'React & React Native specialist. Built apps serving 10M+ daily users.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dev', hourlyRate: 110 },
    { name: 'Priya Sharma', category: 'Design', experience: 5, rating: 4.6, bio: 'Product designer with expertise in design systems and accessibility.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', hourlyRate: 95 },
    { name: "Nick O'Brien", category: 'Marketing', experience: 14, rating: 4.9, bio: 'Digital marketing veteran. Former CMO with expertise in brand building.', avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nick", hourlyRate: 145 },
    { name: 'Dr. Fatima Al-Said', category: 'Healthcare', experience: 20, rating: 4.9, bio: 'Nutritionist and wellness coach. Author of 3 bestselling health books.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima', hourlyRate: 180 },
    { name: 'Alex Turner', category: 'Technology', experience: 10, rating: 4.7, bio: 'Cybersecurity expert. CISO consultant specializing in startup security posture.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', hourlyRate: 170 },
];

const seedDB = async () => {
    const count = await Expert.countDocuments();
    if (count > 0) { console.log('📦 Database already seeded.'); return; }
    const expertsWithSlots = expertData.map(e => ({ ...e, slots: generateSlots() }));
    await Expert.insertMany(expertsWithSlots);
    console.log(`✅ Seeded ${expertsWithSlots.length} experts into in-memory database.`);
};

// ── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

(async () => {
    // Start in-memory MongoDB (fallback if MONGO_URI not reachable)
    let mongoUri = process.env.MONGO_URI;
    try {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
        console.log('✅ Connected to external MongoDB');
    } catch {
        console.log('⚠️  External MongoDB unavailable — starting in-memory MongoDB…');
        const mongod = await MongoMemoryServer.create();
        mongoUri = mongod.getUri();
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to in-memory MongoDB at', mongoUri);
    }

    await seedDB();

    server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
})();

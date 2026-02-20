const Expert = require('./models/Expert');
const mongoose = require('mongoose');
require('dotenv').config();

const generateSlots = () => {
    const slots = [];
    const today = new Date();
    const times = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

    for (let d = 1; d <= 7; d++) {
        const date = new Date(today);
        date.setDate(today.getDate() + d);
        const dateStr = date.toISOString().split('T')[0];
        times.forEach((time) => {
            slots.push({ date: dateStr, time, isBooked: false });
        });
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
    { name: 'Nick O\'Brien', category: 'Marketing', experience: 14, rating: 4.9, bio: 'Digital marketing veteran. Former CMO with expertise in brand building.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nick', hourlyRate: 145 },
    { name: 'Dr. Fatima Al-Said', category: 'Healthcare', experience: 20, rating: 4.9, bio: 'Nutritionist and wellness coach. Author of 3 bestselling health books.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima', hourlyRate: 180 },
    { name: 'Alex Turner', category: 'Technology', experience: 10, rating: 4.7, bio: 'Cybersecurity expert. CISO consultant specializing in startup security posture.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', hourlyRate: 170 },
];

const seed = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    await Expert.deleteMany({});
    const expertsWithSlots = expertData.map((e) => ({ ...e, slots: generateSlots() }));
    await Expert.insertMany(expertsWithSlots);
    console.log('✅ Database seeded successfully with', expertsWithSlots.length, 'experts!');
    mongoose.disconnect();
};

seed().catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
});

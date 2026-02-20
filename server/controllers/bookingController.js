const Booking = require('../models/Booking');
const Expert = require('../models/Expert');

// POST /api/bookings - Create booking (race-condition safe)
const createBooking = async (req, res) => {
    const io = req.app.get('io');
    const { expertId, name, email, phone, date, timeSlot, notes } = req.body;

    // Validation
    if (!expertId || !name || !email || !phone || !date || !timeSlot) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email address.' });
    }
    const phoneRegex = /^[\d\s\+\-\(\)]{7,15}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ success: false, message: 'Invalid phone number.' });
    }

    try {
        // Atomically mark the slot as booked to prevent race conditions
        const expert = await Expert.findOneAndUpdate(
            {
                _id: expertId,
                'slots.date': date,
                'slots.time': timeSlot,
                'slots.isBooked': false,
            },
            { $set: { 'slots.$.isBooked': true } },
            { new: true }
        );

        if (!expert) {
            return res.status(409).json({
                success: false,
                message: 'This slot is already booked or does not exist. Please choose another.',
            });
        }

        // Create actual booking record
        const booking = await Booking.create({ expertId, name, email, phone, date, timeSlot, notes });

        // Emit real-time event to all connected clients
        if (io) {
            io.emit('slotUpdate', { expertId, date, timeSlot, isBooked: true });
        }

        res.status(201).json({ success: true, data: booking });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ success: false, message: 'This slot is already booked.' });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/bookings?email=xxx - Get bookings by email
const getBookingsByEmail = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

        const bookings = await Booking.find({ email })
            .populate('expertId', 'name category avatar')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: bookings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PATCH /api/bookings/:id/status - Update booking status
const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Pending', 'Confirmed', 'Completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value.' });
        }

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

        res.json({ success: true, data: booking });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { createBooking, getBookingsByEmail, updateBookingStatus };

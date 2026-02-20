const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  date: { type: String, required: true },   // "YYYY-MM-DD"
  time: { type: String, required: true },   // "HH:MM"
  isBooked: { type: Boolean, default: false },
});

const expertSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    experience: { type: Number, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    bio: { type: String },
    avatar: { type: String },
    hourlyRate: { type: Number },
    slots: [slotSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expert', expertSchema);

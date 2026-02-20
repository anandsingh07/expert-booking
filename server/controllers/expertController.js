const Expert = require('../models/Expert');

// GET /api/experts - List with pagination, filter, search
const getExperts = async (req, res) => {
    try {
        const { search, category, page = 1, limit = 6 } = req.query;
        const filter = {};

        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }
        if (category && category !== 'All') {
            filter.category = category;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Expert.countDocuments(filter);
        const experts = await Expert.find(filter)
            .select('-slots')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ rating: -1 });

        res.json({
            success: true,
            data: experts,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/experts/:id - Single expert with slots
const getExpertById = async (req, res) => {
    try {
        const expert = await Expert.findById(req.params.id);
        if (!expert) return res.status(404).json({ success: false, message: 'Expert not found' });
        res.json({ success: true, data: expert });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getExperts, getExpertById };

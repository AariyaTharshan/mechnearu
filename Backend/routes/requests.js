const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const { auth, checkRole } = require('../middleware/auth');

// Create a new request (User only)
router.post('/', auth, checkRole(['user']), async (req, res) => {
  try {
    const { serviceType, description, location } = req.body;

    if (!location || !location.lat || !location.lng || !location.address) {
      return res.status(400).json({ message: 'Location details are required' });
    }

    const request = new Request({
      user: req.user.userId,
      serviceType,
      description,
      location
    });

    await request.save();
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error creating request', error: error.message });
  }
});

// Get user's requests (User only)
router.get('/user', auth, checkRole(['user']), async (req, res) => {
  try {
    const requests = await Request.find({ user: req.user.userId })
      .populate('mechanic', 'username')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests', error: error.message });
  }
});

// Get nearby requests (Mechanic only)
router.get('/nearby', auth, checkRole(['mechanic']), async (req, res) => {
  try {
    const requests = await Request.find({
      status: 'pending',
      mechanic: { $exists: false }
    })
    .populate('user', 'username')
    .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching nearby requests', error: error.message });
  }
});

// Get current service (Mechanic only)
router.get('/current', auth, checkRole(['mechanic']), async (req, res) => {
  try {
    const request = await Request.findOne({
      mechanic: req.user.userId,
      status: { $in: ['accepted', 'in_progress'] }
    }).populate('user', 'username');
    
    if (!request) {
      return res.status(404).json({ message: 'No current service found' });
    }
    
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching current service', error: error.message });
  }
});

// Accept request (Mechanic only)
router.post('/:id/accept', auth, checkRole(['mechanic']), async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request cannot be accepted' });
    }
    
    request.mechanic = req.user.userId;
    request.status = 'accepted';
    await request.save();
    
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error accepting request', error: error.message });
  }
});

// Update request status (Mechanic only)
router.put('/:id/status', auth, checkRole(['mechanic']), async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Request.findOne({
      _id: req.params.id,
      mechanic: req.user.userId
    });
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    request.status = status;
    await request.save();
    
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error updating request status', error: error.message });
  }
});

// Get service history
router.get('/history', auth, async (req, res) => {
  try {
    const query = req.user.role === 'mechanic'
      ? { mechanic: req.user.userId, status: 'completed' }
      : { user: req.user.userId, status: 'completed' };

    const history = await Request.find(query)
      .populate(req.user.role === 'mechanic' ? 'user' : 'mechanic', 'username')
      .sort({ updatedAt: -1 });
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching service history', error: error.message });
  }
});

// Add feedback to completed request (User only)
router.post('/:id/feedback', auth, checkRole(['user']), async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const request = await Request.findOne({
      _id: req.params.id,
      user: req.user.userId,
      status: 'completed'
    });
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    request.feedback = { rating, comment };
    await request.save();
    
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error adding feedback', error: error.message });
  }
});

// In-memory storage for live locations (for demo; use DB for production)
const liveLocations = {};

// Update live location (User or Mechanic)
router.post('/:id/location', auth, async (req, res) => {
  try {
    const { lat, lng, role } = req.body;
    if (typeof lat !== 'number' || typeof lng !== 'number' || !['user', 'mechanic'].includes(role)) {
      return res.status(400).json({ message: 'Invalid location or role' });
    }
    if (!liveLocations[req.params.id]) {
      liveLocations[req.params.id] = {};
    }
    liveLocations[req.params.id][role] = { lat, lng, updatedAt: Date.now() };
    res.json({ message: 'Location updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating location', error: error.message });
  }
});

// Get live locations for a request
router.get('/:id/locations', auth, async (req, res) => {
  try {
    const locations = liveLocations[req.params.id] || {};
    res.json({ user: locations.user || null, mechanic: locations.mechanic || null });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching locations', error: error.message });
  }
});

module.exports = router; 
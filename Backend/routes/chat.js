const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { auth } = require('../middleware/auth');

// Get chat history for a request
router.get('/:requestId/history', auth, async (req, res) => {
  try {
    const messages = await Message.find({ requestId: req.params.requestId })
      .sort({ timestamp: 1 })
      .populate('sender', 'username');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Post a new message (optional, for REST fallback)
router.post('/:requestId/message', auth, async (req, res) => {
  try {
    const { content, role } = req.body;
    const message = new Message({
      requestId: req.params.requestId,
      sender: req.user._id,
      content,
      role
    });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router; 
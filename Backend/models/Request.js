const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mechanic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  serviceType: {
    type: String,
    required: true,
    enum: ['general', 'repair', 'emergency', 'inspection']
  },
  description: {
    type: String,
    required: true
  },
  location: {
    address: {
      type: String,
      required: true
    },
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
requestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Request = mongoose.model('Request', requestSchema);

module.exports = Request; 
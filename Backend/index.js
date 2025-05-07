const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('./models/Message');
const User = require('./models/User');
const authRoutes = require('./routes/auth');
const requestRoutes = require('./routes/requests');
const chatRoutes = require('./routes/chat');

const { auth } = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/chat', chatRoutes);

// Create HTTP server (needed for Socket.IO)
const server = http.createServer(app);

// --- Socket.IO setup ---
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Use your frontend's URL/port
    methods: ['GET', 'POST']
  }
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

io.on('connection', (socket) => {
  console.log('Socket.IO client connected:', socket.id);
  // Join a room for a specific requestId
  socket.on('join', async ({ requestId, token }) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) throw new Error('User not found');
      socket.join(requestId);
      socket.data.user = user;
      socket.data.role = decoded.role;
      socket.data.requestId = requestId;
    } catch (err) {
      console.error('Socket.IO join error:', err.message);
      socket.emit('error', 'Authentication failed');
      socket.disconnect();
    }
  });

  // Handle sending a message
  socket.on('chatMessage', async ({ requestId, content }) => {
    try {
      const user = socket.data.user;
      const role = socket.data.role;
      if (!user || !requestId || !content) return;
      const message = new Message({
        requestId,
        sender: user._id,
        content,
        role
      });
      await message.save();
      const msgData = {
        _id: message._id,
        requestId,
        sender: { _id: user._id, username: user.username },
        content,
        role,
        timestamp: message.timestamp
      };
      io.to(requestId).emit('chatMessage', msgData);
    } catch (err) {
      socket.emit('error', 'Failed to send message');
    }
  });

  socket.on('disconnect', () => {
    // Optionally handle disconnect logic
  });
});
// --- End Socket.IO setup ---

// Connect to MongoDB
mongoose.connect('mongodb+srv://bharath:Bharath@cluster0.1gkorum.mongodb.net/MECHIDT', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
  // Start server
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})
.catch((err) => console.error('MongoDB connection error:', err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
}); 
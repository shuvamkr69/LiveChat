import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the frontend from "../frontend/live-chat/dist"
const frontendPath = path.join(__dirname, '../frontend/live-chat/dist');
app.use(express.static(frontendPath));

// Serve index.html for all routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
});

const users = {}; // Store users by socket ID

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id} from ${socket.handshake.address}`);

  // Store username when user joins
  socket.on("setUsername", (username) => {
    users[socket.id] = username; // Save username by socket ID
  });

  socket.on("sendMessage", (data) => {
    const senderName = users[socket.id] || "Anonymous"; // Get sender's name
    const messageData = { text: data.message, sender: senderName, fromServer: false };

    // Send message to **everyone including the sender**
    io.emit("receiveMessage", messageData);
  });

  socket.on("disconnect", () => {
    delete users[socket.id]; // Remove user on disconnect
    console.log("User disconnected:", socket.id);
  });
});

// Listen on 0.0.0.0 to allow access from external devices
const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT} or on network`);
});

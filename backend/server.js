import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'node:path';

const app = express();
app.use(cors());

// Serve the frontend from "../frontend/live-chat/dist"
const __dirname = path.resolve();  // Get absolute path
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
  },
});

app.get('/', (req, res) => {
  res.send('Server is running...');
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

server.listen(3000, '0.0.0.0' , () => {
  console.log('Server running at http://10.22.55.165:3000');
});

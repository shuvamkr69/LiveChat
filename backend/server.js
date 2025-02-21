import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
  },
});

app.get('/', (req, res) => {
  res.send('Server is running...');
});

const users = {}; // Store users by socket ID

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

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

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});

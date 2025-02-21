import { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000"); // Change to your backend URL

const LiveChat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [isUsernameSet, setIsUsernameSet] = useState(false);

  const handleUsernameSubmit = () => {
    if (username.trim()) {
      socket.emit("setUsername", username); // Send username to server
      setIsUsernameSet(true);
    }
  };

  // Listen for new messages from server
  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [
        ...prev,
        { text: data.text, sender: data.sender, self: data.sender === username }
      ]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [username]);

  // Send message to server
  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("sendMessage", { message });
      setMessage(""); // Clear input
    }
  };

  return (
    <div className="flex flex-col h-screen items-center justify-center bg-gray-100">
      {!isUsernameSet ? (
        <div className="bg-white shadow-lg rounded-lg p-4">
          <h2 className="text-xl font-bold">Enter Username</h2>
          <input
            type="text"
            className="border p-2 rounded-lg mt-2 w-full"
            placeholder="Username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg w-full"
            onClick={handleUsernameSubmit}
          >
            Join Chat
          </button>
        </div>
      ) : (
        <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-4">
          <h2 className="text-xl font-bold">Live Chat Room</h2>
          <div className="h-96 overflow-y-auto border p-2 mt-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 my-1 rounded-lg ${
                  msg.self ? "bg-blue-500 text-white ml-auto" : "bg-gray-200 text-black"
                }`}
                style={{ maxWidth: "75%" }}
              >
                <strong>{msg.self ? "You" : msg.sender}: </strong> {msg.text}
              </div>
            ))}
          </div>
          <div className="flex mt-2">
            <input
              type="text"
              className="flex-1 border p-2 rounded-lg"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              className="ml-2 px-4 py-2 bg-black text-white rounded-lg"
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveChat;

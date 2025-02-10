const WebSocket = require("ws");
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index_02.html");
});

// Kết nối MongoDB
mongoose
  .connect("mongodb://admin:password@localhost:27017/", {
    dbName: "chatdb",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("🔗 Đã kết nối MongoDB"))
  .catch((err) => console.log("Lỗi kết nối MongoDB:", err));

const rooms = {}; // Quản lý danh sách client theo phòng

wss.on("connection", (ws) => {
  let currentRoom = null;

  ws.on("message", async (data) => {
    const { type, room, username, message } = JSON.parse(data);

    if (type === "join") {
      currentRoom = room;
      if (!rooms[room]) rooms[room] = new Set();
      rooms[room].add(ws);

      // Gửi tin nhắn cũ trong phòng
      const oldMessages = await Message.find({ room }).sort({ timestamp: 1 });
      ws.send(JSON.stringify({ type: "history", messages: oldMessages }));
    } else if (type === "message" && currentRoom) {
      // Lưu tin nhắn vào MongoDB
      const newMessage = new Message({ room, username, message });
      await newMessage.save();

      // Gửi tin nhắn đến tất cả người dùng trong phòng
      rooms[currentRoom].forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "message", username, message }));
        }
      });
    }
  });

  ws.on("close", () => {
    if (currentRoom && rooms[currentRoom]) {
      rooms[currentRoom].delete(ws);
      if (rooms[currentRoom].size === 0) delete rooms[currentRoom];
    }
  });
});

server.listen(3000, () => {
  console.log("🚀 Server chạy tại http://localhost:3000");
});

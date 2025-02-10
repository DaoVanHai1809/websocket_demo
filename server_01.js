const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app); // Khởi tạo HTTP Server (WebSocket hoạt động trên một HTTP server, do đó cần truyền server vào WebSocket.)
const wss = new WebSocket.Server({ server }); // Khởi tạo WebSocket Server
app.use(express.static("public")); // phục vụ file HTML client
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index_01.html");
});
// Sự kiện khi có client kết nối
wss.on("connection", (ws) => {
  console.log("Một client đã kết nối");

  // Nhận tin nhắn từ client
  ws.on("message", (message) => {
    console.log(`Tin nhắn nhận được: ${message}`);
    // Chuyển message thành chuỗi JSON trước khi gửi
    const data = JSON.stringify({ text: message.toString() });

    // Gửi tin nhắn đến tất cả client (trừ client gửi tin nhắn)
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });

  // Sự kiện khi client ngắt kết nối
  ws.on("close", () => {
    console.log("Một client đã ngắt kết nối");
  });
});

server.listen(3000, () => {
  console.log("WebSocket server đang chạy tại ws://localhost:3000");
});

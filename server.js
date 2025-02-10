const express = require("express");
const http = require("http");

const app = express();
const server = http.createServer(app);

server.listen(3000, () => {
  console.log("WebSocket server đang chạy tại ws://localhost:3000");
});

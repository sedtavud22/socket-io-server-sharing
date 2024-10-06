import type { Socket } from "socket.io";
import express from "express";
import type { User } from "./models/user.model";
import type { Message } from "./models/message.model";

const app = express();
const http = require("http").createServer(app);

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

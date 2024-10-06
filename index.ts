import type { Socket } from "socket.io";
import express from "express";
import type { User } from "./models/user.model";
import type { Message } from "./models/message.model";

const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});

let users = new Map<string, User>();

io.on("connection", (socket: Socket) => {
  console.log("A user connected");

  socket.on("join", ({ room, user }: { room: string; user: User }) => {
    socket.join(room);
    users.set(socket.id, user);
    console.log(`${user.username} joined ${room}`);
    io.to(room).emit("join", { user, room });
  });

  socket.on("leave", ({ room, user }: { room: string; user: User }) => {
    socket.leave(room);
    users.delete(socket.id);
    console.log(`${user.username} left ${room}`);
    io.to(room).emit("leave", { user, rooms: [room] });
  });

  socket.on("message", ({ message }: { message: Message }) => {
    io.to(message.room).emit("message", message);
  });

  socket.on("typing", ({ room, user }: { room: string; user: User }) => {
    if (user && room) {
      io.to(room).emit("typing", { user, room });
    }
  });

  socket.on("stop-typing", ({ room, user }: { room: string; user: User }) => {
    console.log(room, user);
    if (user && room) {
      io.to(room).emit("stop-typing", { user, room });
    }
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    const user = users.get(socket.id);

    if (user && rooms?.length > 0) {
      io.to(rooms).emit("leave", { user, rooms });
      users.delete(socket.id);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

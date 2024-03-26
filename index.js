const express = require("express");
const ws = require("ws");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const MessageModel = require("./models/messages.js");
const DBConnect = require("./DBConnect.js");
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log("Server is running on port 5000");
});

const wss = new ws.WebSocketServer({ server });
wss.on("connection", (connection, req) => {
  console.log("Connected");
  const cookies = req.headers.cookie;
  let myToken = "";
  if (cookies) {
    const token = cookies
      .split(";")
      .find((str) => str.trim().startsWith("myToken="));
    if (token) {
      myToken = token.split("=")[1].trim();
      if (myToken) {
        jwt.verify(myToken, process.env.JWT_SECRET, (err, userData) => {
          if (err) throw err;
          const { id, email } = userData;
          connection.userId = id;
          connection.username = email;
        });
      }
    }
  }

  connection.on("message", async (message) => {
    const messageData = JSON.parse(message.toString());
    console.log(messageData);
    const { recipient, text } = messageData?.message;
    console.log(recipient, text);
    if (recipient && text) {
      await DBConnect();
      const messageDoc = await MessageModel.create({
        sender: connection.userId,
        recipient,
        text,
      });
      console.log(messageDoc);
      [...wss.clients]
        .filter((c) => c.userId === recipient)
        .forEach((c) =>
          c.send(
            JSON.stringify({
              _id: messageDoc._id,
              text,
              sender: connection.userId,
              recipient,
            })
          )
        );
    }
  });

  [...wss.clients].forEach((client) => {
    client.send(
      JSON.stringify({
        online: [...wss.clients].map((c) => ({
          userId: c.userId,
          username: c.username,
        })),
      })
    );
  });
});

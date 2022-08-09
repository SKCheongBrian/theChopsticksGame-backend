const express = require("express");
const bodyParser = require("body-parser");

const { v4: uuid } = require("uuid");

const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();
const server = require("http").createServer(app);
const WebSocket = require("ws");

const webSocketServer = new WebSocket.Server({ server: server });

// clients that are connected
const clients = {};

app.use(bodyParser.json());

app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Route does not exist.", 404);
  return next(error);
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error has occurred!" });
});

webSocketServer.on("request", function (request) {
  var userId = uuid();
  console.log(
    new Date() +
      " Received a new connection from origin " +
      request.origin +
      "."
  );

  const connection = request.accept(null, request.origin);

  clients[userId] = {
    connection: connection,
  };
  console.log(
    "connected " + userId + " in " + Object.getOwnPropertyNames(clients)
  );

  connection.on("message", (message) => {
    const result = JSON.parse(message.utf8Data);
    console.log(result);
  });

  const payLoad = {
    method: "connect",
    clientId: userId,
  };

  connection.send(JSON.stringify(payLoad));
});

server.listen(4000, () => console.log("Listening on port: 4000"));

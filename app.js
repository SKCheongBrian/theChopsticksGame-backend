const express = require("express");
const bodyParser = require("body-parser");

const { v4: uuid } = require("uuid");

const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();
const server = require("http").createServer(app);
const WebSocket = require("ws");

const wss = new WebSocket.Server({ server: server });

function censor(censor) {
  var i = 0;

  return function (key, value) {
    if (
      i !== 0 &&
      typeof censor === "object" &&
      typeof value == "object" &&
      censor == value
    )
      return "[Circular]";

    if (i >= 29)
      // seems to be a harded maximum of 30 serialized objects?
      return "[Unknown]";

    ++i; // so we know we aren't using the original object anymore

    return value;
  };
}

// users that are connected
const users = {};
// dictionary of games being playes
const games = {};

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

server.listen(4000, () => console.log("Listening on port: 4000"));

wss.on("connection", function (ws, req) {
  var connection = req.headers["sec-websocket-key"];
  var userId = uuid();
  console.log(
    new Date() +
      " Received a new connection from origin " +
      req.socket.remoteAddress +
      "."
  );

  users[userId] = {
    connection: ws,
  };

  ws.on("message", (message) => {
    const result = JSON.parse(message);
    console.log(result);

    if (result.method === "create") {
      const userId = result.userId;
      const gameId = uuid();
      games[gameId] = {
        id: gameId,
        gameUsers: [],
      };

      const payLoad = {
        method: "create",
        state: "success",
        game: games[gameId],
      };
      ws.send(JSON.stringify(payLoad));
    }

    if (result.method === "join") {
      const userId = result.userId;
      const gameId = result.gameId;

      const game = games[gameId];
      console.log("game is: " + JSON.stringify(game));
      const payLoad = {
        method: "join",
      };
      if (game === undefined) {
        payLoad.state = "undefined";
        ws.send(JSON.stringify(payLoad));
      } else if (game.gameUsers.length >= 2) {
        payLoad.state = "over";
        ws.send(JSON.stringify(payLoad));
      } else {
        const user = {
          userId: userId,
          hand: "1-1",
        };
        game.gameUsers.push({
          user,
        });
        console.log("game: " + JSON.stringify(game));
        payLoad.state = "success";
        payLoad.game = game;
        game.gameUsers.forEach((each) => {
          users[each.user.userId].connection.send(JSON.stringify(payLoad));
        });
      }
    }
  });

  console.log(connection);
  ws.send(
    JSON.stringify({
      method: "connect",
      state: "success",
      userId: userId,
    }),
    users[userId].connection
  );
});

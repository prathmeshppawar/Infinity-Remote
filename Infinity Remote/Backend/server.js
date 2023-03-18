const compression = require("compression");
const express = require("express");
const { SocketAddress } = require("net");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server, {
  cors: {
    origin: [
      "https://infinity-remote.herokuapp.com/*",
      "http://infinity-remote.herokuapp.com/*",
    ],
  },
});

const path = __dirname;
app.set("views", "./views");
app.set("view engine", "ejs");
app.use(compression());
app.use(express.static(path));
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  if (req.header("x-forwarded-proto") !== "https")
    res.redirect(`https://${req.header("host")}${req.url}`);
  else next();
});

app.get("/", (req, res) => {
  res.render("welcome");
});

app.get("/QR-Scanner", (req, res) => {
  res.render("qrScanner");
});

app.get("/Remote-Already-Connected", (req, res) => {
  res.render("secondConnection");
});
app.get("/Invalid-QR", (req, res) => {
  res.render("invalidQr");
});
app.get("/Loading", (req, res) => {
  res.render("getError");
});
app.get("/Remote", (req, res) => {
  res.render("getError");
});

app.post("/Loading", (req, res) => {
  res.render("loading", { roomId: req.body.room });
});

app.post("/Remote", (req, res) => {
  res.render("remote", { roomId: req.body.room });
});
app.get("/sitemap.xml", (req, res) => {
  res.contentType("application/xml");
  res.sendFile("/sitemap.xml");
});
app.all("*", function (req, res) {
  res.redirect("https://infinity-remote.herokuapp.com");
});

server.listen(process.env.PORT || 3000);

io.on("connection", (socket) => {
  socket.on("newUser", (room) => {
    let roomId = io.sockets.adapter.rooms.get(room);
    if (roomId) {
      if (roomId.size < 2) {
        socket.join(room);
        io.in(socket.id).emit("connectionEstablished");
      } else {
        io.in(socket.id).emit("remoteAlreadyConnected");
      }
    } else {
      io.in(socket.id).emit("invalidQR");
    }
  });

  socket.on("messageFromRemote", (message, room) => {
    let roomId = io.sockets.adapter.rooms.get(room);
    if (roomId && roomId.has(socket.id)) {
      io.in(room).emit("messageFromRemote", message);
    }
  });

  socket.on("messageFromExtension", (message) => {
    io.in(socket.id).emit("messageFromExtension", message);
  });

  socket.on("disconnect", () => {
    console.log(socket.id, "left");
  });
});

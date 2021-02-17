const express = require("express");
const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const path = require("path");
const Cryptr = require("cryptr");
const cryptr = new Cryptr("jfzdavzdauzdsazcauzdat242UF1U4141UF");

global.username = [];

app.use(express.urlencoded({
    extended: true
}));

//Engine view
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);

// Static files
app.use("/public", express.static(path.join(__dirname, "./public")));

// Default route
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/pages/index.html");
});

// Joinning room
app.post("/join_room", (req, res) => {
    const username = req.body.username;
    res.redirect(`/room/${username}`);
    res.end();
});

// Room Route
app.get("/room/:tagId", function (req, res) {
    var id = req.params.tagId;

    // Room id invalid 
    if (id.length > 6 || id.length < 4) {
        return res.redirect("/");
    }

    //User connecting to room 
    io.on("connection", function (socket) {
        socket.join(`room#${id}`);
        console.log(`User joined room#${id}`);
    });

    // else render file passing id room & usersCount
    res.render(__dirname + "/pages/room.html", { id: id });

});

// Messages
io.on("connection", function (socket) {

    // Message receive
    socket.on("chat message", function (msg) {
        var room_name = socket.request.headers.referer;
        idRoom = room_name.split("/")[4];
        io.to(`room#${idRoom}`).emit("chat message", msg);

        // Refresh room box info
        function refresh() {
            allUsers = io.engine.clientsCount; // All connected users
            socket.emit("update_box_info", (allUsers)); // Emit on the opened socket.
        }
        refresh();
        setTimeout(function () {
            refresh();
        }, 10000)
        //
    });

});

// launch server
server.listen(3000);

const express = require('express');
const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('jfzdavzdauzdsazcauzdat242UF1U4141UF');

app.use(express.urlencoded({
    extended: true
}))

//Engine view
app.set('view engine', 'ejs')
app.engine('html', require('ejs').renderFile)

// Static files
app.use('/public', express.static(path.join(__dirname, "./public")));

// Default route
app.get("/", function (req, res) {
    res.sendFile(__dirname + '/pages/index.html');
})

// Joinning room
app.post('/join_room', (req, res) => {
    const username = req.body.username
    res.redirect(`/room/${username}`)
    res.end()
})

// Room Route
app.get('/room/:tagId', function (req, res) {
    id = req.params.tagId;

    // Room id invalid 
    if (id.length > 6 || id.length < 4)
    {
        return res.redirect('/')
    }

    res.render(__dirname + '/pages/room.html', { id });

    //User connecting to room 
    io.on('connection', function (socket) {
        socket.join(`room#${id}`);
        console.log(`User joined room#${id}`);

        console.log(io.in(`room#${id}`).allSockets())
    });

});

// Messages
io.on('connection', function (socket) {

    socket.on('chat message', function (msg) {
        var room_name = socket.request.headers.referer;
        idRoom = room_name.split('/')[4]
        io.to(`room#${idRoom}`).emit('chat message', msg);
    })

})

// launch server
server.listen(3000, function () {
    console.log("Server running on 3000")
})
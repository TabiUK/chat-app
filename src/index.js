"use strict";

const http = require('http')
const express = require('express');
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMesage, generateLocationMesage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const port = process.env.PORT || 3000
const LOG = process.env.OUTPUT_EXPRESS_HTTP_LOG || "YES"
const PublicFolderLocation = path.join(__dirname, '../public')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

if (LOG === 'YES') {
    // logger middleware
    app.use((req, res, next) => {
        var now = new Date().toString();
        var log = `${now}: ${req.method} ${req.url}`;
        console.log(log);
        next();
    });
}

// tells express to parse json
app.use(express.json())

app.use(express.static(PublicFolderLocation));

io.on('connection', (socket) =>
{
    console.log('new websoket connection')

    socket.on('join', ({ username, room }, callback) =>
    {

        const { error, user } = addUser({ id: socket.id, username, room })

        if (error) return callback(error)

        console.log(`user ${user.username} is joining ${user.room}`)
        socket.join(user.room)

        socket.emit('message',  generateMesage('Admin', "Welcome!"))
        // emits to all sockets except current socket
        socket.broadcast.to(user.room).emit('message', generateMesage('Admin', `${user.username} has joined!`))
        
        // emits to all sockets in the room
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage', (ImcomingMessage, callback) =>
    {
        const user = getUser(socket.id)

        if (!user) return callback('no such user')

        if (callback) {
            const filter = new Filter()
            if (filter.isProfane(ImcomingMessage)) return callback('profanity is not allowed!')
        }

        // emits to all sockets in the room
        io.to(user.room).emit('message', generateMesage(user.username, ImcomingMessage))
        if (callback) callback()
    })

    socket.on('sendLocation', ({ latitude, longitude }, callback) =>
    {
        const user = getUser(socket.id)

        if (!user) return callback('no such user')

        io.to(user.room).emit('locationMessage', generateLocationMesage(user.username, `https://google.com/maps?q=${latitude},${longitude}`))
        if (callback) callback()

    })

    socket.on('disconnect', () =>
    {
        const user = removeUser(socket.id)

        if (!user) return
        console.log(`user ${user.username} is leaving ${user.room}`)

        // inform everyone in that room that someone has left
        io.to(user.room).emit('message', generateMesage('Admin', `${user.username} has left`))

        // inform everyone in that room of the users that are in it
        io.to(user.room).emit('roomData', 
        {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
    })
})


app.get('*', (request, response) => 
{
    response.redirect('/')
})

console.log("start up server")
const resserver = server.listen(port, () =>
{
    console.log('server is up on port ' + port)
})
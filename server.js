const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);


//Setting static folder
app.use(express.static(path.join(__dirname, 'public')))

const botName = 'ChatBot'

//Run when client connects
io.on('connection', socket => {
    console.log("New WS connection");

    socket.on('joinRoom', ({ username, room }) => {

        const user = userJoin(socket.id, username, room); //creating a user in userlist

        socket.join(user.room); //joining the room

        socket.emit('message', formatMessage(botName, 'Welcome to Speak Up')); //emits to only that user

        //Broadcast when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`)); //to all users except that user

        //Send users and room info to update the frontend list
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })

    })

    //to broadcast to every user, use io.emit(...);

    //Listen for chatMessage
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username, msg));
    })


    //Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`));

            //Send users and room info to update the frontend list
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })

        }
    });


})


const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
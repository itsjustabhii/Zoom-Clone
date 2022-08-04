const express = require('express')
const app = express()
const server = require('http').Server(app)  //creates a server to user it with Socket.io
const io = require('socket.io')(server) // pass server to io
const { v4: uuidV4 } = require('uuid')  //allows to create unique ids

app.set('view engine', 'ejs') //render our views through ejs view engine
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)  //gives a dynamic URL for each new room
})

//route for room
app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

//runs everytime a user connects to a room
io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {  //passing roomid and userid
    socket.join(roomId) 
    socket.to(roomId).broadcast.emit('user-connected', userId)  //send a message to the room we arae currently in

    //Call disconnect when user exits
    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId) //broadcasts the user left
    })
  })
})

server.listen(3000)
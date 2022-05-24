const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const path = require('path')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const port = process.env.PORT || 3000
const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(path.join(__dirname, '../public')))

io.on('connection', (socket) => {
  console.log('New webSocket connection created.')

  socket.on('join', (info, callback) => {
    const { error, user } = addUser({id: socket.id,...info})

    if (error) {
      return callback(error)
    }

    callback()
    socket.join(user.room)
    socket.emit('message', generateMessage('Admin', 'Welcome!'))
    socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })
  })

  socket.on('sendMessage', (msg, callback) => {
    const user = getUser(socket.id)
    const filter = new Filter()
    if (filter.isProfane(msg)) {
      return callback('Profanity not allowed!!')
    }
    io.to(user.room).emit('message', generateMessage(user.username, msg))
    callback()
  })

  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(socket.id)
    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
    callback()
  })

  socket.on('disconnect', () => {
    const user = removeUser(socket.id)
    if (user) {
      io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))

      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  })
})

server.listen(port, () => {
  console.log(`Server is up on the port ${port}`)
})
const users = []

const addUser = ({ id, username, room }) => {
  if (!username || !room) {
    return {
      error: 'Please provide Username and Room!!'
    }
  }
  
  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()

  const userExists = users.find((user) => user.username === username && room === user.room)
  if (userExists) {
    return {
      error: 'User already in room!!' 
    }
  }

  const user = { id, username, room }
  users.push(user)

  return { user }
}

const removeUser = (id) => {
  const index = users.findIndex( user => user.id === id)

  if (index !== -1) {
    return users.splice(index, 1)[0]
  }
}

const getUser = (id) => {
  return users.find( user => user.id === id)
}

const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase()
  return users.filter( user => user.room === room) 
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
}
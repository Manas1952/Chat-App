const socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormBtn = document.querySelector('button')
const $sendLocation = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar-template')

const autoscroll = () => {
  // new message element
  const $newMessage = $messages.lastElementChild

  // height of new mwssage
  const newMessageStyle = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyle.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  // visible height
  const visibleHeight = $messages.offsetHeight

  // height of messages container
  const conatinerHeight = $messages.scrollHeight

  // how far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight

  if (conatinerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight
  }
}

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const messageTemplate = document.querySelector('#message-template')
socket.on('message', (msg) => {
  console.log(msg)
  const html = Mustache.render(messageTemplate.innerHTML, {
    username: msg.username,
    message: msg.text,
    createdAt: moment(msg.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault()
  $messageFormBtn.setAttribute('disabled', 'disabled')
  const msg = e.target.elements.message.value
  socket.emit('sendMessage', msg, (error) => {
    $messageFormBtn.removeAttribute('disabled')
    $messageFormInput.value = ''
    $messageFormInput.focus()
    if (error) {
      return console.log(error)
    }
    console.log('Message delivered')
  })
})

$sendLocation.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Your browser doesn\'t support Geolocation')
  }
  $sendLocation.setAttribute('disabled', 'disabled')

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit('sendLocation', { latitude: position.coords.latitude, longitude: position.coords.longitude }, () => {
      console.log('Location shared')
      $sendLocation.removeAttribute('disabled')
    })
  })
})

const locationMessage = document.querySelector('#location-template')
socket.on('locationMessage', (location) => {
  console.log(location)
  const html = Mustache.render(locationMessage.innerHTML, {
    username: location.username,
    location: location.url,
    createdAt: moment(location.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render($sidebar.innerHTML, {
    room,
    users
  })
  document.querySelector('#sidebar').innerHTML = html
})

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error)
    location.href = '/'
  }
})
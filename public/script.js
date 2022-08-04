const socket = io('/')
const videoGrid = document.getElementById('video-grid') 
const myPeer = new Peer(undefined, {  //creates connections btw different users
  host: '/',
  port: '3001'
})
const myVideo = document.createElement('video')
myVideo.muted = true  //mutes our audio to us
const peers = {}
navigator.mediaDevices.getUserMedia({ //take object parameter
  video: true,
  audio: true
}).then(stream => { //video and audio stream
  addVideoStream(myVideo, stream)

  myPeer.on('call', call => { //makes two video grid come on one screen
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)  //adding new user on the screen
    })
  })

  //allow other users to connect
  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)  //sends userid and video stream to connect
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

//connect to new user
function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)  //call a user of a certain userid
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {  //listeneing to an event
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {  //when user disconnects, remove their video
    video.remove()
  })

  peers[userId] = call  //every user is linked to the userid
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {  //adding event listener
    video.play()
  })
  videoGrid.append(video)
}
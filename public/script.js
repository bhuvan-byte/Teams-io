// variables const user, ROOM_ID are available globally
const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
const showChat = document.querySelector("#showChat");
const backBtn = document.querySelector(".header__back");
const cutCall = document.querySelector("#cutCall");
let myVideoStream;
myVideo.muted = true;

$(document).ready(function(){
  $("#chat").toast({ autohide: false });
  $("#chat").toast('show');
  // $("#new-user-toast").toast('show');

});

backBtn.addEventListener("click", () => {
  document.querySelector(".main__left").style.display = "flex";
  document.querySelector(".main__left").style.flex = "1";
  document.querySelector(".main__right").style.display = "none";
  document.querySelector(".header__back").style.display = "none";
  document.querySelector(".dashboard__back").style.display = "block";
});

cutCall.addEventListener("mouseup", () => {
  myVideoStream.getTracks().forEach(track => {
    track.stop();
    myVideo.srcObject = null;
  });
  videoGrid.innerHTML = "";
  document.querySelector("#reJoin").style.display = "block";
  document.querySelector("#video-grid").style.display = "none";
  document.querySelector(".options").style.display = "none";
  socket.emit("user-disconnected");
});

showChat.addEventListener("click", () => {
  document.querySelector(".main__right").style.display = "flex";
  document.querySelector(".main__right").style.flex = "1";
  document.querySelector(".main__left").style.display = "none";
  document.querySelector(".header__back").style.display = "block";
  document.querySelector(".dashboard__back").style.display = "none";
});
// var peer = new Peer(undefined, {
//   path: "/peerjs",
//   host: "/",
//   port: "443",
// });
// var peer = new Peer();
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") port =5000;
else port = 443;
let peer = new Peer(undefined,{
  host: '/',
  port: port,
  path: '/peerjs/myapp',
  debug: 2,
  config: {
    'iceServers': [
      { url: 'stun:stun.l.google.com:19302' },
      { url: 'turn:numb.viagenie.ca', credential: 'muazkh', username: 'webrtc@live.com' },
      { url: 'turn:turn.anyfirewall.com:443?transport=tcp', credential: 'webrtc', username: 'webrtc' },
      { url: 'turn:turn.bistri.com:80', credential: 'homeo', username: 'homeo' },
    ],
    'sdpSemantics': 'unified-plan'
  },
});
// var peer = new Peer({
//   config: {
//     'iceServers': [
//       { url: 'stun:stun.l.google.com:19302' },
//       { url: 'turn:numb.viagenie.ca', credential: 'muazkh', username: 'webrtc@live.com' },
//       { url: 'turn:turn.anyfirewall.com:443?transport=tcp', credential: 'webrtc', username: 'webrtc' },
//       { url: 'turn:turn.bistri.com:80', credential: 'homeo', username: 'homeo' },
//     ],
//     'sdpSemantics': 'unified-plan'
//   },
//   debug:2
// });
peer.on("open", (id) => {
  console.log(`My peerId is ${id}`);
  socket.emit("join-room", ROOM_ID, id, user);
  navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: true,
    })
    .then((stream) => {
      // $(".toast").toast('show');
      myVideoStream = stream;
      addVideoStream(myVideo, stream);

      peer.on("call", (call) => {
        console.info(`peerjs: Call Recieved New user peerjs peerid=${call.peer}`);
        call.answer(stream);
        const video = document.createElement("video");
        video.classList.add(`peer${call.peer}`);
        call.on("stream", (userVideoStream) => {
          addVideoStream(video, userVideoStream);
        });
      });
      socket.emit("user-connected");
      socket.on("user-connected", (peerId,username) => {
        console.info(`socketio: Making call to New user - ${username} peerid=${peerId}`);
        $("#new-user-text").text(`Calling ${username}...`);
        $("#new-user-toast").toast('show');
        connectToNewUser(peerId, stream);
      });
    })
    .catch((err)=>{
      console.log(err);
      console.log('Error accessing camera check if other application is already using it.');
    });
});


const connectToNewUser = (peerId, stream) => {
  const call = peer.call(peerId, stream);
  const video = document.createElement("video");
  video.classList.add(`peer${peerId}`);
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};



const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
    videoGrid.append(video);
  });
};

let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");

send.addEventListener("click", (e) => {
  if (text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

text.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

// const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
muteButton.addEventListener("click", () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    html = `<i class="fas fa-microphone-slash"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    html = `<i class="fas fa-microphone"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  }
});

stopVideo.addEventListener("click", () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    html = `<i class="fas fa-video-slash"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    html = `<i class="fas fa-video"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  }
});

// inviteButton.addEventListener("click", (e) => {
//   prompt(
//     "Copy this link and send it to people you want to meet with",
//     window.location.href
//   );
// });

socket.on("createMessage", (message, userName) => {
  messages.innerHTML =
    messages.innerHTML +
    `<div class="message">
        <b><i class="far fa-user-circle"></i> <span> ${
          userName === user ? "me" : userName
        }</span> </b>
        <span>${message}</span>
    </div>`;
});

socket.on("user-disconnected", (peerId)=>{
  try {
    let video = document.querySelector(`.peer${peerId}`);
    video.remove();
  }catch(err) {console.log(`No videoElem=${peerId} to remove.`);}
});
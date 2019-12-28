var socket = io();

var system = new System();

socket.on('pong!', () => {
  console.log('pong!');
})

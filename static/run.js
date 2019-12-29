var socket = io.connect();

var system = new System();

socket.on('pong!', () => {
  console.log('pong!');
})

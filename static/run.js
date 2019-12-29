var socket = io("https://diep-io-copy.herokuapp.com/");

var system = new System();

socket.on('pong!', () => {
  console.log('pong!');
})

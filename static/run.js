var socket = io.connect('https://diep-io-copy.herokuapp.com/%27);

var system = new System();

socket.on('pong!', () => {
  console.log('pong!');
})

var socket = io();

var system = new System();

socket.emit('login', {

});

socket.on('spawn',(data) => {

});

socket.emit('ping');

socket.on('pong', () => {
  console.log('pong!');
})

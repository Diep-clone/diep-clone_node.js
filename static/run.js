var socket = socketIOClient.connect(HEROKU_PATH_HERE, {secure: true});

if(!socket){
  socket = socketIOClient('localhost:5000');
}

var system = new System();

socket.on('pong!', () => {
  console.log('pong!');
})

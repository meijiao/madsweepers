var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Board = require('./board.js');
var Players = require('./players.js');
var GameManager = require('./gameManager.js');

// import helper function
var dropFlagHandler = require('./socket-helpers/dropFlagHandler');
var openSpaceHandler = require('./socket-helpers/openSpaceHandler');
var movePlayerHandler = require('./socket-helpers/movePlayerHandler');
var disconnectHandler = require('./socket-helpers/disconnectHandler');
var createPlayerHandler = require('./socket-helpers/createPlayerHandler');

// define score amounts by each operation
global.scoreRevealMine = -10;
global.scoreRevealspace = 1;
global.scoreRightFlag = 10;
global.scoreWrongFlag = -5;

// Create gameManager when server starts
var gameManager = new GameManager();
var clients = [];

// Now the room name is hard coded
// we need to send the room name along with every communciation
const roomName = 'newRoom';

io.on('connection', function(socket){
  console.log('a user connected');
  // create a new room if the room does not exist.
  if ( !gameManager.rooms[roomName] ) {
    gameManager.createRoom(roomName);
  }

  socket.on('GET-NEW-BOARD', function() {
    io.emit('updateBoard', gameManager.rooms[roomName].board.board);  // to send stuff back to client side
  });

  socket.on('CREATE-PLAYER', function(playerId) {
    createPlayerHandler(io, gameManager.rooms[roomName].players, clients, socket, playerId);
  })

  socket.on('movePlayer', function(data) {
    movePlayerHandler(io, gameManager.rooms[roomName].players, data);
  });

  socket.on('OPEN-SPACE', function(data){
    openSpaceHandler(io, gameManager.rooms[roomName].board, data);
  });

  socket.on('DROP-FLAG', function(data){
    dropFlagHandler(io, gameManager.rooms[roomName].board, data);
  });

  socket.on('disconnect', function(){
    disconnectHandler(gameManager.rooms[roomName].players, clients, socket);
  });
});

http.listen(3000, function(){
  console.log('IAM listening on *:3000, AMA');
});

// module.exports = board;
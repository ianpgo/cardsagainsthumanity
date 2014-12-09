// var Player = require('../models/Player.js');
// var deck = require("../models/mymongo.js");

// var players = []; //array of player objects
// var playerHost = false; //if true player is Host

// exports.init = function(io){
// 	var questionDeck = [];
// 	var answerDeck = []; 
// 	var currentPlayers = 0; 
// 	var round = 0;
// 	var host; //name of current host

// 	io.sockets.on('connection', function (socket) {
// 		currentPlayers++;
// 		socket.emit('players', { number: currentPlayers});
// 		socket.on("newPlayer", function(data){
// 			currentPlayers++;
// 			if(currentPlayers===1){
// 				players.push(new Player(data.name, socket.id, [], true)); 
// 			}else{
// 				players.push(new Player(data.name, socket.id, [], false));
// 			}
// 		});

// 		socket.on("startRound", function(data){

// 		})

// 	});
// }

exports.init = function(io) {
	var currentPlayers = 0; // keep track of the number of players
	var ordinalPlayers = 0; // keep track of total number of players who have joined

  // When a new connection is initiated
	io.sockets.on('connection', function (socket) {
		++currentPlayers;
		++ordinalPlayers; 
		// Send ("emit") a 'players' event back to the socket that just connected.
		socket.emit('players', { number: currentPlayers});
		/*
		 * Emit players events also to all (i.e. broadcast) other connected sockets.
		 * Broadcast is not emitted back to the current (i.e. "this") connection
     */
		socket.broadcast.emit('players', { number: currentPlayers});
		
		socket.emit('welcome',{message: "Welcome Player "+ordinalPlayers});
		//emits welcome message with the order the player joined the server 

		/*
		 * Upon this connection disconnecting (sending a disconnect event)
		 * decrement the number of players and emit an event to all other
		 * sockets.  Notice it would be nonsensical to emit the event back to the
		 * disconnected socket.
		 */
		socket.on('disconnect', function () {
			--currentPlayers;
			socket.broadcast.emit('players', { number: currentPlayers});
		});
	});
}

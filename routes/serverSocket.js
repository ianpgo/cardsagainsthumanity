var Player = require('../models/Player.js');
var deck = require('../models/mymongo.js');

var playerHost = false; //if true player is Host
var questionDeck = [];
var answerDeck = []; 

exports.init = function(io){
	var currentPlayers = 0; 
	var round = 0;
	var host; //name of current host
	var players = []; //array of player objects

	console.log("sockets started");

	//populate questionDeck from mongoDB
	//populate answerDeck from mongoDB

	io.sockets.on('connection', function(socket) {
		
		console.log("a new player on socket "+socket.id+" has joined.");

		socket.on("newPlayer", function(data){
			currentPlayers++;
			console.log("Current players: "+currentPlayers);
			if(currentPlayers===1){
				players.push(new Player(data.name, socket.id, [], true)); 
			}else{
				players.push(new Player(data.name, socket.id, [], false));
			}
			console.log(players);
			if(getPlayer(socket.id).host===true){
				socket.emit('hostWait');
			}else{
				socket.emit('playerWait');
			}
		});

		socket.on("startGame", function(data){
			//Fill each players hand
			players.forEach(function(player){
				player.hand = randomHand(answerDeck);
			});
		});

		socket.on("disconnect",function(){
			if(currentPlayers > 0){
			var disPlayer = getPlayer(socket.id);
			socket.broadcast.emit('dropPlayer',{disconnectName:disPlayer.username});
		}
			currentPlayers = 0;
			players=[];
			//reset question and answer decks
			console.log(players);
		});

		//Gets a player according to socketID
		function getPlayer(checkSocketID){
			for (var i = 0; i < players.length; i++) {
				if(players[i].socketID === checkSocketID){
					return players[i];
				}
			};
		};

		//Finds the current host
		function findHost(){
			for (var i = 0; i < players.length; i++) {
				if(players[i].host === true){
					return players[i];
				}
			};
		};

		//Return array of non-host players
		function listNonHosts(){
			var nonHosts = [];
			for (var i = 0; i < players.length; i++) {
				if(players[i].host === false){
					nonHosts.push(players[i]);
				}
			};
			return nonHosts;
		}

		//Return a random hand from deck
		function randomHand(deck){
			var randomHand = [];
			for(var i=0; i < 6; i++) {
				var index = Math.random()*(deck.length);
				randomHand.push(deck.splice(index, 1)[0]);
			};
			return randomHand;
		};

	});
}



// exports.init = function(io) {
// 	var currentPlayers = 0; // keep track of the number of players
// 	var ordinalPlayers = 0; // keep track of total number of players who have joined

//   // When a new connection is initiated
// 	io.sockets.on('connection', function (socket) {
// 		++currentPlayers;
// 		++ordinalPlayers; 
// 		// Send ("emit") a 'players' event back to the socket that just connected.
// 		socket.emit('players', { number: currentPlayers});
		
// 		 * Emit players events also to all (i.e. broadcast) other connected sockets.
// 		 * Broadcast is not emitted back to the current (i.e. "this") connection
     
// 		socket.broadcast.emit('players', { number: currentPlayers});
		
// 		socket.emit('welcome',{message: "Welcome Player "+ordinalPlayers});
// 		//emits welcome message with the order the player joined the server 

// 		/*
// 		 * Upon this connection disconnecting (sending a disconnect event)
// 		 * decrement the number of players and emit an event to all other
// 		 * sockets.  Notice it would be nonsensical to emit the event back to the
// 		 * disconnected socket.
// 		 */
// 		socket.on('disconnect', function () {
// 			--currentPlayers;
// 			socket.broadcast.emit('players', { number: currentPlayers});
// 		});
// 	});
// }

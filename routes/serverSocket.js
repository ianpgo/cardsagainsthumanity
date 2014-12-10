var Player = require('../models/Player.js');
var deck = require('../models/mymongo.js');
var testDeck = require('../models/Deck.js');

var fakeDeck = new testDeck();

exports.init = function(io){
	var currentPlayers = 0; //number of current players in game
	var round = 0; //number of rounds played in game
	var hostID; //socketID of current host
	var players = []; //array of player objects

	var questionDeck = []; //empty array for deck of question cards
	var answerDeck = []; //empty array for deck of answer cards 

	console.log("sockets started");
	io.sockets.on('connection', function(socket) {
		
		console.log("a new player on socket "+socket.id+" has joined.");

		socket.on("newPlayer", function(data){
			currentPlayers++; 
			console.log("Current players: "+currentPlayers);
			if(currentPlayers===1){
				players.push(new Player(data.name, socket.id, [], true)); //make first player host
			}else{
				players.push(new Player(data.name, socket.id, [], false)); //make subsequent players not hosts
			}
			console.log(players);
			if(getPlayer(socket.id).host===true){
				socket.emit('hostWait'); //send host the hostWait screen
			}else{
				socket.emit('playerWait'); //send players the playerWait screen
			}
		});

		socket.on("startGame", function(data){
			console.log("host started game");

			//populate questionDeck from mongoDB
			questionDeck = fakeDeck.questionDeck;
			//populate answerDeck from mongoDB
			answerDeck = fakeDeck.answerDeck; 
			console.log("question deck cards: "+questionDeck.length);
			console.log("answer deck cards: "+answerDeck.length);

			//broadcast the question
			var questionCard = randomCard(questionDeck);
			console.log(questionCard);
			io.sockets.emit('drawQuestion',{question:questionCard});

			players.forEach(function(player){
				player.hand = randomHand(answerDeck); //draw random hand for player
				io.sockets.connected[player.socketID].emit('drawHand',{hand:player.hand}); //send array of hand to players
				console.log("answer deck cards: "+answerDeck.length);
			});

			printPlayers();
		});

		socket.on("disconnect",function(){
			if(currentPlayers > 0){ß
			var disPlayer = getPlayer(socket.id);
			io.sockets.emit('dropPlayer',{disconnectName:disPlayer.username});
			console.log(disPlayer.username+" has dropped, game ended");
		}
			currentPlayers = 0;
			players=[];
			questionDeck =[];
			answerDeck =[];
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

		//Return a random card from deck, and remove from deck
		function randomCard(deck){
			var index = Math.random()*(deck.length);
			var card = deck.splice(index, 1)[0];
			return card;
		};

		//Test function printing all players
		function printPlayers(){
			console.log(players);
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

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
	var selectionDeck=[]; //deck of player selected cards with players mapped

	console.log("sockets started");
	io.sockets.on('connection', function(socket) {

	var favorites = [];

	deck.findAll("favorites", function(favoritePhrases){
		var index = Math.random()*(favoritePhrases.length);
		var randomPhrase = favoritePhrases.splice(index, 1)[0];
		var sendPhrase = randomPhrase.phrase;
		console.log(randomPhrase.phrase);
		socket.emit('displayFavorite',{favePhrase:sendPhrase});
	});
		
		console.log("a new player on socket "+socket.id+" has joined.");

		//When a new player is added to the game
		socket.on("newPlayer", function(data){
			currentPlayers++; 
			console.log("Current players: "+currentPlayers);
			if(currentPlayers===1){
				players.push(new Player(data.name, socket.id, [], true)); //make first player host

			//Populate questionDeck
			deck.findAll("blackcards", function(blackcards){
				console.log(blackcards);
				blackcards.forEach(function(card){
					questionDeck.push(card.question);
				});
			});

			//Populate answerDeck
			deck.findAll("whitecards", function(whitecards){
				console.log(whitecards);
				whitecards.forEach(function(card){
					answerDeck.push(card.answer);
				});
			});

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

		//When host starts a new game
		socket.on("startGame", function(data){
			console.log("host started game");

			// //populate questionDeck from mongoDB
			// questionDeck = fakeDeck.questionDeck;
			// //populate answerDeck from mongoDB
			// answerDeck = fakeDeck.answerDeck; 

			console.log("question deck cards: "+questionDeck.length);
			console.log("answer deck cards: "+answerDeck.length);

			//broadcast the question
			var questionCard = randomCard(questionDeck);
			console.log(questionCard);
			io.sockets.emit('drawQuestion',{question:questionCard});

			//send hands to each player
			players.forEach(function(player){
				player.hand = randomHand(answerDeck); //draw random hand for player
				io.sockets.connected[player.socketID].emit('drawHand',{hand:player.hand}); //send array of hand to players
				console.log("answer deck cards: "+answerDeck.length);
			});

			printPlayers();
		});

		//When a player submits a card
		socket.on("submitCard",function(data){
			var submitPlayer = getPlayer(socket.id);
			console.log(getPlayer(socket.id).hand);
			removeCardfromPlayer(data.answer);
			console.log(getPlayer(socket.id).hand);

			selectionDeck.push({answer:data.answer,player:submitPlayer});
			console.log(selectionDeck);
			console.log(submitPlayer.username);
			io.sockets.emit('submitPlayer',{playerName:submitPlayer.username});

			if(selectionDeck.length === currentPlayers-1){
				io.sockets.emit('hostChoose',{chooseDeck:selectionDeck});
			}
		});

		//When the host chooses a card
		socket.on("choseCard",function(data){
			console.log(data.phrase);
			console.log(data.player);
			io.sockets.emit('winningCard',{phrase:data.phrase,player:data.player});
		});

		//When the host starts a new round
		socket.on("newRound",function(data){
			selectionDeck = []; //reset selection deck
			redrawHands(players); //Add one card to each nonhost player
			setNewHost(players); //set a new host

			//tell clients new Host
			io.sockets.emit('setNewHost',{host:findHost()})

			//send out new question
			var questionCard = randomCard(questionDeck);
			console.log(questionCard);
			io.sockets.emit('drawQuestion',{question:questionCard});

			//send hand to each player
			players.forEach(function(player){
				io.sockets.connected[player.socketID].emit('drawHand',{hand:player.hand}); //send array of hand to players
				console.log("answer deck cards: "+answerDeck.length);
			});

		});

		//When a client favorites a phrase
		socket.on("addFavorite",function(data){
			console.log(data.favoritePhrase);
			var favorite = data.favoritePhrase;
			if( favorite.indexOf("?")>-1 && favorite.indexOf("?")!== favorite.charAt(favorite.length-1)){
				var qIndex = favorite.indexOf("?");
				qIndex++;
				favorite = favorite.slice(0,qIndex)+" "+favorite.slice(qIndex,favorite.length);
			}

			deck.insert("favorites", {'phrase':favorite}, function (data){
				console.log("added new phrase");
			});
		});

		socket.on("disconnect",function(){
		// 	if(currentPlayers > 0){
		// 	var disPlayer = getPlayer(socket.id);
		// 	io.sockets.emit('dropPlayer',{disconnectName:disPlayer.username});
		// 	console.log(disPlayer.username+" has dropped, game ended");
		// }
			currentPlayers = 0;
			players=[];
			questionDeck =[];
			answerDeck =[];
			selectionDeck =[];
			//reset question and answer decks
			console.log(players);
			io.sockets.emit('dropPlayer');
		});

		/*****************HELPER FUNCTIONS******************/

		//Gets a player according to socketID
		function getPlayer(checkSocketID){
			for (var i = 0; i < players.length; i++) {
				if(players[i].socketID === checkSocketID){
					return players[i];
				}
			};
		};

		//Remove card from players hand
		function removeCardfromPlayer(card){
			for (var i = 0; i < players.length; i++) {
				if(players[i].hand.indexOf(card)> -1){
					players[i].removeCard(card);
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

		//sets new host in order of player array 
		function setNewHost(){
			var hostIndex = findHostIndex(players);
			console.log(hostIndex);
			players[hostIndex].host=false;
			console.log(players);
			if(hostIndex===(players.length-1)){
				players[0].host=true;
				console.log(players);
				console.log("ONEONEONE");
			}else{
				players[hostIndex+1].host=true;
				console.log(players);
				console.log("TWOTWOTWO");
			}
		};

		//Find the index of the first host in array
		function findHostIndex(playerArray){
			for(var i = 0; i<playerArray.length; i++){
				if(playerArray[i].host==true){
					return i;
				}
			}
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

		//Return a random hand of 5 cards from deck
		function randomHand(deck){
			var randomHand = [];
			for(var i=0; i < 5; i++) {
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

		//refill players hands
		function redrawHands(playerArray){
			playerArray.forEach(function(player){
				if(player.host===false){
					player.addCard(randomCard(answerDeck));
				}
			});	
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

var Player = require('../models/Player.js');
var deck = require('../models/mymongo.js');

exports.init = function(io){
	var currentPlayers = 0; //number of current players in game
	var round = 0; //number of rounds played in game
	var hostID; //socketID of current host
	var players = []; //array of player objects

	var questionDeck = []; //empty array for deck of question cards
	var answerDeck = []; //empty array for deck of answer cards 
	var selectionDeck=[]; //deck of player selected cards with players mapped

	var backupQuestions = []; //backup deck for reshuffling
	var backupAnswers = []; //back up deck for reshuffling

	console.log("sockets started");
	io.sockets.on('connection', function(socket) {

	var favorites = [];

	//Pull from mongoDB a random favorite phrase
	deck.findAll("favorites", function(favoritePhrases){
		var index = Math.random()*(favoritePhrases.length);
		var randomPhrase = favoritePhrases.splice(index, 1)[0]; //get a random phrase from mongo favorite collection
		var sendPhrase = randomPhrase.phrase;
		socket.emit('displayFavorite',{favePhrase:sendPhrase}); //send random phrase to connected socket
	});
		
		console.log("a new player on socket "+socket.id+" has joined.");

		//When a new player is added to the game
		socket.on("newPlayer", function(data){
			currentPlayers++; 
			io.sockets.emit('numPlayers',{numberPlayers:currentPlayers});
			console.log("Current players: "+ currentPlayers);
			console.log("Player name: "+ data.name);
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

			if(getPlayer(socket.id).host===true){
				socket.emit('hostWait'); //send host the hostWait screen
			}else{
				socket.emit('playerWait'); //send players the playerWait screen
			}
		});

		//When host starts a new game
		socket.on("startGame", function(data){
			console.log("host started game");

			//populate the backup question deck
			backupQuestions= questionDeck;
			//populate the backup answer deck
			backupAnswers = answerDeck; 

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
		});

		//When a player submits a card
		socket.on("submitCard",function(data){
			var submitPlayer = getPlayer(socket.id); //get the player who submitted the card
			removeCardfromPlayer(data.answer); //remove the submitted card from players hand

			selectionDeck.push({answer:data.answer,player:submitPlayer}); //put submitted card is selection deck

			io.sockets.emit('submitPlayer',{playerName:submitPlayer.username}); //emit submit player name to all

			if(selectionDeck.length === currentPlayers-1){
				io.sockets.emit('hostChoose',{chooseDeck:selectionDeck});
			}//if all players have submitted, let host choose
		});

		//When the host chooses a card
		socket.on("choseCard",function(data){
			console.log(data.phrase);
			console.log(data.player);
			io.sockets.emit('winningCard',{phrase:data.phrase,player:data.player}); //emit the winning phrase to all players
		});

		//When the host starts a new round
		socket.on("newRound",function(data){

			//If playing decks are running low, reset them
			if(questionDeck.length < 2){
				reshuffleQuestions();
			};
			if(answerDeck.length<10){
				reshuffleAnswers();
			};

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

		//When a client decides to favor a phrase
		socket.on("addFavorite",function(data){
			console.log(data.favoritePhrase);
			var favorite = data.favoritePhrase;
			if( favorite.indexOf("?")>-1 && favorite.indexOf("?")!== favorite.charAt(favorite.length-1)){
				var qIndex = favorite.indexOf("?");
				qIndex++;
				favorite = favorite.slice(0,qIndex)+" "+favorite.slice(qIndex,favorite.length);
			} //add space after ? in phrase to make pretty

			//insert the favorite phrase into mongo
			deck.insert("favorites", {'phrase':favorite}, function (data){
				console.log("added new phrase");
			});
		});

		//On disconnent end game
		socket.on("disconnect",function(){
			if(currentPlayers > 0){
			io.sockets.emit('dropPlayer');
		}
			currentPlayers = 0;
			players=[];
			questionDeck =[];
			answerDeck =[];
			selectionDeck =[];
			//reset question and answer decks
			console.log(players);
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
			}else{
				players[hostIndex+1].host=true;
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

		//Reshuffles questions by repopulating with backup
		function reshuffleQuestions(){
			questionDeck = backupQuestions;
		};

		//Reshuffles answers by repopulating with backup
		function reshuffleAnswers(){
			answerDeck = backupAnswers;
		};

	});
}

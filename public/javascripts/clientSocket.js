// $(document.ready(function(){

// 	var socket = io.connect(':8000/');

// 	//ON SUBMITTING A USER NAME
// 	socket.emit('newPlayer',{name:playerName});

// 	//ON PRESSING STARTGAME (FROM HOST)
// 	socket.emit('startGame');

// 	//ON SUBMITTING YOUR CARD
// 	socket.emit('submitCard',{card:cardString});

// 	//START A NEW ROUND SENT AFTER WINNING CARD IS CHOSEN 

// 	//ON CHOOSING A WINNING CARD (FROM HOST)
// 	socket.emit('chooseCard',{card:winningCard});

// socket.on('players', function (data) {
//   console.log(data);
//   $("#numPlayers").text(data.number);
// 	});

// });

var socket = io.connect('/');
socket.on('players', function (data) {
  console.log(data);
  $("#numPlayers").text(data.number);
	});

socket.on('welcome', function (data) {
	$("#welcome").text(data.message);
});
//Welcome message saying what order the player joined

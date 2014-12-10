$(document).ready(function(){

	var socket = io.connect(':8000/');

	//ON SUBMITTING A USER NAME
	$('#joinGame').click(function(){
		var playerName = $('#username').val();
		socket.emit('newPlayer',{name:playerName});
	});

	//ON Player waiting for host to start game
	socket.on("playerWait", function(data){
		$('.joinView').fadeOut();
		$('.playerWait').fadeIn();
	});

	//ON Host View waiting to start game
	socket.on("hostWait", function(data){
		$('.joinView').fadeOut();
		$('.hostWait').fadeIn();
	});

	//Host presses start game 
	socket.emit('startGame');

	// //ON SUBMITTING YOUR CARD
	// socket.emit('submitCard',{card:cardString});

	// //START A NEW ROUND SENT AFTER WINNING CARD IS CHOSEN 

	// //ON CHOOSING A WINNING CARD (FROM HOST)
	// socket.emit('chooseCard',{card:winningCard});

});
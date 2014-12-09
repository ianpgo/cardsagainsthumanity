$(document).ready(function(){

	var socket = io.connect(':8000/');

	//ON SUBMITTING A USER NAME
	$('#joinGame').click(function(){
		var playerName = $('#username').val();
		socket.emit('newPlayer',{name:playerName});
	});

	// //ON PRESSING STARTGAME (FROM HOST)
	// socket.emit('startGame');

	// //ON SUBMITTING YOUR CARD
	// socket.emit('submitCard',{card:cardString});

	// //START A NEW ROUND SENT AFTER WINNING CARD IS CHOSEN 

	// //ON CHOOSING A WINNING CARD (FROM HOST)
	// socket.emit('chooseCard',{card:winningCard});

});
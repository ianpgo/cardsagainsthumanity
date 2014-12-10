$(document).ready(function(){

	var socket = io.connect(':8000/');

	var playerName;
	var hand=[];
	var host=false; 
	var question="";

	//ON SUBMITTING A USER NAME
	$('#joinGame').click(function(){
		playerName = $('#username').val();
		socket.emit('newPlayer',{name:playerName});
	});

	//ON Player waiting for host to start game
	socket.on("playerWait", function(data){
		$('.joinView').fadeOut();
		$('.playerWait').fadeIn();
	});

	//ON Host View waiting to start game
	socket.on("hostWait", function(data){
		host = true; 
		$('.joinView').fadeOut();
		$('.hostWait').fadeIn();
	});

	//Host presses start game 
	$('#startGame').click(function(){
		socket.emit('startGame');
	});

	//Recieve the question
	socket.on('drawQuestion',function(data){
		var question = data.question;
		var editQuestion = question;

		//Format question to include answerfield
		if(question.indexOf("888")>-1){
			editQuestion=editQuestion.replace("888","<span class='answer-field'>___________________</span>");
		}else{
			editQuestion=editQuestion+"<br><span class='answer-field'>___________________</span>";
		}

		$('.questionDiv').html("<h1 class='question'>"+editQuestion+"</h1>");

		if (host === true){
			$('.hostWait').fadeOut();
			$('.hostView').fadeIn();
		}else{
			$('.playerWait').fadeOut();
			$('.playerView').fadeIn();
		};
	});

	//Recieve Hand
	socket.on("drawHand",function(data){
		var hand = data.hand;

		hand.forEach(function(card){
			$("#playerAnswerRow").append("<div class='small-6 medium-2 columns'><div class='cards'>"+card+"</div></div>").fadeIn();
		});
		$("#playerAnswerRow").append("<div class='small-6 medium-2 columns'><div class='cards-submit'>Submit</div></div>").fadeIn();
	});

	// //ON SUBMITTING YOUR CARD
	// socket.emit('submitCard',{card:cardString});

	// //START A NEW ROUND SENT AFTER WINNING CARD IS CHOSEN 

	// //ON CHOOSING A WINNING CARD (FROM HOST)
	// socket.emit('chooseCard',{card:winningCard});

});
$(document).ready(function(){

	var socket = io.connect(':8000/');

	var playerName;
	var hand=[];
	var host=false; 
	var question="";
	var editQuestion="";
	var selectedcards;

	//ON SUBMITTING A USER NAME
	$('#joinGame').click(function(){
		playerName = $('#username').val();
		socket.emit('newPlayer',{name:playerName});
		$("#playerName").text(playerName);
		$(".gameHeader").fadeIn();
	});

	//Get a favorite phrase to display
	socket.on('displayFavorite', function(data){
		$("#favoritePhrase").text(data.favePhrase);
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
		if(host===true){

			if(question.indexOf("888")>-1){
				editQuestion=editQuestion.replace("888","<span class='answer-field' id='hostAnswer'>___________________</span>");
			}else{
				editQuestion=editQuestion+"<br><span class='answer-field' id='hostAnswer'>___________________</span>";
			};

		}else{

			if(question.indexOf("888")>-1){
				editQuestion=editQuestion.replace("888","<span class='answer-field' id='playerAnswer'>___________________</span>");
			}else{
				editQuestion=editQuestion+"<br><span class='answer-field' id='playerAnswer'>___________________</span>";
			};

		};

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
		$("#playerInfo").fadeIn();

		hand.forEach(function(card){
			$("#playerAnswerRow").append("<div class='small-6 medium-2 columns'><div class='cards'>"+card+"</div></div>").fadeIn();
		});
		$("#playerAnswerRow").append("<div class='small-6 medium-2 columns'><div class='cards-submit'>Submit</div></div>").fadeIn();
	});

	//Player submits a card
	$("#playerAnswerRow").on("click", ".cards-submit", function(){
		var answerCard = $("#playerAnswer").text();
		removeCard(answerCard);
		socket.emit('submitCard',{answer:answerCard});
		$("#playerAnswerRow").empty().fadeOut();
		$("#playerInfo").fadeOut();
		$("#playerWaitingMessage").fadeIn();
	});

	//Get submitted Players
	socket.on("submitPlayer",function(data){
		$(".submittedPlayers").append("<h6 class='title'>"+data.playerName+" submitted a Card</h6>").fadeIn();
	});

	//When all cards are submitted
	socket.on("hostChoose",function(data){
		$(".submittedPlayers").html("<h6 class='title'>All players have submitted cards</h6>").fadeIn();
		if(host === true){
			selectedcards = data.chooseDeck;
			$("#hostInfo").text("Choose the winning card").fadeIn();

			selectedcards.forEach(function(card){
				$("#hostAnswerRow").append("<div class='small-6 medium-2 columns'><div class='cards'>"+card.answer+"</div></div>").fadeIn();
			});
			$("#hostAnswerRow").append("<div class='small-6 medium-2 columns end'><div class='cards-submit'>Submit</div></div>").fadeIn();
		}
	});

	//When host picks cards
	$("#hostAnswerRow").on("click", ".cards-submit", function(){
		var winningPhrase = $("#hostQuestion").html();
		var winningPlayer = playerFromList($("#hostAnswer").text());
		socket.emit('choseCard',{phrase:winningPhrase,player:winningPlayer});
	});

	//When winning phrase is recieved
	socket.on('winningCard',function(data){
		$(".winningPhrase").html(data.phrase);
		$("#winnerInfo").text("Submitted by "+ data.player.username);
		$(".submittedPlayers").empty();

		if(host === true){
			$(".hostView").fadeOut();
			$("#hostAnswerRow").empty();
			$("#hostNext").fadeIn();
			$(".endRoundView").fadeIn();
		}else{
			$(".playerView").fadeOut();
			$("#hostNext").fadeOut();
			$(".endRoundView").fadeIn();
		};
	});

	//when phrase is favored emit to server 
	$(".endRoundView").on("click","#favoriteButton",function(){
		var savePhrase = $("#winnerSave").text();
		socket.emit('addFavorite',{favoritePhrase:savePhrase});
		$(this).text("Phrase has beed saved");
	});

	//start a new round after chosen
	$("#hostNext").on("click","#nextRound",function(){
		$("#playerAnswerRow").empty().fadeOut();
		socket.emit('newRound');
	});

	//update host variable on client side, change view to next round 
	socket.on('setNewHost',function(data){
		if(data.host.username===playerName){
			host = true;
		}else{
			host = false;
		};
		$('.endRoundView').fadeOut();
		$("#favoriteButton").text("Favorite this Phrase");
	});

	//when a player disconnects show error message
	socket.on('dropPlayer',function(){
		$(".container").html("<div class='small-12 medium-10 medium-offset-1 columns'><h2 class='title'>It looks like someone disconnected from the game. Open a new window to start a new one!</h2></div>");
	});
	/*****************HELPER FUNCTIONS******************/

	//removes card from hand
	function removeCard(card){
		var index = hand.indexOf(card);
		hand.splice(index,1);
	};

	//get player mapped to answer
	function playerFromList(answer){
		var thePlayer; 
		selectedcards.forEach(function(element){
			if(element.answer === answer){
				thePlayer = element.player;
			}
		});
		return thePlayer;
	};
});
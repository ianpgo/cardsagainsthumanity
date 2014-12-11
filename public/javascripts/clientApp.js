	$(document).ready(function(){

		$("#username").focus();

		//Make white button black on hover
		$(".whiteButton").on("mouseenter", function(){
			$(this).css("background-color","black").css("color","white").css("border","1px solid white");
		}).on("mouseleave",function(){
			$(this).css("background-color","white").css("color","black").css("border","0px");
		});

		//Put in answer field on click
		$(".answerRow").on("click", ".cards", function(){
			var tempAnswer= $(this).text();
			$(".answer-field").hide().text(tempAnswer).fadeIn();
			$(".answer-field").css("text-decoration","underline");
			clearInterval(blinkerAnswer);
		});

		//submit button turns black on click
		$(".answerRow").on("mouseenter", ".cards-submit", function(){
			$(this).css("background-color","black").css("color","white").css("border","1px solid white");
		}).on("mouseleave", ".cards-submit", function(){
			$(this).css("background-color","white").css("color","black").css("border","0px");
		});

		//card move effect on hover
		$(".answerRow").on("mouseenter", ".cards", function(){
			$(this).css("position","relative").css("bottom","25px");
		}).on("mouseleave", ".cards", function(){
			$(this).css("position","static").css("bottom","0");
		});

		var blinkerAnswer = setInterval(function(){

		//Add blinker for underline
		$('.answer-field').fadeTo("slow",0.00);
		setTimeout(function(){$('.answer-field').fadeTo("slow",1.00)},200);

		},3000);


	});
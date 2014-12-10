	$(document).ready(function(){

		$("#username").focus();

		$(".whiteButton").on("mouseenter", function(){
			$(this).css("background-color","black").css("color","white").css("border","1px solid white");
		}).on("mouseleave",function(){
			$(this).css("background-color","white").css("color","black").css("border","0px");
		});

		$(".cards").on("click", function(){
			var tempAnswer= $(this).text();
			$(".answer-field").hide().text(tempAnswer).fadeIn();
			$(".answer-field").css("text-decoration","underline");
			clearInterval(blinkerAnswer);
		});

		$(".cards-submit").on("mouseenter", function(){
			$(this).css("background-color","black").css("color","white").css("border","1px solid white");
		}).on("mouseleave",function(){
			$(this).css("background-color","white").css("color","black").css("border","0px");
		});

		var blinkerAnswer = setInterval(function(){

		$('.answer-field').fadeTo("slow",0.00);
		setTimeout(function(){$('.answer-field').fadeTo("slow",1.00)},200);

		},3000);


	});
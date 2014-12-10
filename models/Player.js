//Class for one player

function Player(username, socketID, hand, host){
	this.username = username;
	this.socketID = socketID;
	this.hand = hand;
	this.host = host; 
}

//add one card to player's hand (used on redraw)
Player.prototype.addCard = function(card){
	this.hand.push(card);
}

//pull submitted card from players hand
Player.prototype.submitCard = function(card) {
	var index = this.hand.indexOf(card);
	return this.hand.splice(index, 1);
};

//remove card from players hand
Player.prototype.removeCard = function(card){
	var index = this.hand.indexOf(card);
	this.hand.splice(index, 1);
};

//fill player's hand from cards
Player.prototype.fillHand = function(fillerHand){
	fillerHand.forEach(function(card){
		this.hand.push(card);
	});
}

//make the player the current host
Player.prototype.makeHost = function(){
	this.host = true; 
}

//make the player a nonHost player 
Player.prototype.unHost = function(){
	this.host = false;
}

module.exports = Player;
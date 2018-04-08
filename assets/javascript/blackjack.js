
function createDeck() {

  var newDeck = [];

  for (var i = 0; i < suits.length; i++) {
      for (var j = 0; j < cardNames.length; j++) {

        var card = {
            image: "",
            name: "",
            suit: "",
            title: ""
        };

        card.name = cardNames[j];
        card.suit = suits[i];
        card.image = "assets/images/" + suits[i] + "/" + cardNames[j] + ".png";
        card.title = cardNames[j] + " of " + suits[i];

        switch(cardNames[j]) {
            case "ace":
                card.value = [1,11];
                break;
            case "two":
                card.value = 2;
                break;
            case "three":
                card.value = 3;
                break;
            case "four":
                card.value = 4;
                break;""
            case "five":
                card.value = 5;
                break;
            case "six":
                card.value = 6;
                break;
            case "seven":
                card.value = 7;
                break;
            case "eight":
                card.value = 8;
                break;
            case "nine":
                card.value = 9;
                break;
            default:
                card.value = 10;
        }
          newDeck.push(card);
      }
  }
  return(newDeck);
}

function manageGameResults() {
// Trivial end-of-game cases
  if (gameOver) {
    if (player.score === 21 && dealer.score < 21) {
      playerWon = true;
      table.players[0].wins++;
      gameOver = true;
      return;
    }// Player wins

    if (dealer.score === 21 && player.score < 21) {
      playerWon = false;
      table.dealerWins++;
      gameOver = true;
      return;
    }// Dealer wins

    if ((player.score > dealer.score) && player.score < 22) {
      playerWon = true;
      table.players[0].wins++;
      gameOver = true;
      return;
    }// Player wins

    if (player.score === dealer.score) {
      push = true;
      gameOver = true;
      return;
    }// Nobody wins; nobody loses

    if ((player.score < dealer.score) && dealer.score < 22) {
      playerWon = false;
      gameOver = true;
      return;
    }
  }
//Conditions that should end the game before the dealer finishes playing his hand

  if (player.score > 21) {
    playerWon = false;
    gameOver = true;
    return;
  }// Dealer wins

  if (dealer.score > 21) {
    playerWon = true;
    gameOver = true;
    table.players[0].wins++;
    console.log(table.players[0].wins);
    return;
  }// Player wins

// More complex end-of-game cases

  if (player.score === 21 &&
    player.cards.length === 2 &&
    dealer.score === 21 &&
    dealer.cards.length > 2) {
      playerWon = true;
      gameOver = true;
      blackjack = true;
      table.players[0].wins++;
      console.log(table.players[0].wins);
      return;
  }// Player wins

  if (player.score === 21 &&
    player.cards.length === 2 &&
    dealer.score < 21) {
      playerWon = true;
      gameOver = true;
      blackjack = true;
      table.players[0].wins++;
      console.log(table.players[0].wins);
      return;
  }// Player wins

  if (dealer.score === 21 &&
    dealer.cards.length === 2 &&
    player.score === 21 &&
    player.cards.length > 2) {
      playerWon = false;
      gameOver = true;
      blackjack = true;
      return;
  }// Dealer wins
}

function showStatus() {

  // if (!gameStarted) {
  //   textArea.innerText = "Welcome to Blackjack!";
  //   return;
  // }

  var dealerCardString = "";
  console.log('player status then is ', player.status);
  if (player.status === "stay") {
    console.log('player status now is ', player.status);
    for (var i = 0; i < dealer.cards.length; i++) {
      dealerCardString += dealer.cards[i].title + "\n";
    }
  }
  else {
    // If the players haven't all
    dealerCardString += dealer.cards[0].title + "\n";
  }

  // var playerCardString = "";
  // for (var i = 0; i < player.cards.length; i++) {
  //   playerCardString += player.cards[i].title + "\n";
  // }

  textArea.innerText =
  "Dealer has:\n" +
  dealerCardString +
  "(score: " + dealer.score + ")\n\n";

  // "Player has: \n" +
  // playerCardString +
  // "(score: " + player.score + ")\n\n";

  if (gameOver) {
    $("#restart").show();
    if (playerWon) {
      textArea.innerText += "You win!";
    }
    else if (push) {
      textArea.innerText += "Player and Dealer push. No one wins.";
    }
    else {
      textArea.innerText += "You lose. Dealer wins";
    }
    // Check if the user has won the game
  }
}

function resetGame() {
  player.cards = [];
  dealer.cards = [];

  player.score = 0;
  dealer.score = 0;

  player.status = "";
  hitButtonProperty.style.display = "none";
  stayButtonProperty.style.display = "none";

  gameOver = false;
  gameStarted = false;
}

function saveGameData() {
  var id = database.ref('table').push(table).key;
  console.log(id);
  return id;
}

function updateGameData() {
  database.ref('table/' + tableID + '/players/').set([{
    playerHand: table.players[0].playerHand,
    score: table.players[0].score,
    wins: table.players[0].wins,
    //username: nameField.val()
  }]);

  database.ref('table/' + tableID).update({
    dealerScore: table.dealerScore,
    dealerHand: table.dealerHand
  });

}

function addNewPlayer(playerObject) {
  console.log('this is player object ', playerObject);
  database.ref('table/' + tableID + '/players').push(playerObject);
}

function createGameTable() {
  if (table.players.length > 3) {
    console.log('the players array has ',table.players.length, ' people so the if clause ran');
    //If there are more than three people in the players array, dynamically build the player's buttons for the first
    //three players to arrive at the table
    for (var i = 0; i < 3; i++) {
      var player = "player-" + i;
      $(player).html(table.players[i].username);

      hitIdString = table.players[i].username + "-" + "hit" + "-" + "button";
      hitButton = hitIdString;
      var hitButtonHTML = $("<button id=" + hitIdString + " class='hit-buttons'>");
      var playerButtons = "#player-" + i + "-buttons";
      $(playerButtons).empty();
      $(playerButtons).append(hitButtonHTML);
      hitButtonHTML.html("Hit!");
      hitButtonProperty = document.getElementById(hitButton);
      hitButtonProperty.style.display = "inline";

      stayIdString = table.players[i].username + "-" + "stay" + "-" + "button";
      stayButton = stayIdString;
      var stayButtonHTML = $("<button id=" + stayIdString + ">");
      var playerButtons = "#player-" + i + "-buttons";
      $(playerButtons).append(stayButtonHTML);
      stayButtonHTML.html("Stay!");
      stayButtonProperty = document.getElementById(stayButton);
      stayButtonProperty.style.display = "inline";
    }
  }
  else {
    console.log('the players array has ',table.players.length, ' people so the else clause ran');

    //If there are 1-3 people in the players array, dynamically build the player's buttons for everyone in the array
    for (var i = 0; i < table.players.length; i++) {
      var player = "#player-" + i;
      $(player).html(table.players[i].username);

      hitIdString = table.players[i].username + "-" + "hit" + "-" + "button";
      hitButton = hitIdString;
      var hitButtonHTML = $("<button id=" + hitIdString + " class='hit-buttons'>");
      var playerButtons = "#player-" + i + "-buttons";
      $(playerButtons).empty();
      $(playerButtons).append(hitButtonHTML);
      hitButtonHTML.html("Hit!");
      hitButtonProperty = document.getElementById(hitButton);
      //hitButtonProperty.style.display = "inline";

      stayIdString = table.players[i].username + "-" + "stay" + "-" + "button";
      stayButton = stayIdString;
      var stayButtonHTML = $("<button id=" + stayIdString + ">");
      var playerButtons = "#player-" + i + "-buttons";
      $(playerButtons).append(stayButtonHTML);
      stayButtonHTML.html("Stay!");
      stayButtonProperty = document.getElementById(stayButton);
      stayButtonProperty.style.display = "inline";
    }
  }
}

function displayCards() {
    database.ref('table/' + tableID + '/players').on("value", function(snapshot) {
    //console.log(snapshot.val());
    var players = snapshot.val();
    console.log(typeof players);
    console.log('players array contains ',players);
    console.log('players array length is ', players.length);
    for (var i = 0; i < players.length; i++) {
      var cardDisplayParent = "#player-" + i + "-card-display";
      $(cardDisplayParent).empty();
      for (var j = 0; j <  players[i].playerHand.length; j++) {
        console.log('in here');
        console.log('img path ',j,' ',players[i].playerHand[j].image);
        var imgPath = players[i].playerHand[j].image;
        var cardImgHTML = $("<img src=" + imgPath + " height='106' width='76'>");
        console.log(cardDisplayParent);
        $(cardDisplayParent).append(cardImgHTML);
      }
    }
  });
}

function displayDealerCards() {
  database.ref('table/' + tableID + '')
}

function clearTable(player1, player2, player3) {
  player1.empty();
  player2.empty();
  player3.empty();
}

// Card variables
var suits = ["hearts", "clubs", "diamonds", "spades"];
var cardNames = ["ace", "king", "queen", "jack", "ten", "nine", "eight", "seven", "six", "five", "four", "three", "two"];

// DOM variables
var textArea = document.getElementById("text-area");
var newGameButton = "#new-game-button";
var hitButton;
var stayButton;
var newGameButtonProperty = document.getElementById('new-game-button');
var hitButtonProperty;
var stayButtonProperty;
var playerOneHand = document.getElementById("player-1");
var playerTwoHand = document.getElementById("player-2");
var playerThreeHand = document.getElementById("player-3");
var hitIdString = "";
var stayIdString = "";
var player0cards = $("#player-0-card-display");
var player1cards = $("#player-1-card-display");
var player2cards = $("#player-2-card-display");

// Game variables
var gameStarted = false;
var gameOver = false;
var playerWon = false;
var blackjack = true;
var push = false;


var decks = [];
var stayCount = 0;

// Initialize Firebase DB
var config = {
    apiKey: "AIzaSyAetl9uxbX0cwIibK_H1PUydPLuDtaZOho",
    authDomain: "blackjack-project.firebaseapp.com",
    databaseURL: "https://blackjack-project.firebaseio.com",
    projectId: "blackjack-project",
    storageBucket: "blackjack-project.appspot.com",
    messagingSenderId: "17576552103"
  };
  firebase.initializeApp(config);


// Database variables

var database = firebase.database();
var deck = [];
var tableID = "";

// Table Concept
var table = {
  gameDeck: [],
  uniqueID: "",
  minBet: 25,
  players: [],
  dealerScore: 0,
  dealerHand: []
};

console.log('the dealer has', table.dealerHand);

// Dealer Concept
var dealer = {
  score: 0,
  hasAce: false,
  cards: [],

  shuffleDeck: function (deck) {
      for (var i = 0; i < deck.length; i++) {
        var shuffle = Math.trunc(Math.random() * deck.length);
        var temp = deck[shuffle];
        deck[shuffle] = deck[i];
        deck[i] = temp;
      }
    },

  getNextCard:  function () {
      return deck.shift();
    },

  dealCards: function () {
    player.cards = [this.getNextCard(),this.getNextCard()];
    table.players[0].playerHand = player.cards;
    console.log(table.players[0].username,' is logged in');
    this.cards = [this.getNextCard(), this.getNextCard()];
    table.dealerHand = this.cards;
    console.log('the dealer has', table.dealerHand);
    console.log('the player has', table.players[0].playerHand);
    console.log('the player cards array has ',player.cards);
  },

  playHand: function () {
      // Lets the dealer take cards
      while (dealer.score < 17) {
        dealer.cards.push(this.getNextCard());
        dealer.updateDealerScore();
        console.log('after playing hand, dealer score is ',dealer.score);
        manageGameResults();
        showStatus();
      }
      gameOver = true;
      showStatus();
  },

  revealCard: function () {
    // Reset the image path to the one associated with the dealer's hidden card
    showStatus();
  },

  updateDealerScore: function () {
    if (player.status === "stay") {
      this.score = 0;
      for (var i = 0; i < this.cards.length; i++) {
        if (this.cards[i].name === "ace") {
          this.score += this.cards[i].value[0];
          table.dealerScore = this.score;
          this.hasAce = true;
        }
        else {
          this.score += this.cards[i].value;
          table.dealerScore = this.score;
        }
      }
        if (this.hasAce && this.score + 10 <= 21) {
          this.score + 10;
          table.dealerScore = this.score;
          return this.score;
        }
        return this.score;
      }
    else {
      this.score = 0;
      if (this.cards[0].name === "ace") {
        this.score += this.cards[0].value[0];
        table.dealerScore = this.score;
      }
      else {
        this.score += this.cards[0].value;
        table.dealerScore = this.score;
      }
    }
  }
}

var player = {
  score: 0,
  cards: [],
  hasAce: false,
  status: "",
  chipCount: 100,

  hitMe: function() {
    this.cards.push(dealer.getNextCard());
  },

  updatePlayerScore: function() {

    if (this.status === "stay") {

      return this.score
    }
    else {
      this.score = 0;
      this.hasAce = false;
      for (var i = 0; i < this.cards.length; i++) {
        if (this.cards[i].name === "ace") {
        this.score += this.cards[i].value[0];
        table.players[0].score = this.score;
        console.log('player score is ',this.score);
        this.hasAce = true;
        }
        else {
          this.score += this.cards[i].value;
          table.players[0].score = this.score;
          console.log('player score is ',this.score);
        }
      }
        if (this.hasAce && this.score + 10 <= 21) {
          this.score += 10;
          console.log('player score is ',this.score);
          table.players[0].score = this.score;
          return this.score
        }
      return this.score;
    }
  }
}

$(document).ready(function() {
// Main section of code
  textArea.innerText = "Welcome to Blackjack!";
  //deck = createDeck();
  //table.gameDeck = deck;

  // displays the modal
  // $('#myModal').modal('show');
  $('#myModal').modal({
  backdrop: 'static',
  keyboard: false
})

  // Hide the "Restart" button on document load
  $("#restart").hide();

  var playButton = $("#play-button");
  var nameField = $("#name-field");
  console.log('saving player data');
  deck = createDeck();
  table.gameDeck = deck;
  tableID = saveGameData();

  $(playButton).on("click", function(event) {
    
    var playerData = {
      playerHand: [],
      username: nameField.val(),
      score: 0,
      wins: 0
    }
    console.log('this is player data ',playerData);
    table.players.push(playerData);
    dealer.shuffleDeck(deck);
    dealer.dealCards();
    addNewPlayer(playerData);
    gameStarted = true;
    gameOver = false;
    createGameTable();
    player.updatePlayerScore();
    dealer.updateDealerScore();
    manageGameResults();
    updateGameData();
    showStatus();
    displayCards();
  });

  // Click listener for Hit Button
  $('body').on("click", hitButton, function(event) {
    event.preventDefault();
    if (event.target.id === hitIdString) {
      player.hitMe();
      player.updatePlayerScore();
      manageGameResults();
      updateGameData();
      displayCards();
      showStatus();
    }
  });

// Click listener for Stay Button
$('body').on("click", stayButton, function(event) {
  event.preventDefault();
    if (event.target.id === stayIdString) {
      player.status = "stay";
      dealer.revealCard();
      dealer.updateDealerScore();
      manageGameResults();
      showStatus();
      console.log('after player stays the dealer score is ', dealer.score);
      dealer.playHand();
      updateGameData();
      displayCards();
    }
  });

  $("#restart").on("click", function() {
    console.log("Restart selected");
    resetGame();
    clearTable(player0cards,player1cards,player2cards);
  });

});

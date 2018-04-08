// Initialize Firebase
var config = {
    apiKey: "AIzaSyC0OVFvuB_1gBBpi2luvJEF1aRmfYfCNYs",
    authDomain: "casino-blackjack-7d1ae.firebaseapp.com",
    databaseURL: "https://casino-blackjack-7d1ae.firebaseio.com",
    projectId: "casino-blackjack-7d1ae",
    storageBucket: "casino-blackjack-7d1ae.appspot.com",
    messagingSenderId: "503261881616"
  };
  firebase.initializeApp(config);

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

// Database variables
var database = firebase.database();
var deck = [];
var gameID = "";
var playersID = "";

// Dealer and Player Objects

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
      this.cards = [this.getNextCard(), this.getNextCard()];
    //   console.log('the dealer has', table.dealerHand);
    //   console.log('the player has', table.players[0].playerHand);
    //   console.log('the player cards array has ',player.cards);
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
            this.hasAce = true;
          }
          else {
            this.score += this.cards[i].value;
          }
        }
          if (this.hasAce && this.score + 10 <= 21) {
            this.score + 10;
            return this.score;
          }
          return this.score;
        }
      else {
        this.score = 0;
        if (this.cards[0].name === "ace") {
          this.score += this.cards[0].value[0];
        }
        else {
          this.score += this.cards[0].value;
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
          console.log('player score is ',this.score);
          this.hasAce = true;
          }
          else {
            this.score += this.cards[i].value;
            console.log('player score is ',this.score);
          }
        }
          if (this.hasAce && this.score + 10 <= 21) {
            this.score += 10;
            console.log('player score is ',this.score);
            return this.score
          }
        return this.score;
      }
    }
  }

$(document).ready(function() {

    initializeGame();
    gameID = initializeGameData();
    
    var playButton = $("#play-button");
    var nameField = $("#name-field");
    
    $(playButton).on("click", function(event) {

        database.ref('table/players/' + gameID).update({
            playerScore: 0,
            username: nameField.val()
          });
          playGame();
    });


});

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

function initializeGame() {
    $('#myModal').modal({
        backdrop: 'static',
        keyboard: false
    });
    $("#restart").hide();
    deck = createDeck();
    gameID = initializeGameData();
    initializeDealerData();
}

  function initializeGameData() {
    var id = database.ref('table/players').push().key;
    return id;
}

function initializeDealerData() {
     database.ref('table/dealer').set({
        dealerScore: 0
    });
}

function displayCards() {
    database.ref('table/players').on("value", function(snapshot) {
    //console.log(snapshot.val());
    var players = snapshot.val();
    Object.keys(players)
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

function playGame() {
    database.ref('table/players').on("child_added", function(snapshot) {
        gameStarted = true;
        gameOver = false;
        createGameTable();
        dealer.shuffleDeck(deck);
        dealer.dealCards();
        player.updatePlayerScore();
        dealer.updateDealerScore();
        manageGameResults();
        updateGameData();
        showStatus();
        displayCards();
    });
}

function updateGameData() {
    database.ref('table/players/' + gameID).set([{
      playerHand: player.cards,
      score: player.score
      //username: nameField.val()
    }]);
  
    database.ref('table/dealer').update({
      dealerScore: dealer.score,
      dealerHand: dealer.cards
    });
  
  }

function manageGameResults() {
// Trivial end-of-game cases
    if (gameOver) {
    if (player.score === 21 && dealer.score < 21) {
        playerWon = true;
        gameOver = true;
        return;
    }// Player wins

    if (dealer.score === 21 && player.score < 21) {
        playerWon = false;
        gameOver = true;
        return;
    }// Dealer wins

    if ((player.score > dealer.score) && player.score < 22) {
        playerWon = true;
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
        return;
    }// Player wins

    if (player.score === 21 &&
    player.cards.length === 2 &&
    dealer.score < 21) {
        playerWon = true;
        gameOver = true;
        blackjack = true;
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

    textArea.innerText =
    "Dealer has:\n" +
    dealerCardString +
    "(score: " + dealer.score + ")\n\n";

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

function createGameTable() {

    database.ref('table/players').on("child_added", function(snapshot) {
    var players = snapshot.val();
    console.log(players);
    
    // if (table.players.length > 3) {
    //   console.log('the players array has ',table.players.length, ' people so the if clause ran');
    //   //If there are more than three people in the players array, dynamically build the player's buttons for the first
    //   //three players to arrive at the table
    //   for (var i = 0; i < 3; i++) {
    //     var player = "player-" + i;
    //     $(player).html(table.players[i].username);
  
    //     hitIdString = table.players[i].username + "-" + "hit" + "-" + "button";
    //     hitButton = hitIdString;
    //     var hitButtonHTML = $("<button id=" + hitIdString + " class='hit-buttons'>");
    //     var playerButtons = "#player-" + i + "-buttons";
    //     $(playerButtons).empty();
    //     $(playerButtons).append(hitButtonHTML);
    //     hitButtonHTML.html("Hit!");
    //     hitButtonProperty = document.getElementById(hitButton);
    //     hitButtonProperty.style.display = "inline";
  
    //     stayIdString = table.players[i].username + "-" + "stay" + "-" + "button";
    //     stayButton = stayIdString;
    //     var stayButtonHTML = $("<button id=" + stayIdString + "class='stay-buttons'>");
    //     var playerButtons = "#player-" + i + "-buttons";
    //     $(playerButtons).append(stayButtonHTML);
    //     stayButtonHTML.html("Stay!");
    //     stayButtonProperty = document.getElementById(stayButton);
    //     stayButtonProperty.style.display = "inline";
    //   }
    // }
    // else {
    //   console.log('the players array has ',table.players.length, ' people so the else clause ran');
  
    //   //If there are 1-3 people in the players array, dynamically build the player's buttons for everyone in the array
    //   for (var i = 0; i < table.players.length; i++) {
    //     var player = "#player-" + i;
    //     $(player).html(table.players[i].username);
  
    //     hitIdString = table.players[i].username + "-" + "hit" + "-" + "button";
    //     hitButton = hitIdString;
    //     var hitButtonHTML = $("<button id=" + hitIdString + " class='hit-buttons'>");
    //     var playerButtons = "#player-" + i + "-buttons";
    //     $(playerButtons).empty();
    //     $(playerButtons).append(hitButtonHTML);
    //     hitButtonHTML.html("Hit!");
    //     hitButtonProperty = document.getElementById(hitButton);
    //     //hitButtonProperty.style.display = "inline";
  
    //     stayIdString = table.players[i].username + "-" + "stay" + "-" + "button";
    //     stayButton = stayIdString;
    //     var stayButtonHTML = $("<button id=" + stayIdString + "class='stay-buttons'>");
    //     var playerButtons = "#player-" + i + "-buttons";
    //     $(playerButtons).append(stayButtonHTML);
    //     stayButtonHTML.html("Stay!");
    //     stayButtonProperty = document.getElementById(stayButton);
    //     stayButtonProperty.style.display = "inline";
    //   }
    // }
  });
  
  function displayDealerCards() {
    database.ref('table/' + gameID).on("value", function(snapshot) {
        console.log(snapshot.val());
    });
  }
  
  function clearTable(player1, player2, player3) {
    player1.empty();
    player2.empty();
    player3.empty();
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
    initializeGame();
    playGame();
}

}


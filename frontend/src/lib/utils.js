import { useEffect } from "react";

export const INITIAL_CARD_STATE = {
  cardNumber: 0,
  isFlipped: true,
  isSelect: false,
  rowNumber: 6, // only 5 rows (0-4), a row of index 5 indicates the card is still in the stack
  colNumber: 0,
  isInBullHeadStack: false,
  isInDrawPile: true,
};

export const createCard = (
  {
    cardNumber = 0,
    isFlipped = false,
    isSelect = false,
    rowNumber = 6,
    colNumber = 0,
    isInBullHeadStack = false,
    isInDrawPile = true,
  } = {}, // added = {} , so that when i call createCard() , i am expected to pass an empty object, but adding ={} creates a default {} ig.
) => {
  return {
    cardNumber,
    isFlipped,
    isSelect,
    rowNumber,
    colNumber,
    isInBullHeadStack,
    isInDrawPile,
  };
};

export const shuffleArray = (array) => {
  let n = array.length;

  for (let i = 0; i < n; i++) {
    let j = Math.floor(Math.random() * (i + 1)) % n;

    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
};

export const distributeCards = (cards, setCards) => {
  let cardNums = [];
  for (let i = 1; i <= 104; i++) cardNums.push(i);

  shuffleArray(cardNums);

  const initialDeck = cardNums.map((cardNum) =>
    createCard({
      cardNumber: cardNum,
      isFlipped: true,
      isInBullHeadStack: false,
      isSelect: false,
      isInDrawPile: true,
    }),
  );

  setCards(initialDeck);

  console.log(cards);

  shuffleArray(cardNums);

  let rowNum = 1;

  let distributeIdx = 0;

  const setIntervalID = setInterval(() => {
    if (distributeIdx === 104) {
      clearInterval(setIntervalID);
    }

    setCards((cards) => {
      const newCards = cards.map((card, idx) => {
        // console.log(distributeIdx);
        if (idx === distributeIdx) {
          if (distributeIdx < 10) {
            card.rowNumber = 0;
            card.isFlipped = false;
            card.isInDrawPile = false;
            return card;
          } else if (distributeIdx >= 10 && distributeIdx < 20) {
            card.rowNumber = 5;
            card.isFlipped = false;
            card.isInDrawPile = false;
            return card;
          } else if (distributeIdx >= 20 && distributeIdx <= 23) {
            card.rowNumber = rowNum;
            card.isFlipped = false;
            card.isInDrawPile = false;
            return card;
          } else {
            card.isFlipped = true;
            card.rowNumber = 6;
            card.isInDrawPile = true;
            return card;
          }
        } else {
          return card;
        }
      });
      return newCards;
    });
    if (distributeIdx >= 20) rowNum++;
    distributeIdx++;
  }, 50);
};

const convertToJSON = (gameStats, cards) => {
  // console.log("GAME SATS : ", { ...gameStats });
  const resp = {
    hasStarted: gameStats.hasStarted,
    playerTurn: gameStats.playerTurn,
    hasEnded: gameStats.hasEnded,
    playerScore: gameStats.playerScore,
    aiScore: gameStats.aiScore,
    playerWon: gameStats.playerWon,
    aiWon: gameStats.aiWon,
    aiAlgo: gameStats.aiAlgo,
    cards: cards,
  };
  return resp;
};

const setNewGameState = (cards, setCards, gameStats, setGameStats, data) => {
  let newGameStats = { ...gameStats };

  newGameStats.playerScore = data.playerScore;
  newGameStats.aiScore = data.aiScore;
  newGameStats.aiWon = data.aiWon;
  newGameStats.playerWon = data.playerWon;

  setGameStats((prev) => ({
    ...prev,
    playerScore: data.playerScore,
    aiScore: data.aiScore,
    aiWon: data.aiWon,
    playerWon: data.playerWon,
  }));

  setTimeout(() => {
    setCards(data.cards);
  }, 1000);
};

export const sendRequestToAi = async (
  cards,
  setCards,
  gameStats,
  setGameStats,
) => {
  const req = convertToJSON(gameStats, cards);

  try {
    console.log("REQUEST : ", req);
    const response = await fetch(`http://localhost:8000/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req),
    });

    const data = await response.json();
    console.log("Success : ", data);

    setNewGameState(cards, setCards, gameStats, setGameStats, data);
  } catch (error) {
    console.log("Error in sending req to server: ", error);
  }
  console.log("HI FROM API");
};

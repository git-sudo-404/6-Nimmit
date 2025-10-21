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

export const convertToJSON = (gameStats, cards) => {
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
    cards: cards.map((card) => ({
      cardNumber: card.cardNumber,
      isFlipped: card.isFlipped,
      isSelect: card.isSelect,
      rowNumber: card.rowNumber ?? 0,
      colNumber: card.colNumber ?? 0,
      isInBullHeadStack: card.isInBullHeadStack,
      isInDrawPile: card.isInDrawPile,
    })),
    r1Over: gameStats.r1Over,
    r2Over: gameStats.r2Over,
    r3Over: gameStats.r3Over,
    r1playerWon: gameStats.r1playerWon,
    r2playerWon: gameStats.r2playerWon,
    r3playerWon: gameStats.r3playerWon,
    r1playerScore: gameStats.r1playerScore,
    r2playerScore: gameStats.r2playerScore,
    r3playerScore: gameStats.r3playerScore,
    r1aiScore: gameStats.r1aiScore,
    r2aiScore: gameStats.r2aiScore,
    r3aiScore: gameStats.r3aiScore,
    round: gameStats.round,
  };
  return resp;
};

export const setNewGameState = async (
  gameStats,
  setGameStats,
  cards,
  setCards,
  data,
) => {
  try {
    let newGameStats = { ...gameStats };
    newGameStats.round = data.round;
    newGameStats.r1aiScore = data.r1aiScore;
    newGameStats.r2aiScore = data.r2aiScore;
    newGameStats.r3aiScore = data.r3aiScore;
    newGameStats.r1playerScore = data.r1playerScore;
    newGameStats.r2playerScore = data.r2playerScore;
    newGameStats.r3playerScore = data.r3playerScore;
    newGameStats.aiScore = data.aiScore;
    newGameStats.playerScore = data.playerScore;
    newGameStats.aiWon = data.aiWon;
    newGameStats.r1playerWon = data.r1playerWon;
    newGameStats.r2playerWon = data.r2playerWon;
    newGameStats.r3playerWon = data.r3playerWon;

    // setGameStats(newGameStats);
    // Update the gameStat for the score to rerender again & again for the animation.

    let scoreIncrease = newGameStats.aiScore - gameStats.aiScore;

    for (let i = 0; i < scoreIncrease; i++) {
      await delay(50);
      let ngameStats = { ...newGameStats };
      ngameStats.aiScore++;
      if (ngameStats.round === 1) {
        ngameStats.r1aiScore++;
      } else if (ngameStats.round === 2) {
        ngameStats.r2aiScore++;
      } else {
        ngameStats.r3aiScore++;
      }
      setGameStats(ngameStats);
    }

    let newCards = data.cards;

    setCards(newCards);
  } catch (error) {
    console.log("Error in utils ai state update : ", error);
  }
};

export const getBullHead = (cardNumber) => {
  if (cardNumber === 55) return 7;
  else if (cardNumber % 10 === 0) return 3;
  else if (cardNumber % 11 === 0) return 5;
  else if (cardNumber % 5 === 0) return 2;
  return 1;
};

export const delay = (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms);
  });
};

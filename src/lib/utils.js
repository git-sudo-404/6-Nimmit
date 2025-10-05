export const INITIAL_CARD_STATE = {
  cardNumber: 0,
  isFlipped: true,
  isSelect: false,
  rowNumber: 5, // only 5 rows (0-4), a row of index 5 indicates the card is still in the stack
  colNumber: 0,
  isInBullHeadStack: false,
  isInDrawPile: true,
};

export const createCard = (
  {
    cardNumber = 0,
    isFlipped = false,
    isSelect = false,
    rowNumber = 5,
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
  let cardNumbers = [];
  let temp = [];
  const n = 30;

  console.log(cardNumbers);

  for (let i = 1; i <= n; i++) {
    temp.push(createCard());
    cardNumbers.push(i);
  }

  shuffleArray(cardNumbers);

  // Player's Hand

  for (let i = 0; i < 10; i++) {
    temp[i].cardNumber = cardNumbers[i];
    temp[i].rowNumber = 5;
    temp[i].colNumber = i;
    temp[i].isFlipped = false;
    temp[i].isSelect = false;
    temp[i].isInBullHeadStack = false;
    temp[i].isInDrawPile = false;
  }

  // AI's Hand

  for (let i = 10; i < 20; i++) {
    temp[i].cardNumber = cardNumbers[i];
    temp[i].rowNumber = 0;
    temp[i].colNumber = i - 10;
    temp[i].isFlipped = false;
    temp[i].isSelect = false;
    temp[i].isInBullHeadStack = false;
    temp[i].isInDrawPile = false;
  }

  // DrawPile

  for (let i = 20; i < n; i++) {
    temp[i].cardNumber = cardNumbers[i];
    temp[i].rowNumber = 6;
    temp[i].colNumber = 0;
    temp[i].isFlipped = true;
    temp[i].isSelect = false;
    temp[i].isInBullHeadStack = false;
    temp[i].isInDrawPile = true;
  }

  setCards(temp);
};

const convertToJSON = (gameStats, cards) => {
  const resp = {
    playerScore: gameStats.playerScore,
    aiScore: gameStats.aiScore,
    aiWon: gameStats.aiWon,
    playerWon: gameStats.playerWon,
    aiAlgo: gameStats.aiALgo,

    aiHand: [
      cards.filter((card) => card.rowNumber === 0 && card.isFlipped === false),
    ],
  };
};

export const sendRequestToAi = async ({
  gameStats,
  setGameStats,
  cards,
  setCards,
}) => {
  const req = convertToJSON(gameStats, cards);
};

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
  const n = 104;

  for (let i = 1; i <= n; i++) {
    cardNumbers.push(i);
  }
  shuffleArray(cardNumbers);

  const initialCards = cardNumbers.map((num) =>
    createCard({
      cardNumber: num,
      rowNumber: 6, // Draw Pile
      isFlipped: true,
      isInDrawPile: true,
    }),
  );
  setCards(initialCards);

  // Use a single loop with a delay to distribute cards one by one
  let distributedCount = 0;
  let rowN = 1;
  const interval = setInterval(() => {
    if (distributedCount >= 23) {
      clearInterval(interval);
      return;
    }
    setCards((prevCards) => {
      const newCards = [...prevCards];
      const cardToUpdate = newCards[distributedCount];
      if (distributedCount < 10) {
        // Player's Hand
        cardToUpdate.rowNumber = 5;
        cardToUpdate.colNumber = distributedCount;
        cardToUpdate.isFlipped = false;
        cardToUpdate.isInDrawPile = false;

        // console.log(distributedCount);
      } else if (distributedCount >= 10 && distributedCount < 20) {
        // AI's Hand
        cardToUpdate.rowNumber = 0;
        cardToUpdate.colNumber = distributedCount - 10;
        cardToUpdate.isFlipped = true;
        cardToUpdate.isInDrawPile = false;
      } else {
        cardToUpdate.rowNumber = rowN;
        cardToUpdate.colNumber = 0;
        cardToUpdate.isFlipped = false;
        cardToUpdate.isInDrawPile = false;
        // console.log(rowN);
      }
      return newCards;
    });
    if (distributedCount >= 20) rowN++;
    distributedCount++;
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

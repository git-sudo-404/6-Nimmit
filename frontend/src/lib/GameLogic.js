//NOTE: When to use Asynchronous ?
//--> when it involves the following :
//        -> I/O (file read (or) write).
//        -> API (fetch()).
//        -> Timers (setTimeout(),intervals(),..).

import {
  shuffleArray,
  createCard,
  delay,
  convertToJSON,
  setNewGameState,
  getBullHead,
} from "./utils.js";

// Called after every round.
export const distributeCards = (cards, setCards) => {
  return new Promise((resolve, reject) => {
    try {
      let cardNumbers = [];
      for (let i = 1; i <= 104; i++) cardNumbers.push(i);

      shuffleArray(cardNumbers);

      let tempCards = [];

      // setup the initial set of Cards first, (everything in row 6)

      for (let i = 1; i <= 104; i++) {
        let card = createCard();
        card.cardNumber = cardNumbers[i - 1];
        card.isFlipped = false;
        card.isInBullHeadStack = false;
        card.rowNumber = 6;
        card.colNumber = 0;
        card.isSelect = false;
        card.isInDrawPile = true;

        tempCards.push(card);
      }

      // set the Initial State, everything in deck.

      setCards(tempCards);

      // Now for every 50ms change the state such a way that every card gets distributed .

      let distributingCardInd = 0;
      let rowNum = 1;

      const distributionIntervalId = setInterval(() => {
        if (distributingCardInd > 23) {
          clearInterval(distributionIntervalId);
        }

        // tempCards is already in random order, just change the rowNumber here .

        if (distributingCardInd < 10) {
          tempCards[distributingCardInd].rowNumber = 0;
          tempCards[distributingCardInd].isInDrawPile = false;
          tempCards[distributingCardInd].isFlipped = true;
          tempCards[distributingCardInd].isInBullHeadStack = false;
        } else if (distributingCardInd >= 10 && distributingCardInd < 20) {
          tempCards[distributingCardInd].rowNumber = 5;
          tempCards[distributingCardInd].isInDrawPile = false;
          tempCards[distributingCardInd].isInBullHeadStack = false;
          tempCards[distributingCardInd].isFlipped = false;
        } else if (distributingCardInd >= 20 && distributingCardInd <= 23) {
          tempCards[distributingCardInd].rowNumber = rowNum;
          tempCards[distributingCardInd].isInDrawPile = false;
          tempCards[distributingCardInd].isInBullHeadStack = false;
          tempCards[distributingCardInd].isFlipped = false;
          rowNum++;
        }
        distributingCardInd++;
        setCards([...tempCards]);
      }, 100);
      resolve(tempCards);
    } catch (error) {
      reject(error);
    }
  });
};

export const sendRequestToAi = (
  cards,
  setCards,
  gameStats,
  setGameStats,
  handleScoreIncreaseAudio,
) => {
  return new Promise((resolve, reject) => {
    const req = convertToJSON(gameStats, cards);
    console.log("Request sent to AI : ", req);
    fetch("http://localhost:8000/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req),
    })
      .then((res) => res.json())
      .then((data) =>
        setNewGameState(
          gameStats,
          setGameStats,
          cards,
          setCards,
          data,
          handleScoreIncreaseAudio,
        )
          .then(() => resolve())
          .catch((err) => reject(err)),
      )
      .catch((err) => reject(err));
  });
};

//NOTE: GameBoard.jsx Logic helpers .

export const getRowMaxCard = (cards, row) => {
  let maxCard = 0;
  for (const card of cards) {
    if (card.rowNumber === row) maxCard = Math.max(maxCard, card.cardNumber);
  }
  return maxCard;
};

export const checkPlayerMaxiLessThanRows = (cards) => {
  let PlayerMaxi = 0;

  console.log(cards);

  cards.map((card) => {
    if (card.rowNumber === 5 && !card.isInBullHeadStack)
      PlayerMaxi = Math.max(PlayerMaxi, card.cardNumber);
  });

  let r1Maxi = getRowMaxCard(cards, 1);
  let r2Maxi = getRowMaxCard(cards, 2);
  let r3Maxi = getRowMaxCard(cards, 3);
  let r4Maxi = getRowMaxCard(cards, 4);

  let RowsMinCard = Math.min(r1Maxi, r2Maxi, r3Maxi, r4Maxi);

  if (RowsMinCard < PlayerMaxi) {
    return false;
  } else {
    return true;
  }
};

export const handlePayerMaxiLessThanRows = async (
  cards,
  setCards,
  ChosenCard,
  ChosenRow,
  isRowMovedToBullHead,
  setIsRowMovedToBullHead,
  gameStats,
  setGameStats,
) => {
  let temp = cards;

  //NOTE: Update has to be called first, since the update function makes use of the cards in the row before they are sent to bullhead .

  await updatePlayerScoreByRowAlone(gameStats, setGameStats, cards, ChosenRow);

  temp = temp.map((card) => {
    if (card.cardNumber === ChosenCard) {
      card.rowNumber = ChosenRow;
    } else if (card.rowNumber === ChosenRow) {
      card.rowNumber = 5;
      card.isInBullHeadStack = true;
    }
    return card;
  });

  setIsRowMovedToBullHead(true);

  await delay(2000);

  setIsRowMovedToBullHead(false);

  setCards(temp);
};

// It is assumed that Maximum player Card is less than the Rows is checked earlier.

export const checkIsInValidMove = (cards, ChosenCard, ChosenRow) => {
  let RowMaxi = getRowMaxCard(cards, ChosenRow);
  if (ChosenCard < RowMaxi) {
    return true;
  } else {
    return false;
  }
};

export const handleInvalidMove = async (isInValidMove, setIsInValidMove) => {
  setIsInValidMove(true);

  await delay(1500);

  setIsInValidMove(false);
};

// It is assumed that if any row has 6 cards then it was made by player since ,
// the last move is made by the player.

export const checkPlayerPlacedSixthCard = (cards, setCards, ChosenRow) => {
  let r1Count = 0,
    r2Count = 0,
    r3Count = 0,
    r4Count = 0;

  cards.map((card) => {
    if (card.rowNumber === 1) {
      r1Count++;
    } else if (card.rowNumber === 2) {
      r2Count++;
    } else if (card.rowNumber === 3) {
      r3Count++;
    } else if (card.rowNumber === 4) {
      r4Count++;
    }
  });

  if (ChosenRow === 1) r1Count++;
  else if (ChosenRow === 2) r2Count++;
  else if (ChosenRow === 3) r3Count++;
  else if (ChosenRow === 4) r4Count++;

  console.log("Row Card Counts : ", r1Count, r2Count, r3Count, r4Count);

  return r1Count >= 6 || r2Count >= 6 || r3Count >= 6 || r4Count >= 6;
};

export const handlePlayerPlacedSixthCard = async (
  cards,
  setCards,
  ChosenRow,
  ChosenCard,
  isSixthCardMovedToBullHead,
  setIsSixthCardMovedToBullHead,
  gameStats,
  setGameStats,
) => {
  await updatePlayerScoreByRowAndChosenCard(
    gameStats,
    setGameStats,
    cards,
    ChosenRow,
    ChosenCard,
  );

  let temp = cards;

  temp = temp.map((card) => {
    if (card.rowNumber === ChosenRow || card.cardNumber === ChosenCard) {
      card.rowNumber = 5;
      card.isInBullHeadStack = true;
    }
    return card;
  });

  setIsSixthCardMovedToBullHead(true);

  await delay(2500);

  setIsSixthCardMovedToBullHead(false);

  setCards(temp);
};

export const displayAIThinkingAnimation = async (gameStats, setGameStats) => {
  setGameStats((prev) => {
    return {
      ...prev,
      playerTurn: false,
    };
  });

  await delay(1000);

  setGameStats((prev) => {
    return {
      ...prev,
      playerTurn: true,
    };
  });
};

export const updatePlayerScoreByRowAndChosenCard = async (
  gameStats,
  setGameStats,
  cards,
  ChosenRow,
  ChosenCard,
) => {
  let scoreIncrease = 0;

  cards.map((card) => {
    if (card.rowNumber === ChosenRow || card.cardNumber === ChosenCard) {
      scoreIncrease = getBullHead(card.cardNumber) + scoreIncrease;
      console.log("Bull Head : ", getBullHead(card.cardNumber));
      console.log("CARD");
    }
  });

  for (let i = 1; i <= scoreIncrease; i++) {
    await delay(50);

    setGameStats((prev) => {
      let newGameStat = { ...prev };

      newGameStat.playerScore++;

      if (newGameStat.round === 1) {
        newGameStat.r1playerScore++;
      } else if (newGameStat.round === 2) {
        newGameStat.r2playerScore++;
      } else {
        newGameStat.r3playerScore++;
      }

      return newGameStat;
    });
  }
};

export const updatePlayerScoreByRowAlone = async (
  gameStats,
  setGameStats,
  cards,
  ChosenRow,
) => {
  let scoreIncrease = 0;

  cards.map((card) => {
    if (card.rowNumber === ChosenRow) {
      // console.log("CARD : ", card.cardNumber);
      scoreIncrease = getBullHead(card.cardNumber) + scoreIncrease;
      // console.log("Bull Head : ", getBullHead(card.cardNumber));
    }
  });

  for (let i = 1; i <= scoreIncrease; i++) {
    await delay(50);

    setGameStats((prev) => {
      let newGameStat = { ...prev };

      newGameStat.playerScore++;

      if (newGameStat.round === 1) {
        newGameStat.r1playerScore++;
      } else if (newGameStat.round === 2) {
        newGameStat.r2playerScore++;
      } else {
        newGameStat.r3playerScore++;
      }

      return newGameStat;
    });
  }
  // console.log("Score Increase : ", scoreIncrease);
};

//TODO: ADD score updation sounds.
//TODO: Add the 6th Card placed dialog Box .
//TODO: Add some backend Logic for different algorithms .
//TODO: Add Undo / Redo Options .

export const checkRedistribution = (cards) => {
  let remainingCards = 0;

  let playerCards = 0;

  cards.map((card) => {
    if (card.rowNumber === 6) {
      remainingCards++;
    }
    if (card.rowNumber === 5 && !card.isInBullHeadStack) {
      playerCards++;
    }
  });

  if (playerCards > 0) return false;

  return remainingCards >= 20;
};

export const handleRedistribution = async (
  cards,
  setCards,
  gameStats,
  setGameStats,
  setIsRedistributing,
) => {
  // Just going with absolut brute force her since , its just 104 cards .

  let remainingCards = [];

  cards.map((card) => {
    if (card.rowNumber === 6) {
      remainingCards.push(card.cardNumber);
    }
  });

  shuffleArray(remainingCards);

  await delay(1000);

  setIsRedistributing(true);

  // set the first 10 to AI & the next 10 to player like in distribution .

  for (let i = 0; i < 20; i++) {
    await delay(100);
    if (i < 10) {
      // AI hand

      setCards((prev) => {
        let newCards = [...prev];
        newCards = newCards.map((card) => {
          if (card.cardNumber === remainingCards[i]) {
            card.rowNumber = 0;
            card.isInBullHeadStack = false;
            card.isInDrawPile = false;
          }
          return card;
        });
        return newCards;
      });
    } else {
      // Player Hand

      setCards((prev) => {
        let newCards = [...prev];
        newCards = newCards.map((card) => {
          if (card.cardNumber === remainingCards[i]) {
            card.rowNumber = 5;
            card.isInBullHeadStack = false;
            card.isInDrawPile = false;
          }
          return card;
        });

        return newCards;
      });
    }
  }

  await delay(800);
  setIsRedistributing(false);
};

export const checkNextRound = (cards) => {
  let playerCards = 0;
  let remainingCards = 0;

  cards.map((card) => {
    if (card.rowNumber === 6) remainingCards++;
    if (card.rowNumber === 5 && !card.isInBullHeadStack) playerCards++;
  });

  if (remainingCards > 20 || playerCards > 0) return false;

  return true;
};

export const handleNextRound = async (
  cards,
  setCards,
  gameStats,
  setGameStats,
  setIsRoundOver,
  setIsRoundWin,
) => {
  // Before moving on to the next round display the result of the current round win / loss .
  // update the gameStats

  // set the isRoundOver

  if (gameStats.round === 1) {
    if (gameStats.r1playerScore < gameStats.r1aiScore) {
      setIsRoundWin(true);
    } else {
      setIsRoundWin(false);
    }

    setIsRoundOver(true);

    await delay(3000);

    setIsRoundOver(false);

    setGameStats((prev) => {
      let newGameStat = { ...prev };
      newGameStat.round++;
      return newGameStat;
    });

    distributeCards(cards, setCards);
  } else if (gameStats.round === 2) {
    if (gameStats.r2playerScore < gameStats.r2aiScore) {
      setIsRoundWin(true);
    } else {
      setIsRoundWin(false);
    }

    setIsRoundOver(true);

    await delay(3000);

    setIsRoundOver(false);

    setGameStats((prev) => {
      let newGameStat = { ...prev };
      newGameStat.round++;
      return newGameStat;
    });

    distributeCards(cards, setCards);
  } else if (gameStats.round === 3) {
    // no Next Round , Game Over .
  }
};

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

//NOTE: Modified the sendRequestToAi(),
//Earlier : it sets the new states here.
//NOW : it return the new state.

export const sendRequestToAi = (cards, setCards, gameStats, setGameStats) => {
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
        setNewGameState(gameStats, setGameStats, cards, setCards, data)
          .then(() => resolve())
          .catch((err) => reject(err)),
      )
      .catch((err) => reject(err));
  });
};

// Called once the hand is emptied.
//NOTE:  It is assumed that the possiblity of redistribution of cards is checked before calling this function.
export const redistributeCards = (cards, setCards) => {
  return new Promise((resolve, reject) => {
    try {
      let remainingCards = [];
      cards.map((card) => {
        if (card.rowNumber === 6 && !card.isInBullHeadStack)
          remainingCards.push(card.cardNumber);
      });

      shuffleArray(remainingCards);

      let temp = cards;

      let redistributeCount = 0;

      const IntervalId = setInterval(() => {
        if (redistributeCount >= 20) {
          clearInterval(IntervalId);
        }

        if (redistributeCount < 10) {
          temp = temp.map((card) => {
            if (card.cardNumber === remainingCards[redistributeCount]) {
              card.rowNumber = 0;
              card.isInBullHeadStack = false;
            }
            return card;
          });
        } else if (redistributeCount >= 10 && redistributeCount < 20) {
          temp = temp.map((card) => {
            if (card.cardNumber === remainingCards[redistributeCount]) {
              card.rowNumber = 5;
              card.isInBullHeadStack = false;
            }
          });
        }

        redistributeCount++;

        setCards(temp);
      }, 100);

      setCards(temp);

      resolve(cards);
    } catch (error) {
      reject(error);
    }
  });
};

//NOTE: No need for them to be Asynchronous.
//
// export const getPlayerMaxCardNumber = (cards) => {
//   return new Promise((resolve, reject) => {
//     try {
//       let maxCardNumber = 0;
//       cards.map((card) => {
//         if (card.rowNumber === 5 && !card.isInBullHeadStack) {
//           maxCardNumber = Math.max(maxCardNumber, card.cardNumber);
//         }
//       });
//       if (maxCardNumber === 0) {
//         reject("Player has no Cards");
//       }
//       resolve(maxCardNumber);
//     } catch (error) {
//       reject(error);
//     }
//   });
// };
//
// // return the last card (maximum card Number) of a row.
// export const getRowMaxCard = (cards, row) => {
//   return new Promise((resolve, reject) => {
//     try {
//       let maxCardNumber = 0;
//       cards.map((card) => {
//         if (card.rowNumber === row) {
//           maxCardNumber = Math.max(maxCardNumber, card.cardNumber);
//         }
//       });
//       resolve(maxCardNumber);
//     } catch (error) {
//       reject(error);
//     }
//   });
// };
//
// // returns the minimum of all the last cards of all the rows.
// export const getMinOfMaxRowCards = (cards) => {
//   return new Promise((resolve, reject) => {
//     try {
//       let r1Last = getRowMaxCard(cards, 1);
//       let r2Last = getRowMaxCard(cards, 2);
//       let r3Last = getRowMaxCard(cards, 3);
//       let r4Last = getRowMaxCard(cards, 4);
//
//       let miniRowsLastCard = Math.min(r1Last, r2Last, r3Last, r4Last);
//
//       resolve(miniRowsLastCard);
//     } catch (error) {
//       reject(error);
//     }
//   });
// };
//
// export const checkAllRowsGreaterThanPlayerMaxCardNumber = (cards) => {
//   return new Promise((resolve, reject) => {
//     try {
//       let playerMaxCardNumber = getPlayerMaxCardNumber(cards);
//       let miniOfMaxRowCardNumber = getMinOfMaxRowCards(cards);
//
//       if (miniOfMaxRowCardNumber > playerMaxCardNumber) {
//         resolve(true);
//       } else {
//         reject(false);
//       }
//     } catch (error) {
//       reject(error);
//     }
//   });
// };

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

  await delay(2500);

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

// export const updatePlayerScoreByRowAndChosenCard = (
//   gameStats,
//   setGameStats,
//   cards,
//   ChosenRow,
//   ChosenCard,
// ) => {
//   return new Promise((resolve, reject) => {
//     let scoreIncrease = 0;
//
//     cards.map((card) => {
//       if (card.rowNumber === ChosenRow || card.cardNumber === ChosenCard) {
//         scoreIncrease += getBullHead(card.cardNumber);
//       }
//     });
//
//     let score = 0;
//
//     const IntervalId = setInterval(() => {
//       if (score >= scoreIncrease) {
//         clearInterval(IntervalId);
//         resolve();
//         return;
//       }
//
//       setGameStats((prev) => {
//         let newGameStats = { ...prev };
//
//         if (prev.round === 1) {
//           newGameStats.r1playerScore += 1;
//         } else if (prev.round === 2) {
//           newGameStats.r2playerScore += 1;
//         } else if (prev.round === 3) {
//           newGameStats.r3playerScore += 1;
//         }
//
//         newGameStats.playerScore += 1;
//
//         return newGameStats;
//       });
//       score++;
//     }, 20);
//   });
// };
//
// export const updatePlayerScoreByRowAlone = (
//   gameStats,
//   setGameStats,
//   cards,
//   ChosenRow,
// ) => {
//   return new Promise((resolve, reject) => {
//     let scoreIncrease = 0;
//
//     cards.map((card) => {
//       if (card.rowNumber === ChosenRow) {
//         scoreIncrease += getBullHead(card.cardNumber);
//       }
//     });
//
//     let score = 0;
//
//     //NOTE: This causes Staleness / Does stale updates.
//     //      --> Here the gameStats might not be having the newest update.
//     //      --> so use functinoal update in set().
//
//     // const IntervalId = setInterval(() => {
//     //   if (score >= scoreIncrease) {
//     //     clearInterval(IntervalId);
//     //   }
//     //
//     //   let newGameStats = { ...gameStats };
//     //
//     //   newGameStats.playerScore += 1;
//     //
//     //   if (gameStats.round === 1) {
//     //     newGameStats.r1playerScore += 1;
//     //   } else if (gameStats.round === 2) {
//     //     newGameStats.r2playerScore += 1;
//     //   } else if (gameStats.round === 3) {
//     //     newGameStats.r3playerScore += 1;
//     //   }
//     //
//     //   score++;
//     //
//     //   setGameStats(newGameStats);
//     //   console.log(gameStats.playerScore);
//     // }, 20);
//     // resolve();
//
//
//     //NOTE: The below code also doesn't work since :
//     //    --> The setInterval and setGameStats() are not synchronised.
//     //    --> Js takes care of setInterval and react takes care of setGameStats , so
//     //        when the setInterval is called the setGameStats might not be at the newset state.
//     //    --> Instead use a simple loop and make the function async and make use of delay() function.
//
//     const IntervalId = setInterval(() => {
//       if (score >= scoreIncrease) {
//         clearInterval(IntervalId);
//         resolve();
//         return;
//       }
//
//       setGameStats((prev) => {
//         let newGameStats = { ...prev };
//
//         if (prev.round === 1) {
//           newGameStats.r1playerScore += 1;
//         } else if (prev.round === 2) {
//           newGameStats.r2playerScore += 1;
//         } else if (prev.round === 3) {
//           newGameStats.r3playerScore += 1;
//         }
//
//         newGameStats.playerScore += 1;
//
//         return newGameStats;
//       });
//       score++;
//     }, 20);
//   });
// };

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
      return {
        ...prev,
        playerScore: prev.playerScore + 1,
      };
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
      return {
        ...prev,
        playerScore: prev.playerScore + 1,
      };
    });
  }
  // console.log("Score Increase : ", scoreIncrease);
};

//TODO: Score not getting updated properly.
//TODO: Redistribution and Next Round.
//TODO: Add some backend Logic for different algorithms.

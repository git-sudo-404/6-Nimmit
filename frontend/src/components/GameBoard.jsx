import React, { useEffect } from "react";
import PlayerHand from "./PlayerHand";
import EnemyHand from "./EnemyHand";
import Arena from "./Arena";

import { useState, useRef } from "react";
import GameStartBox from "./GameStartBox.jsx";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import InValidMove from "./InValidMove.jsx";
import MoveRowToBullHead from "./MoveRowToBullHead.jsx";
import Victory from "./Victory.jsx";
import RoundOver from "./RoundOver.jsx";
import SixthCardMovedToBullHead from "./SixthCardMovedToBullHead.jsx";
import {
  checkPlayerMaxiLessThanRows,
  distributeCards,
  handleInvalidMove,
  handlePayerMaxiLessThanRows,
  checkIsInValidMove,
  checkPlayerPlacedSixthCard,
  handlePlayerPlacedSixthCard,
  sendRequestToAi,
  displayAIThinkingAnimation,
} from "../lib/GameLogic.js";
import { delay } from "../lib/utils.js";

const GameBoard = () => {
  const [cards, setCards] = useState([]);
  const [gameStats, setGameStats] = useState({
    hasStarted: false,
    playerTurn: true,
    hasEnded: false,
    playerWon: false,
    aiWon: false,
    // isDealingCard: true,
    aiAlgo: 0, // by default = 0 --> ExpectiMiniMax Algo , 1 --> Monte Carlo Tree Search .
    playerScore: 0,
    aiScore: 0,
    r1Over: false,
    r2Over: false,
    r3Over: false,
    r1playerWon: false,
    r2playerWon: false,
    r3playerWon: false,
    r1playerScore: 0,
    r2playerScore: 0,
    r3playerScore: 0,
    r1aiScore: 0,
    r2aiScore: 0,
    r3aiScore: 0,
    round: 1,
  });

  const buttonRef = useRef(null);
  const [activeId, setActiveId] = useState(null);

  const [isInValidMove, setIsInValidMove] = useState(false);
  const [isRowMovedToBullHead, setIsRowMovedToBullHead] = useState(false);
  const [isSixthCardMovedToBullHead, setIsSixthCardMovedToBullHead] =
    useState(false);

  useEffect(() => {
    if (gameStats.hasStarted)
      distributeCards(cards, setCards)
        .then((cards) => console.log(cards))
        .catch((err) => console.log(err));
  }, [gameStats.hasStarted]);

  const bgmAudioRef = useRef(null);

  const handleTestAudio = () => {
    if (bgmAudioRef.current) {
      bgmAudioRef.current.currentTime = 0;
      bgmAudioRef.current.play();
    }
  };

  // useEffect(() => {
  //   console.log("CARDS UPDATED : ", cards);
  // }, [cards]);

  const handleStartGame = () => {
    if (bgmAudioRef.current) {
      bgmAudioRef.current.currentTime = 0;
      bgmAudioRef.current.play();
    }
    if (buttonRef.current) {
      buttonRef.current.currentTime = 0;
      buttonRef.current.play();
    }

    setGameStats((prevGameStats) => ({
      ...prevGameStats,
      hasStarted: true,
    }));
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  // const checkIsInValidMove = (cardNumber, rowNumber, temp) => {
  //   let row = temp.filter((card) => card.rowNumber === Number(rowNumber));
  //   return row.some((card) => card.cardNumber > cardNumber);
  // };

  const checkAllRowsGreaterThanPlayerCard = (cardNumber, temp) => {
    let row1 = temp.filter((card) => card.rowNumber === 1);
    let row2 = temp.filter((card) => card.rowNumber === 2);
    let row3 = temp.filter((card) => card.rowNumber === 3);
    let row4 = temp.filter((card) => card.rowNumber === 4);

    let res = true;

    if (row1.some((card) => card.cardNumber > cardNumber)) {
    } else {
      res = false;
    }
    if (row2.some((card) => card.cardNumber > cardNumber)) {
    } else {
      res = false;
    }

    if (row3.some((card) => card.cardNumber > cardNumber)) {
    } else {
      res = false;
    }

    if (row4.some((card) => card.cardNumber > cardNumber)) {
    } else {
      res = false;
    }

    // console.log("CARD NUMBER : ", cardNumber);
    // console.log(row1);
    // console.log(row2);
    // console.log(row3);
    // console.log(row4);
    return res;
  };

  const handleFullRow = (temp, rowNumber) => {
    // cnosole.log("INSIDE handle 6 card full row function");
    temp = temp.map((card) => {
      if (card.rowNumber === rowNumber) {
        card.rowNumber = 0;
        card.isInBullHeadStack = true;
        let tempGameStats = gameStats;
        tempGameStats.playerScore += getBullHead(card.cardNumber);
        if (tempGameStats.round === 1)
          tempGameStats.r1playerScore += getBullHead(card.cardNumber);
        else if (tempGameStats.round === 2)
          tempGameStats.r2playerScore += getBullHead(card.cardNumber);
        else tempGameStats.r3playerScore += getBullHead(card.cardNumber);
        setGameStats(tempGameStats);
        return card;
      } else return card;
    });
  };

  const checkAndHandleFullRow = (temp) => {
    let r1 = temp.filter((card) => card.rowNumber === 1);
    let r2 = temp.filter((card) => card.rowNumber === 2);
    let r3 = temp.filter((card) => card.rowNumber === 3);
    let r4 = temp.filter((card) => card.rowNumber === 4);

    if (r1.length >= 6) handleFullRow(temp, 1);
    if (r2.length >= 6) handleFullRow(temp, 2);
    if (r3.length >= 6) handleFullRow(temp, 3);
    if (r4.length >= 6) handleFullRow(temp, 4);
    // console.log(r1);
    // console.log(r2);
    // console.log(r3);
    // console.log(r4);
    //
    // console.log("INSIDE check 6 cards function");

    return;
  };

  const updateScore = (cardNumber) => {
    let tempGameStats = gameStats;
    tempGameStats.playerScore += getBullHead(cardNumber);
    if (tempGameStats.round === 1)
      tempGameStats.r1playerScore += getBullHead(cardNumber);
    else if (tempGameStats.round === 2)
      tempGameStats.r2playerScore += getBullHead(cardNumber);
    else tempGameStats.r3playerScore += getBullHead(cardNumber);
    setGameStats(tempGameStats);
  };

  const checkRowFull = (temp, rowNumber) => {
    let cnt = 0;
    temp.map((card) => (card.rowNumber === rowNumber ? cnt++ : {}));
    if (cnt >= 5) return true;
  };

  const handleRowFilledByPlayer = (temp, rowNumber) => {
    temp = temp.map((card) => {
      if (card.rowNumber === rowNumber) {
        card.rowNumber = 5;
        card.isInBullHeadStack = true;
        updateScore(card.cardNumber);
        return card;
      } else return card;
    });
    console.log(temp);
  };

  const redistributionPossible = (cards) => {
    let remainingCards = 0;
    cards.map((card) => {
      if (card.rowNumber === 6) remainingCards++;
    });
    console.log("INSIDE REDISTRIBUTION CHECK");
    console.log(remainingCards);
    return remainingCards >= 20;
  };

  const handleRedistribution = async () => {
    let playerRemainingCards = 0;
    cards.map((card) => {
      if (card.rowNumber === 5 && !card.isInBullHeadStack)
        playerRemainingCards++;
    });

    if (playerRemainingCards === 0) {
      let tempStats = gameStats;
      tempStats.round++;
      setGameStats(tempStats);
      // distributeCards(cards, setCards);
      if (redistributionPossible(cards)) {
        console.log("yes redistributionPossible");
        redistributeCards(cards, setCards);
      } else {
        // MoveToNextRound();
      }
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;
    if (!gameStats.playerTurn) return;

    // console.log("ACTIVE ID : ", active.id);
    // console.log("OVER ID : ", over.id);

    for (let row = 1; row <= 4; row++) {
      if (over.id === `${row}`) {
        // Select the row in which the card is dropped
        let temp = [...cards];

        let ChosenCard = Number(active.id);
        let ChosenRow = Number(over.id);

        for (let i = 0; i < 104; i++) {
          if (temp[i].cardNumber === Number(active.id)) {
            // Select the Card that was dragged

            //NOTE: Check the following :
            //    i)   Check for all Row's last card greater than player's Max Card.
            //    ii)  Check for Invalid Move.
            //    iii) Check the player's now placed card is the 6th card.
            //    iv)  Normal Move.
            //
            //NOTE: Triggers to be called after every move :
            //    if redistribution possible :
            //          Handle Redistribution
            //    else if Next Round :
            //          Handle Next Round
            //
            //NOTE: Flow :
            //      Place Card -> Validate Move -> Send Request to Backend -> Next Round / Next Distribution.

            // // check all the rows are greater than player cards.
            // if (checkAllRowsGreaterThanPlayerCard(playerMaxi, temp)) {
            //   console.log("INSIDE THE IF BLOCK");
            //   setIsRowMovedToBullHead(true);
            //   temp = temp.map((card) => {
            //     if (card.rowNumber === Number(over.id)) {
            //       card.rowNumber = 5;
            //       card.isInBullHeadStack = true;
            //       card.isFlipped = true;
            //       let tempGameStats = gameStats;
            //       tempGameStats.playerScore += getBullHead(card.cardNumber);
            //       if (tempGameStats.round === 1)
            //         tempGameStats.r1playerScore += getBullHead(card.cardNumber);
            //       else if (tempGameStats.round === 2)
            //         tempGameStats.r2playerScore += getBullHead(card.cardNumber);
            //       else
            //         tempGameStats.r3playerScore += getBullHead(card.cardNumber);
            //       setGameStats(tempGameStats);
            //       console.log("ROUND  : ", gameStats.round);
            //       return card;
            //     } else return card;
            //   });
            //   temp[i].rowNumber = Number(over.id);
            //   setTimeout(() => {
            //     setIsRowMovedToBullHead(false);
            //   }, 1500);
            // }

            if (checkPlayerMaxiLessThanRows(cards)) {
              await handlePayerMaxiLessThanRows(
                cards,
                setCards,
                ChosenCard,
                ChosenRow,
                isRowMovedToBullHead,
                setIsRowMovedToBullHead,
              )
                .then(() => console.log("HI"))
                .catch(() => console.log("nope"));
            }

            // check is invalid move
            // else if (checkIsInValidMove(temp[i].cardNumber, over.id, temp)) {
            //   console.log("INSIDE THE WRONG IF BLOCK");
            //   setIsInValidMove(true);
            //   setTimeout(() => {
            //     setIsInValidMove(false);
            //     //NOTE : Add error audio here.
            //   }, 1500);
            //   return;
            // }
            else if (checkIsInValidMove(cards, ChosenCard, ChosenRow)) {
              await handleInvalidMove(isInValidMove, setIsInValidMove);
              return;
            }

            // check row is filled by player
            // else if (checkRowFull(temp, Number(over.id))) {
            //   console.log("ROW FULL!");
            //
            //   handleRowFilledByPlayer(temp, Number(over.id));
            //   temp[i].rowNumber = 5;
            //   temp[i].isInBullHeadStack = true;
            //   await delay(1000);
            // }
            else if (checkPlayerPlacedSixthCard(cards, setCards, ChosenRow)) {
              await handlePlayerPlacedSixthCard(
                cards,
                setCards,
                ChosenRow,
                ChosenCard,
                isSixthCardMovedToBullHead,
                setIsSixthCardMovedToBullHead,
              );
            }

            //normal move
            else {
              let temp = [...cards];

              temp = temp.map((card) => {
                if (card.cardNumber === ChosenCard) {
                  card.rowNumber = ChosenRow;
                }
                return card;
              });

              setCards(temp);
            }
          }
        }

        handleDropAudioRef(dropCardAudioRef);

        // assume if a row is full then the player is the one who made the last move , since the ai's full row cards is handled in the backend.
        // checkAndHandleFullRow(temp);

        // setCards(temp);

        // setTimeout(() => {
        //   setGameStats((prev) => ({
        //     ...prev,
        //     playerTurn: false,
        //   }));
        // }, 500);
        //
        // setTimeout(() => {
        //   setGameStats((prev) => ({
        //     ...prev,
        //     playerTurn: true,
        //   }));
        //
        //   return;
        // }, 1500);

        // await displayAIThinkingAnimation(gameStats, setGameStats)
        //   .then(() => console.log("Displaying AI Thinking Animation"))
        //   .then(() =>
        //     checkPlayerPlacedSixthCard(cards, setCards).then(() =>
        //       sendRequestToAi(cards, setCards, gameStats, setGameStats),
        //     ),
        //   )
        //   .catch(() => console.log("Error Displaying AI thinking Animation"));

        // setTimeout(() => {
        //   sendRequestToAi(temp, setCards, gameStats, setGameStats).then(() => {
        //     delay(1000);
        //     console.log("THEN BLOCK");
        //     handleRedistribution();
        //   });
        // }, 1500);
        // console.log("SENDING REQ TO AI");

        // await delay(1500);

        // const sendReqToAIPromise = new Promise((resolve, reject) => {
        //   delay(1500).then(() => {
        //     sendRequestToAi(temp, setCards, gameStats, setGameStats)
        //       .then(() => {
        //         resolve();
        //       })
        //       .catch(reject);
        //   });
        // })
        //   .then(() => {
        //     delay(2500).then(() => {
        //       console.log("THEN BLOCK");
        //       handleRedistribution();
        //     });
        //   })
        //   .catch((err) => {
        //     console.log("Error in sending req to AI: ", err);
        //   });
        //
        // await sendReqToAIPromise;

        // setTimeout(() => {
        //   sendRequestToAi(temp, setCards, gameStats, setGameStats);
        // }, 1500);

        // await sendRequestToAi(cards, setCards, gameStats, setGameStats)
        //   .then(() => console.log("Sent Requst to AI"))
        //   .catch(() => console.log("Error sending request to AI"));

        // setTimeout(() => {
        //   handleRedistribution();
        // }, 2500);

        //NOTE: Flow : AI Animation -> Request -> Redistribution.

        // await displayAIThinkingAnimation(gameStats, setGameStats);
        await delay(1000);
        await sendRequestToAi(cards, setCards, gameStats, setGameStats);

        break;
      }
    }
  };

  const dropCardAudioRef = useRef(null);

  const handleDropAudioRef = (event) => {
    if (event.current) {
      event.current.currentTime = 0;
      event.current.play();
    }
  };

  const [isRoundOver, setIsRoundOver] = useState(false);
  let win = false;

  return (
    <>
      {isInValidMove ? <InValidMove /> : null}
      {isRowMovedToBullHead ? <MoveRowToBullHead /> : null}
      {isSixthCardMovedToBullHead ? <SixthCardMovedToBullHead /> : null}
      {isRoundOver ? (
        <RoundOver
          win={win}
          isRoundOver={isRoundOver}
          setIsRoundOver={setIsRoundOver}
        />
      ) : null}
      <audio ref={bgmAudioRef} src="/sound/music1.ogg" preload="auto" loop />
      {!gameStats.hasStarted ? (
        <GameStartBox
          handleTestAudio={handleTestAudio}
          handleStartGame={handleStartGame}
        />
      ) : (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <audio src="/sound/thud.ogg" ref={buttonRef} />
          <audio src="/sound/slice1.ogg" ref={dropCardAudioRef} />
          <DragOverlay></DragOverlay>
          <div className="grid grid-rows-12 h-screen w-screen">
            <div className="row-span-2 z-100 ">
              <EnemyHand
                cards={cards}
                setCards={setCards}
                gameStats={gameStats}
                setGameStats={setGameStats}
              />
            </div>
            <div className="row-span-8">
              <Arena
                cards={cards}
                setCards={setCards}
                gameStats={gameStats}
                setGameStats={setGameStats}
              />
            </div>
            <div className="row-span-2 ">
              <PlayerHand
                cards={cards}
                setCards={setCards}
                gameStats={gameStats}
                setGameStats={setGameStats}
              />
            </div>
          </div>
        </DndContext>
      )}
    </>
  );
};

export default GameBoard;

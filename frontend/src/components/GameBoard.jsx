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
  checkRedistribution,
  handleRedistribution,
  checkNextRound,
  handleNextRound,
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

  const [isRoundOver, setIsRoundOver] = useState(false);
  const [isRoundWin, setIsRoundWin] = useState(false);

  const gameStatsRef = useRef(gameStats);
  const cardsRef = useRef(cards);

  useEffect(() => {
    gameStatsRef.current = gameStats;
  }, [gameStats]);

  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);

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

            // Check for special case condition , when all rows have maximum cardNumber than Player's Max Card .

            if (checkPlayerMaxiLessThanRows(cards)) {
              await handlePayerMaxiLessThanRows(
                cardsRef.current,
                setCards,
                ChosenCard,
                ChosenRow,
                isRowMovedToBullHead,
                setIsRowMovedToBullHead,
                gameStats,
                setGameStats,
              );
            }

            // Invalid Move by the player .
            else if (checkIsInValidMove(cards, ChosenCard, ChosenRow)) {
              await handleInvalidMove(isInValidMove, setIsInValidMove);
              return;
            }

            // Player places the card as the 6th one in a row .
            else if (checkPlayerPlacedSixthCard(cards, setCards, ChosenRow)) {
              await handlePlayerPlacedSixthCard(
                cardsRef.current,
                setCards,
                ChosenRow,
                ChosenCard,
                isSixthCardMovedToBullHead,
                setIsSixthCardMovedToBullHead,
                gameStats,
                setGameStats,
              );
            }

            //normal move .
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

        await delay(1000);
        // console.log("Before req : ", gameStats.playerScore);
        await sendRequestToAi(
          cardsRef.current,
          setCards,
          gameStatsRef.current,
          setGameStats,
        );

        // Redistribution

        if (checkRedistribution(cardsRef.current)) {
          await handleRedistribution(
            cardsRef.current,
            setCards,
            gameStats,
            setGameStats,
          );
        }

        // New Round .
        else if (checkNextRound(cards)) {
          await handleNextRound(
            cardsRef.current,
            setCards,
            gameStatsRef.current,
            setGameStats,
            setIsRoundOver,
            setIsRoundWin,
          );
        }

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

  return (
    <>
      {isInValidMove ? <InValidMove /> : null}
      {isRowMovedToBullHead ? <MoveRowToBullHead /> : null}
      {isSixthCardMovedToBullHead ? <SixthCardMovedToBullHead /> : null}
      {isRoundOver ? (
        <RoundOver
          win={isRoundWin}
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

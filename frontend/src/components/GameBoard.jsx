import React, { useEffect } from "react";
import PlayerHand from "./PlayerHand";
import EnemyHand from "./EnemyHand";
import Arena from "./Arena";
import { createCard, distributeCards, sendRequestToAi } from "../lib/utils.js";
import { useState, useRef } from "react";
import GameStartBox from "./GameStartBox.jsx";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import InValidMove from "./InValidMove.jsx";
import MoveRowToBullHead from "./MoveRowToBullHead.jsx";

const GameBoard = () => {
  const [cards, setCards] = useState([]);
  const [gameStats, setGameStats] = useState({
    hasStarted: false,
    playerTurn: true,
    hasEnded: false,
    playerScore: 0,
    aiScore: 0,
    playerWon: false,
    aiWon: false,
    // isDealingCard: true,
    aiAlgo: 0, // by default = 0 --> ExpectiMiniMax Algo , 1 --> Monte Carlo Tree Search .
  });

  const buttonRef = useRef(null);
  const [activeId, setActiveId] = useState(null);

  const [isInValidMove, setIsInValidMove] = useState(false);
  const [isRowMovedToBullHead, setIsRowMovedToBullHead] = useState(false);

  useEffect(() => {
    if (gameStats.hasStarted)
      // setTimeout(() => {
      distributeCards(cards, setCards);
    setGameStats((prev) => ({
      ...prev,
      // isDealingCard: false,
    }));
    // }, 1500);
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

  const checkIsInValidMove = (cardNumber, rowNumber, temp) => {
    let row = temp.filter((card) => card.rowNumber === Number(rowNumber));
    return row.some((card) => card.cardNumber > cardNumber);
  };

  const checkAllRowsLessThanPlayerCard = (cardNumber, temp) => {
    let row1 = temp.filter((card) => card.rowNumber === 1);
    let row2 = temp.filter((card) => card.rowNumber === 2);
    let row3 = temp.filter((card) => card.rowNumber === 3);
    let row4 = temp.filter((card) => card.rowNumber === 4);

    if (row1.some((card) => card.cardNumber < cardNumber)) return false;
    if (row2.some((card) => card.cardNumber < cardNumber)) return false;
    if (row3.some((card) => card.cardNumber < cardNumber)) return false;
    if (row4.some((card) => card.cardNumber < cardNumber)) return false;

    return true;
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;
    if (!gameStats.playerTurn) return;

    // console.log("ACTIVE ID : ", active.id);
    // console.log("OVER ID : ", over.id);

    for (let row = 1; row <= 4; row++) {
      if (over.id === `${row}`) {
        let temp = [...cards];

        for (let i = 0; i < 104; i++) {
          if (temp[i].cardNumber === Number(active.id)) {
            let playerMaxi = 0;
            temp.map((card) => {
              if (card.rowNumber === 5)
                playerMaxi = Math.max(playerMaxi, card.cardNumber);
            });
            if (checkAllRowsLessThanPlayerCard(playerMaxi, temp)) {
              temp = temp.map((card) => {
                if (card.rowNumber === Number(over.id)) {
                  card.rowNumber = 5;
                  card.isInBullHeadStack = true;
                  card.isFlipped = true;
                  return card;
                } else return card;
              });
              temp[i].rowNumber = Number(over.id);
              setIsRowMovedToBullHead(true);
              setTimeout(() => {
                setIsRowMovedToBullHead(false);
              }, 1500);
            } else if (checkIsInValidMove(temp[i].cardNumber, over.id, temp)) {
              setIsInValidMove(true);
              setTimeout(() => {
                setIsInValidMove(false);
                //NOTE : Add error audio here.
              }, 1500);
            } else {
              temp[i].rowNumber = over.id;
            }
          }
        }

        handleDropAudioRef(dropCardAudioRef);

        setGameStats((prev) => ({
          ...prev,
          playerTurn: false,
        }));

        setCards(temp);

        setTimeout(() => {
          setGameStats((prev) => ({
            ...prev,
            playerTurn: true,
          }));
        }, 1000);

        await sendRequestToAi(temp, setCards, gameStats, setGameStats);
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

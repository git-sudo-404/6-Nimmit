import React, { useEffect } from "react";
import PlayerHand from "./PlayerHand";
import EnemyHand from "./EnemyHand";
import Arena from "./Arena";
import { createCard, distributeCards, sendRequestToAi } from "../lib/utils.js";
import { useState, useRef } from "react";
import GameStartBox from "./GameStartBox.jsx";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import InValidMove from "./InValidMove.jsx";

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

  const checkIsInValidMove = (cardNumber, rowNumber) => {
    let row = cards.filter((card) => card.rowNumber === rowNumber);

    row.map((card) => {
      if (card.cardNumber > cardNumber) {
        return true;
      }
    });

    return false;
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
            if (checkIsInValidMove(temp[i].cardNumber, over.id)) {
              setIsInValidMove(true);

              setTimeout(() => {
                setIsInValidMove(false);
                //NOTE : Add error audio here.
              }, 1000);
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

  return (
    <>
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
          {isInValidMove ? <InValidMove /> : null}
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

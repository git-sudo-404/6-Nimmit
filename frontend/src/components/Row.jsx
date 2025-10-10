import React, { useRef, useEffect } from "react";
import Card from "./Card.jsx";
import { useDroppable } from "@dnd-kit/core";
import RowCardHolder from "./RowCardHolder.jsx";

const Row = ({ row, cards, gameStats, setGameStats }) => {
  const emptyColsHolder = [0, 1, 2, 3, 4, 5];

  let currentRowCards = cards.filter((card) => card.rowNumber === row);

  currentRowCards.sort((cardA, cardB) => cardA.cardNumber - cardB.cardNumber);

  let emptyCardsLength = 6 - currentRowCards.length;

  const emptyRowCards = Array.from({ length: emptyCardsLength });

  const { isOver, setNodeRef } = useDroppable({
    id: `${row}`,
  });

  const style = {
    transform: isOver ? "scale(1.10)" : "scale(1.04)",
  };

  const cardOverAudioRef = useRef(null);

  useEffect(() => {
    if (isOver && cardOverAudioRef.current)
      handleCardOverAudioRef(cardOverAudioRef);
  }, [isOver]);

  const handleCardOverAudioRef = (event) => {
    if (event.current) {
      event.current.currentTime = 0;
      event.current.play();
    }
  };

  currentRowCards.map((card) => (card.isFlipped = false));

  return (
    <div
      style={style}
      className=" bg-black/10  rounded-xl border border-white/01 backdrop-blur-xs shadow-lg w-full h-96/100 my-auto  "
      ref={setNodeRef}
    >
      <audio className="hidden" src="/sound/foil2.ogg" ref={cardOverAudioRef} />
      <div className="col-span-6 w-100/100 h-100/100 grid grid-cols-6 gap-7 p-2 hover:bg-white/10  ">
        {currentRowCards.map((card, idx) => (
          <Card
            key={card.cardNumber}
            card={card}
            gameStats={gameStats}
            setGameStats={setGameStats}
          />
        ))}
        {emptyRowCards.map((_, idx) => (
          <RowCardHolder key={idx} />
        ))}
      </div>
    </div>
  );
};

export default Row;

import React, { useRef, useState, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";

const Card = ({ card, gameStats, setGameStats }) => {
  if (card.cardNumber === undefined) {
    return;
  }

  const audioRef = useRef(null);

  const playsound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  const Draggable = card.rowNumber === 5; // 1 if in playerHande , 0 if in AI/EnemyHand .

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `${card.cardNumber}`,
    disabled: !Draggable,
  });

  const style = transform
    ? {
      transform: CSS.Translate.toString(transform),
      zIndex: 100, // Make sure the dragged card is on top
    }
    : undefined; // No transform when not dragging

  const [isAnimating, setIsAnimating] = useState(false);

  // This effect runs whenever the card's position changes
  useEffect(() => {
    // Check if the card's position is a new position on the board
    // and if it was just dropped
    if (card.rowNumber >= 1 && card.rowNumber <= 4) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 500); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [card.rowNumber]); // Rerun this effect when the rowNumber changes

  const [isDealing, setIsDealing] = useState(false);
  useEffect(() => {
    if (!card.isInDrawPile && (card.rowNumber === 5 || card.rowNumber === 0)) {
      setIsDealing(true);

      const timer = setTimeout(() => {
        setIsDealing(false);
        playsound();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [card.isInDrawPile, card.rowNumber]);

  const className = `w-full h-full 
  ${isAnimating ? "animate-fly-in" : ""} 
  ${isDealing ? "animate-deal-card" : ""}`;

  return (
    <div
      className={className}
      onMouseEnter={playsound}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
    >
      <div className="w-full h-full  backdrop-blur-lg bg-white/10 border border-black border-dashed rounded-xl  p-1">
        <audio ref={audioRef} prefoad="auto" className="hidden" id="CardHove">
          <source src="/sound/thud.ogg" type="audio/ogg" />
        </audio>
        {!card.isFlipped ? (
          <img
            src={`/cards_1/${card.cardNumber}.png`}
            className="w-full h-full object-fit"
          />
        ) : (
          <img
            src={`/cards_1/0.png`}
            className="w-full h-full object-fit rounded-xl"
          />
        )}
      </div>
    </div>
  );
};

export default Card;

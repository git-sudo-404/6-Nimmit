import React from "react";
import Card from "./Card";
import Scores from "./Scores";

const DrawPile = ({ cards, setCards, gameStats, setGameStats }) => {
  return (
    <>
      <div className="w-full h-70/100 backdrop-blur-3xl rounded-3xl flex justify-between items-start gap-2 p-2 pt-5">
        <Scores gameStats={gameStats} />
      </div>
    </>
  );
};

export default DrawPile;

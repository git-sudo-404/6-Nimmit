import React from "react";
import Card from "./Card";
import Scores from "./Scores";

const DrawPile = ({ cards, setCards, gameStats, setGameStats }) => {
  return (
    <>
      <div className="w-full h-60/100 backdrop-blur-3xl rounded-3xl flex flex-col  items-start gap-2 p-2 pt-5">
        <Scores gameStats={gameStats} />
        <Scores gameStats={gameStats} />
        <Scores gameStats={gameStats} />
        <div className="w-full h-30/100  rounded-2xl grid grid-cols-2 gap-2 mt-1">
          <div className="col-span-1 bg-white/10 rounded-2xl w-full h-full"></div>
          <div className="col-span-1 bg-white/10 rounded-2xl w-full h-full"></div>
        </div>
      </div>
    </>
  );
};

export default DrawPile;

import React from "react";
import Card from "./Card";
import Scores from "./Scores";

const DrawPile = ({ cards, setCards, gameStats, setGameStats }) => {
  return (
    <>
      <div className="w-full h-60/100 backdrop-blur-3xl rounded-3xl flex flex-col  items-start gap-2 p-3  ">
        <Scores
          playerScore={gameStats.r1playerScore}
          aiScore={gameStats.r1aiScore}
          lcolor={0}
          rcolor={1}
          round={1}
        />
        <Scores
          playerScore={gameStats.r1playerScore}
          aiScore={gameStats.r1aiScore}
          lcolor={1}
          rcolor={0}
          round={2}
        />
        <Scores
          playerScore={gameStats.r1playerScore}
          aiScore={gameStats.r1aiScore}
          lcolor={0}
          rcolor={1}
          round={3}
        />
        <div className="w-full h-30/100  rounded-2xl grid grid-cols-2 gap-2 mt-1">
          <div className="col-span-1 bg-black rounded-2xl w-full h-full flex justify-center items-center">
            <p className="font-bold pixel-font text-5xl">
              {gameStats.playerScore}
            </p>
          </div>
          <div className="col-span-1 bg-white pixel-font text-5xl text-black flex justify-center items-center rounded-2xl w-full h-full ">
            <p>{gameStats.aiScore}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default DrawPile;

import React from "react";
import DrawPile from "./DrawPile";
import Rows from "./Rows";
import AlgoSelector from "./AlgoSelector";
import LoadingSpinner from "./Loading";

const Arena = ({ cards, setCards, gameStats, setGameStats }) => {
  return (
    <>
      <div className="col-span-12  grid grid-cols-11 h-full w-full rounded-xl  shadow-black gap-12 px-12 pb-2 mt-1 ">
        <div className="col-span-3  bg-black/02 rounded-l-xl shadow-black/30 flex items-center justify-center">
          <DrawPile
            cards={cards}
            setCards={setCards}
            gameStats={gameStats}
            setGameStats={setGameStats}
          />
        </div>
        <div className="col-span-6 bg-black/01  rounded-r-xl shadow-black/10 flex flex-col justify-evenly ">
          <Rows
            cards={cards}
            gameStats={gameStats}
            setGameStats={setGameStats}
          />
        </div>
        <div className="col-span-2 w-full h-full ">
          <AlgoSelector />
        </div>
      </div>
      {!gameStats.playerTurn ? (
        <div className="absolute w-150 h-100 top-70 left-110 backdrop-blur-3xl rounded-4xl  flex justify-center items-center shadow-lg ">
          <div className=" grid-rows-2 gap-2">
            <LoadingSpinner className="row-span-1" />
            <div className="row-span-1">Ai is thinking...</div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Arena;

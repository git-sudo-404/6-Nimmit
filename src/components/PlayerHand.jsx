import React from "react";
import Card from "./Card";

const PlayerHand = ({ cards, setCards, gameStats, setGameStats }) => {
  const emptyCardHolder = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  let playerCards = cards.filter((card) => card.rowNumber === 5);

  playerCards.sort((a, b) => a.cardNumber - b.cardNumber);

  let bullHeadStack = playerCards.filter((card) => card.isFlipped === true);

  return (
    <>
      <div className=" mt-2.5 bg-black/01 p-1 px-1.5 grid grid-cols-12 gap-1 ml-2.5 mt-0.5 h-19/20 w-69/70 backdrop-blur-lg  justify-center items-center rounded-xl   shadow-lg shadow-black/30  ">
        <div className="  span-col-1 w-full h-full  rounded-2xl hover:animate-pulse p-1">
          {bullHeadStack.length ? (
            <Card card={bullHeadStack[0]} />
          ) : (
            <div className="w-full h-full rounded-xl border-2 border-black border-dashed  "></div>
          )}
        </div>
        <div className="hover:animate-bounce col-span-1 w-full h-full rounded-2xl  text-2xl font-mono flex justify-center items-center hover:bg-white/30 hover:border-green-500 hover:text-green-500 hover:text-4xl transition-all "></div>
        <div className="col-span-10 w-full h-full grid grid-cols-10 gap-3">
          {emptyCardHolder.map((ind) =>
            playerCards[ind] ? (
              <div
                key={ind}
                className="col-span-1 w-85/100 h-99/100 hover:scale-150 "
              >
                <Card card={playerCards[ind]} />
              </div>
            ) : (
              <div
                key={ind}
                className="border w-full h-full border-black border-dashed rounded-xl "
              ></div>
            ),
          )}
        </div>
      </div>
    </>
  );
};

export default PlayerHand;

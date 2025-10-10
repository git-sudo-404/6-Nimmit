import React from "react";
import Card from "./Card";

const EnemyHand = ({ cards, setCards, gameStats, setGameStats }) => {
  const emptyCardHolder = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  let playerCards = cards.filter((card) => card.rowNumber === 0);

  playerCards.sort((a, b) => a.cardNumber - b.cardNumber);

  playerCards.map((card) => (card.isFlipped = true));

  let bullHeadStack = playerCards.filter((card) => card.rowNumber === 0);

  let enemycards = playerCards.filter(
    (card) => card.rowNumber === 0 && !card.isInBullHeadStack,
  );

  return (
    <>
      <div className="mt-2  bg-black/01 p-1 px-1.5 grid grid-cols-12 gap-1 ml-2.5 mt-0.5 h-19/20 w-69/70 backdrop-blur-sm  justify-center items-center rounded-xl  border-black/20 border-2 shadow-lg shadow-black/30  ">
        <div className="  span-col-1 w-full h-full rounded-2xl hover:animate-pulse">
          <div className="w-85/100 h-100/100 rounded-xl  border-dashed  ">
            {bullHeadStack[0] ? <Card card={bullHeadStack[0]} /> : null}
          </div>
        </div>
        <div className="hover:animate-bounce col-span-1 w-full h-full rounded-2xl   text-2xl font-mono flex justify-center items-center hover:bg-white/30 hover:border-red-500 hover:text-red-500 hover:text-4xl transition-all "></div>
        <div className="col-span-10 w-full h-full grid grid-cols-10 gap-3">
          {emptyCardHolder.map((ind) =>
            enemycards[ind] ? (
              <div
                key={ind}
                className="col-span-1 w-85/100 h-99/100 hover:scale-150 "
              >
                <Card
                  card={playerCards[ind]}
                  gameStats={gameStats}
                  setGameStats={setGameStats}
                />
              </div>
            ) : (
              <div
                key={ind}
                className="border w-full h-full border-white border-dashed rounded-xl hover:scale-125"
              ></div>
            ),
          )}
        </div>
      </div>
    </>
  );
};

export default EnemyHand;

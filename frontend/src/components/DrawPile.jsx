import React, { useRef } from "react";
import Card from "./Card";
import Scores from "./Scores";

const DrawPile = ({ cards, setCards, gameStats, setGameStats }) => {
  const hoverRef = useRef(null);

  const handleHoverSound = () => {
    if (hoverRef.current) {
      hoverRef.current.currentTime = 0;
      hoverRef.current.play();
    }
  };

  // console.log(gameStats.playerScore);

  return (
    <>
      <audio
        src="/sound/foil2.ogg"
        ref={hoverRef}
        className="hidden"
        type="audio/ogg"
      />
      <div className="w-full h-60/100 backdrop-blur-3xl rounded-3xl flex flex-col  items-start gap-2 p-3  ">
        <Scores
          playerScore={gameStats.r1playerScore}
          aiScore={gameStats.r1aiScore}
          lcolor={0}
          rcolor={1}
          round={1}
          handleHoverSound={handleHoverSound}
        />
        <Scores
          playerScore={gameStats.r2playerScore}
          aiScore={gameStats.r2aiScore}
          lcolor={1}
          rcolor={0}
          round={2}
          handleHoverSound={handleHoverSound}
        />
        <Scores
          playerScore={gameStats.r3playerScore}
          aiScore={gameStats.r3aiScore}
          lcolor={0}
          rcolor={1}
          round={3}
          handleHoverSound={handleHoverSound}
        />
        <div className="w-full h-30/100  rounded-2xl grid grid-cols-2 gap-2 mt-1">
          <div
            className="hover:scale-110 transition-all duration-50 col-span-1 bg-black/40 rounded-2xl w-full h-full flex justify-center items-center hover:bg-black"
            onMouseEnter={() => handleHoverSound()}
          >
            <p className="font-bold pixel-font text-4xl">
              {gameStats.playerScore}
            </p>
          </div>
          <div
            className="hover:scale-110 transition-all duration-50 col-span-1 bg-white/40 hover:bg-white pixel-font text-4xl text-black flex justify-center items-center rounded-2xl w-full h-full "
            onMouseEnter={() => handleHoverSound()}
          >
            <p>{gameStats.aiScore}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default DrawPile;

import React from "react";
const Scores = ({
  playerScore,
  aiScore,
  lcolor,
  rcolor,
  round,
  handleHoverSound,
}) => {
  // console.log("playerScore : ", playerScore);
  return (
    <>
      <div className="w-full h-20/100 rounded-xl">
        <div
          className="w-full h-full rounded-xl bg-black/10  grid grid-rows-3 hover:scale-110 transition-all duration-75 "
          onMouseEnter={() => handleHoverSound()}
        >
          <div className=" row-span-1 w-full h-full doto-font flex justify-center items-center">
            <p>Round {round}</p>
          </div>
          <div className=" score-font text-4xl row-span-2 w-full h-full doto-font grid grid-cols-2 gap-1">
            <div className=" col-span-1 w-full h-full bg-red flex justify-center items-center">
              <p>{playerScore}</p>
            </div>
            <div className="col-span-1 w-full h-full flex justify-center items-center">
              <p>{aiScore}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Scores;

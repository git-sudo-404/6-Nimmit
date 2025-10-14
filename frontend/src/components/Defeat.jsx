import React, { useState, useEffect, useRef } from "react";

const Defeat = ({ isRoundOver, setIsRoundOver }) => {
  const [size, setSize] = useState(100);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSize((prevSize) => {
        if (prevSize <= 50) {
          clearInterval(intervalId);
          return 50;
        }
        return prevSize - 1;
      });
    }, 20);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const handleButtonClick = () => {
    setIsRoundOver(false);
  };

  return (
    <>
      <div className="w-full h-full absolute flex z-[2000] justify-center items-center p-auto flex-col gap-1 ">
        <div
          className="absolute backdrop-blur-3xl  rounded-2xl transition-all duration-50   py-10  px-0 border-1 shadow-lg border-black border-dashed"
          style={{ width: `${size}%`, height: `${size}%` }}
        >
          <img
            src="/cards_1/defeat.png"
            className="w-full h-full  object-contain scale-140"
            alt="Defeat"
          />
        </div>
        {size <= 50 ? (
          <button
            className="bg-black/30 relative top-65  z-[2009] hover:bg-black/90 transition-all duration-100 border-white border-dashed w-40 h-12 border  rounded-xl doto-font"
            onClick={() => handleButtonClick()}
          >
            Next Round
          </button>
        ) : null}
      </div>
    </>
  );
};

export default Defeat;

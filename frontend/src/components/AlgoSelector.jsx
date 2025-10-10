import React, { useRef } from "react";

// import { LiaUndoAltSolid } from "react-icons/lia";
// import { LiaRedoAltSolid } from "react-icons/lia";
import { FaChevronLeft } from "react-icons/fa6";
import { FaChevronRight } from "react-icons/fa6";

const AlgoSelector = ({ gameStats, setGameStats }) => {
  const hoverRef = useRef(null);
  const clickRef = useRef(null);

  const handleHoverSound = () => {
    if (hoverRef.current) {
      hoverRef.current.currentTime = 0;
      hoverRef.current.play();
    }
  };

  const handleClickSound = () => {
    if (clickRef.current) {
      clickRef.current.currentTime = 0;
      clickRef.current.play();
    }
  };

  return (
    <div className="w-full h-full grid grid-rows-5 gap-1 pt-26">
      <audio
        src="/sound/foil2.ogg"
        ref={hoverRef}
        className="hidden"
        type="audio/ogg"
      />
      <audio
        src="sound/thud.ogg"
        ref={clickRef}
        className="hidden"
        type="audio/ogg"
      />
      <div className="row-span-3 grid grid-rows-5 gap-2 p-4 w-full h-full font-mono backdrop-blur-3xl rounded-3xl">
        <div className="row-span-1 border border-black border-dashed w-full h-full rounded-xl flex justify-center items-center bg-black/70  hover:bg-black hover:border-white hover:text-xl transition-all">
          Algorithm
        </div>
        <div className="row-span-2 w-full h-full border border-dashed rounded-2xl bg-blue-900/40 border-blue-900 flex items-center justify-center hover:bg-blue-900 hover:border-white hover:text-xl transition-all">
          <button
            onClick={() => {
              setGameStats((prev) => ({
                ...prev,
                aiAlgo: 1,
              }));
              handleClickSound();
            }}
            onMouseEnter={handleHoverSound}
          >
            Expectiminimax
          </button>
        </div>
        <div className="row-span-2 w-full h-full border border-dashed rounded-2xl bg-green-900/40 border-green-900 flex items-center justify-center  pl-5 hover:bg-green-900 hover:border-white hover:text-xl transition-all">
          <button
            onClick={() => {
              setGameStats((prev) => ({
                ...prev,
                aiAlgo: 2,
              }));
              handleClickSound();
            }}
            onMouseEnter={handleHoverSound}
          >
            MCTS (Monte-Carlo Tree Search)
          </button>
        </div>
        {/* <div className="row-span-2 w-full h-full border border-dashed rounded-2xl bg-yellow-900/40 border-yellow-900 flex items-center justify-center pl-5 hover:bg-yellow-900 hover:border-white hover:text-xl transition-all"> */}
        {/*   Reinforcement Learning */}
        {/* </div> */}
        {/* <div className="row-span-2 w-full h-full border border-dashed rounded-2xl bg-red-900/40 border-red-900 flex items-center justify-center hover:bg-red-900 hover:border-white hover:text-xl transition-all"> */}
        {/*   Neural Networks */}
        {/* </div> */}
      </div>
      <div className="row-span-2 grid w-full h-100/100 ">
        <div className="w-full h-50/100 grid-cols-2 gap-2 p-2 justify-center items-center flex backdrop-blur-3xl rounded-3xl px-2 py-2 gap-4">
          <div className="col-span-1 w-full h-full bg-white/10 rounded-3xl hover:bg-white/50">
            <button
              className="w-full h-full flex justify-center items-center "
              onClick={handleClickSound}
              onMouseEnter={handleHoverSound}
            >
              <FaChevronLeft className="size-15 text-black/10 hover:text-black/80" />
            </button>
          </div>
          <div className="col-span-1 w-full h-full bg-white/10 rounded-3xl hover:bg-white/50">
            <button
              className="w-full h-full flex justify-center items-center"
              onClick={handleClickSound}
              onMouseEnter={handleHoverSound}
            >
              <FaChevronRight className="size-15 text-black/10 hover:text-black/80 " />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlgoSelector;

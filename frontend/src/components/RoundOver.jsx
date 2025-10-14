import React, { useRef } from "react";
import Victory from "./Victory";
import Defeat from "./Defeat";

const RoundOver = ({ win, isRoundOver, setIsRoundOver }) => {
  const winAudioRef = useRef(null);
  const loseAudioRef = useRef(null);

  const handwinAudio = () => {
    if (winAudioRef.current) {
      winAudioRef.current.currentTime = 0;
      winAudioRef.current.play();
      console.log("Win Audio");
    }
  };

  const handleLoseAudio = () => {
    if (loseAudioRef.current) {
      loseAudioRef.current.currentTime = 0;
      loseAudioRef.current.play();
      console.log("Lose Audio");
    }
  };

  if (win) {
    handwinAudio();
  } else {
    handleLoseAudio();
  }

  return (
    <>
      <div className="w-full h-full">
        <audio ref={winAudioRef} src="/sound/win.ogg" className="hidden" />
        <audio ref={loseAudioRef} src="/sound/defeat.ogg" className="hidden" />
        {win ? (
          <Victory setIsRoundOver={setIsRoundOver} isRoundOver={isRoundOver} />
        ) : (
          <Defeat setIsRoundOver={setIsRoundOver} isRoundOver={isRoundOver} />
        )}
      </div>
    </>
  );
};

export default RoundOver;

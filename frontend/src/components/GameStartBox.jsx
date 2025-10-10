import React, { useRef } from "react";

const GameStartBox = ({ handleTestAudio, handleStartGame }) => {
  const startBoxAudioRef = useRef(null);

  const handleStartBoxAudioRef = () => {
    if (startBoxAudioRef.current) {
      startBoxAudioRef.current.currentTime = 0;
      startBoxAudioRef.current.play();
      console.log("GAMESTART");
    }
  };

  return (
    <div className="h-150 w-200 absolute top-40 left-80 backdrop-blur-2xl rounded-3xl z-[1000]">
      <div className="border p-2  border-black border-dashed rounded-2xl w-full h-full bg-black/10 font-blackOpsOne">
        <div className=" p-5 border grid grid-rows-8 gap-4 border-black border-dashed rounded-2xl w-full h-full bg-white/10  justify-center items-center font-blackOpsOne">
          <div className="h-full w-full gap-4  row-span-2 font-blackOpsOne ">
            <div
              className="h-full w-full border-black border rounded-xl border-dashed p-1 hover:scale-105 transform-all duration-150"
              onMouseEnter={handleStartBoxAudioRef}
            >
              <audio
                src="/sound/polychrome1.ogg"
                ref={startBoxAudioRef}
                className="hidden"
              />
              <div className="row-span-1 font-bold  transform-all duration-100 text-3xl w-full h-full border border-dashed border-black rounded-xl flex justify-center items-center text-black textfont-bold">
                <h1>Welcome to 6-Nimmt!</h1>
              </div>
            </div>
          </div>
          <div className="row-span-6 w-full h-full border border-black border-dashed rounded-xl p-1 overflow-scroll hover:scale-104 font-blackOpsOne">
            <div className="w-full h-full border border-black border-dashed rounded-xl overflow-scroll font-bold text-black p-7  max-h-150 font-blackOpsOne">
              <div
                onMouseEnter={handleStartBoxAudioRef}
                className="font-blackOpsOne"
              >
                <h2 className="text-3xl font-bold mb-4">
                  Game Rules: 6-Nimmt!
                </h2>
                <p className="text-lg mb-4">
                  The goal is to be the player with the{" "}
                  <strong className="font-blackOpsOne">fewest points</strong> at
                  the end of the game. Points are collected by taking card rows.
                  The game ends when a player reaches 66 points.
                </p>

                <h3 className="text-2xl font-semibold mt-6 mb-2">Setup</h3>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  <li className="font-blackOpsOne">
                    The game is for 2-10 players.
                  </li>
                  <li>The deck contains 104 cards, numbered 1 to 104.</li>
                  <li>
                    Each card has a specific number of{" "}
                    <strong className="font-blackOpsOne">bull heads</strong>
                    on it, which represent points:
                    <ul className="list-disc list-inside ml-6 mt-2">
                      <li>
                        Cards ending in{" "}
                        <strong className="font-blackOpsOne">
                          0, 1, 3, 4, 6, 8, or 9
                        </strong>{" "}
                        have <strong>1 bull head</strong>.
                      </li>
                      <li>
                        Cards ending in{" "}
                        <strong className="font-blackOpsOne">5</strong> have{" "}
                        <strong>2 bull heads</strong>.
                      </li>
                      <li>
                        Cards ending in{" "}
                        <strong className="font-blackOpsOne">0</strong> have{" "}
                        <strong>3 bull heads</strong>.
                      </li>
                      <li>
                        Cards that are multiples of{" "}
                        <strong className="font-blackOpsOne">11</strong> have{" "}
                        <strong>5 bull heads</strong>.
                      </li>
                      <li>
                        The card with the number{" "}
                        <strong className="font-blackOpsOne">55</strong> has{" "}
                        <strong>7 bull heads</strong>.
                      </li>
                    </ul>
                  </li>
                  <li className="font-blackOpsOne">
                    Each player is dealt a hand of 10 cards.
                  </li>
                  <li>
                    Four cards are placed face-up in a row to start the four
                    table rows.
                  </li>
                </ul>

                <h3 className="text-2xl font-semibold mt-6 mb-2">Gameplay</h3>
                <ol className="list-decimal list-inside space-y-2 mb-4">
                  <li>
                    <strong className="font-blackOpsOne">Play a card:</strong>{" "}
                    All players simultaneously choose one card from their hand
                    and place it face down.
                  </li>
                  <li>
                    <strong className="font-blackOpsOne">
                      Reveal and place:
                    </strong>{" "}
                    Everyone reveals their chosen card at the same time.
                    Starting with the lowest card number, each player places
                    their card in one of the four rows on the table.
                  </li>
                  <li>
                    <strong className="font-blackOpsOne">
                      The placement rules:
                    </strong>
                    <ul className="list-disc list-inside ml-6 mt-2">
                      <li>
                        A card must be placed in a row where the last card is
                        <strong className="font-blackOpsOne">lower</strong> than
                        the card being played.
                      </li>
                      <li>
                        The card must be placed in the row where the last card
                        is <strong>closest</strong> to the value of the card
                        being played.
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong className="font-blackOpsOne">Taking a row:</strong>
                    <ul className="list-disc list-inside ml-6 mt-2">
                      <li>
                        If you play a card that is{" "}
                        <strong className="font-blackOpsOne">lower</strong> than
                        the last card in all four rows, you must choose one row
                        to take. You take all the cards from that row into your
                        hand (these are now your points) and your played card{" "}
                        becomes the first card of that new row.
                      </li>
                      <li>
                        If you play the <strong>sixth card</strong> in a row,
                        you must take all five cards already in that row. Your
                        played card then becomes the first card of that new row.
                        The cards you collect are your points for the round.
                      </li>
                    </ul>
                  </li>
                </ol>

                <h3 className="text-2xl font-semibold mt-6 mb-2 font-blackOpsOne">
                  Scoring
                </h3>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  <li className="font-blackOpsOne">
                    Players keep track of the bull heads they collect.
                  </li>
                  <li>
                    After all 10 cards have been played, the round is over.{" "}
                  </li>
                  <li>
                    Players add up the bull heads on their collected cards.
                  </li>
                  <li>A new round begins with new cards being dealt.</li>
                </ul>

                <p className="text-lg mt-6">
                  The game ends immediately when a player reaches a total of{" "}
                  <strong className="font-blackOpsOne">
                    66 or more points
                  </strong>
                  . The player with the
                  <strong className="font-blackOpsOne">lowest score</strong> at
                  that time wins the game!
                </p>
              </div>
            </div>
          </div>

          {/* start button */}

          <div className="row-span-1 flex justify-center items-center">
            <div className="flex justify-center items-center">
              <div className="">
                <button
                  className=" relative mt-2 text-xl italic font-bold border animate-bounce hover:animate-none border-dashed text-black border-black rounded-xl p-3 shadow-xl shadow-black/40 hover:scale-125 transform-all duration-100 font-blackOpsOne "
                  onClick={handleStartGame}
                >
                  Start Game
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameStartBox;

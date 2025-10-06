import React from "react";
import Row from "./Row";

const Rows = ({ cards, gameStats, setGameStats }) => {
  const rows = [1, 2, 3, 4];

  return (
    <>
      <div className=" grid grid-rows-4 w-90/100 h-full m-auto rounded-xl gap-2 bg-black/01  ">
        {rows.map((row) => (
          <Row
            key={row}
            row={row}
            cards={cards}
            gameStats={gameStats}
            setGameStats={setGameStats}
          />
        ))}
      </div>
    </>
  );
};

export default Rows;

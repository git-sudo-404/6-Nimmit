import React from "react";

const RedistributingCards = () => {
  return (
    <>
      <div className="absolute h-100 w-150 z-[2000] top-70 left-105 shadow-2xl rounded-4xl backdrop-blur-3xl grid grid-rows-4 p-5">
        <div className="row-span-3 w-full h-full flex justify-center items-center">
          <img className=" size-80" src={`/cards_1/Redistributing.png`} />
        </div>
        {/* <div className="row-span-1 w-full h-full border-2 border-white/20 rounded-2xl border-dashed p-2 flex flex-col justify-center items-center"> */}
        {/*   <p className="text-md doto-font"> */}
        {/*     "If your card is placed as the 6th Card in a row, you */}
        {/*   </p> */}
        {/*   <p className="doto-font text-md"> */}
        {/*     must take the entire row into your Bullhead Stack" */}
        {/*   </p> */}
        {/* </div> */}
      </div>
    </>
  );
};

export default RedistributingCards;

import React from "react";

import { BiSolidError } from "react-icons/bi";
const InValidMove = () => {
  return (
    <div className="absolute  h-100 w-150 top-60 left-110 rounded-3xl backdrop-blur-3xl  z-[2000] flex justify-center items-center ">
      <div className="w-full h-full flex flex-col gap-1 justify-center items-center p-10 ">
        <BiSolidError size="200" color="white" className="opacity-40" />
        <p className=" text-4xl doto-font bold text-black ">Invalid Move</p>
        <div className="border border-dashed border-white rounded-2xl w-full h-30/100 p-4">
          <pre className="doto-font text ml-6">
            "The Card that is being should be the greatest
          </pre>
          <pre className="doto-font text ml-20">
            among all the cards of that row"
          </pre>
        </div>
      </div>
    </div>
  );
};

export default InValidMove;

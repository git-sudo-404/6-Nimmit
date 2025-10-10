import React from "react";

import { BiSolidError } from "react-icons/bi";
const InValidMove = () => {
  return (
    <div className="absolute h-100 w-150 top-60 left-110 rounded-3xl backdrop-blur-3xl z-[2000] flex justify-center items-center ">
      <div className="w-full h-full flex flex-col gap-1 justify-center items-center">
        <BiSolidError size="200" color="red" className="opacity-40" />
        <p className=" text-2xl font-bold text-black ">Invalid Move</p>
      </div>
    </div>
  );
};

export default InValidMove;

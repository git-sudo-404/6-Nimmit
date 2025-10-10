import React from "react";

const RowCardHolder = ({ row, col }) => {
  return (
    <div
      key={`${row}-${col}`}
      className="  border border-black border-dashed w-full h-full rounded-2xl hover:scale-120 transform-all duration-100 "
    ></div>
  );
};

export default RowCardHolder;

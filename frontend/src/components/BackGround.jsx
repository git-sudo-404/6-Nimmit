import React from "react";

const BackGround = () => {
  let BackGroundImageSrc;

  try {
    BackGroundImageSrc = new URL(
      `../assets/others/background_1.png`,
      import.meta.url,
    ).href;
  } catch (error) {
    console.log("Error in <BackGround/>");
  }

  return (
    <div
      className="fixed inset-0 w-full h-full bg-cover bg-center -z-10"
      style={{ backgroundImage: `url(${BackGroundImageSrc})` }}
    />

    // <div calssName="fixed fill-screen">
    //   <img
    //     src={BackGroundImageSrc}
    //     alt="Background image"
    //     className="w-full h-full object-cover"
    //   />
    // </div >
  );
};

export default BackGround;

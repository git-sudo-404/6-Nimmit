import React from "react";

const RenderCard = ({ card }) => {
  if (!card) return null;

  let cardImageSrc;

  try {
    cardImageSrc = new URL(
      `../assets/cards/${card.cardNumber}.png`,
      import.meta.url,
    ).href;
    // cardImageSrc = require(`../assets/cards/${card.cardNumber}.png`).default;
  } catch (error) {
    console.log(error);
    console.log("Error with the card : ", card.cardNumber);
  }

  return (
    <>
      <div>
        <img src={cardImageSrc} alt={`Card : ${card.cardNumber}`} />
      </div>
    </>
  );
};

export default RenderCard;

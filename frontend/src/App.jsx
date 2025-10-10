import "./App.css";
import BackGround from "./components/BackGround.jsx";
import { createCard } from "./lib/utils.js";
import GameBoard from "./components/GameBoard.jsx";

function App() {
  const cards = [];

  for (let i = 1; i <= 104; i++) {
    let card = createCard();
    card.cardNumber = i;
    cards.push(card);
  }

  console.log("App : ", cards[0].cardNumber);

  return (
    <>
      <BackGround />
      {/* <RenderCard key={cards[0].cardNumber} card={cards[0]} /> */}
      <GameBoard />
    </>
  );
}

export default App;

### ToDo List :

- For now use the images for the cards.
- Later dynamically generate the card numbers using the font similar to 'omarchy'
  or something and render the cards.
- add music and sound effects.

### 6 - Nimmt

#### _How to play_

- Total 104 cards (1,2,3,4,5,....104).
- Objective : Have least no. of Bullheads in your pile at the end of the game.
- Step - 1 : Shuffle and deal 10 cards to each player(Here, just 2 players).
- Step - 2 : Each player arranges their cards in ascending order.
- Step - 3 : Make 4 - rows on the arena and have aside the draw pile with the remaining cards.
- Step - 4 : Each shall not contain more than 5-cards including the cards that were placed already.
- Step - 5 : Each player places takes one card and places it FACE DOWN.
- Step - 6 : Once, all the players have placed their cards, they reveal.
- Step - 7 : Player with the lowest number card among the revealed ones (i.e) the ones placed in the arena adds their card to one of the four rows.
- Step - 8 : Then the next smaller card player , then the next ...., then.....
- Step - 9 : This continues untill all the 10 Hands are played.

##### _ Rules for adding the cards to the rows _

- Rule 1 : The player's card must be greater than the card previous to it in a row if placed.
- Rule 2 : The card must be added to the row which has the smallest possible difference b/w the last card of the row and the current card.
  (i.e) Add the current card (which is yet to be placed) to the row that has the last card number cloest and also < the card to be placed.
- Rule 3 : A row can contain only 5 cards.
- Rule 4 : If by following the above rules , if any player has to place a card in such a way that it would become the sixth card , then the player
  has to take all the FIVE cards and replace them with that 6th card and they would place those taken five cards in front of them FACE DOWN.
  This becomes their Bullhead Stack.
- Rule 5 : If a player has a lowest card number such that it can't be fit into any row, then they can choose any row and take that row into their bullstack
  and replace that row with that lowest card.
- Rule 6 : If i am replacing the entire row , then i would choose the row in such a way that ,it would score me the lowest minus points.
  The minus points is directly = sum(the number of bull heads in each card).
- Rule 7 : Once the 10 Hands of every player is played , count the number of bull heads for each player and then note the scores.

- Step - 10 : The Game is played for Several Rounds.
- Step - 11 : At the end of all the rounds whichever player has the lowest bullheads wins the game.

#### Future Features :

- Add multiplayer Support.
- Add AI Arena where different Algorithms compete against one another.

#### To Do :

- add cards distribution animation.
- Add Tyepcheck using typescript.

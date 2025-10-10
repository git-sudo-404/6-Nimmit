from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import copy


app = FastAPI() 

origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:5173",
]



app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# types / pydantic

class Card(BaseModel): 
    cardNumber : int 
    isFlipped : bool 
    isSelect : bool 
    rowNumber : int 
    colNumber : int 
    isInBullHeadStack : bool 
    isInDrawPile : bool 

class State(BaseModel): 
    hasStarted : bool 
    playerTurn : bool 
    hasEnded : bool 
    playerScore : int 
    aiScore : int 
    playerWon : bool 
    aiWon : bool 
    aiAlgo : int 
    cards : List[Card]

#get functions 

def getCards(state:State):
    cards = [_ for _ in state.cards]
    return cards 

def getGameStats(state: State):
    return {
        "hasStarted": state.hasStarted,
        "playerTurn": state.playerTurn,
        "hasEnded": state.hasEnded,
        "playerScore": state.playerScore,
        "aiScore": state.aiScore,
        "playerWon": state.playerWon,
        "aiWon": state.aiWon,
        "aiAlgo": state.aiAlgo
    }



# def getGameStats(state:State):
#     gameStats = {
#         hasStarted:state.hasStarted,
#         playerTurn:state.playerTurn,
#         hasEnded:state.playerTurn,
#         playerScore:state.playerScore,
#         aiScore:state.aiScore,
#         playerWon:state.playerWon,
#         aiWon:state.aiWon,
#         aiAlgo:state.aiAlgo
#     }
#     return gameStats


def getPlayerCards(cards):
    playerCards = [x for x in cards if x.rowNumber==5 and not x.isInBullHeadStack]
    return playerCards     

def getAiCards(cards):
    aiCards = [x for x in cards if x.rowNumber==0 and not x.isInBullHeadStack]
    return aiCards

def getRows(cards):
    rows = []
    for i in range(1,5):
        rows.append([x for x in cards if x.rowNumber==i])
    return rows 

#actual game logic

def getBullHeads(card):
    num = card.cardNumber 
    if(num==55):
        return 7 
    if(num%10==0):
        return 3
    if(num%11==0):
        return 5 
    if(num%5==0):
        return 2
    return 1
    

def setCardsOfThisRowToPlayerBullstack(gameStats,cards,row):
    for card in cards:
        if(card.rowNumber==row):
            card.rowNumber = 5 
            card.isFlipped = True
            card.isInBullHeadStack = True 
            gameStats["playerScore"] += getBullHeads(card)
            


def setCardsOfThisRowToAiBullStack(gameStats,cards,row):
    for card in cards:
        if(card.cardNumber==row):
            card.rowNumber = 0
            card.isFlipped = True 
            card.isInBullHeadStack = True
            gameStats["aiScore"] += getBullHeads(card)


            
def get_last_card_of_row(cards, row_number):
    """Return the card with the largest cardNumber in a given row."""
    row_cards = [c for c in cards if c.rowNumber == row_number and not c.isInBullHeadStack]
    if not row_cards:
        return None
    return max(row_cards, key=lambda c: c.cardNumber)

def count_cards_in_row(cards, row_number):
    """Return number of cards currently in a row."""
    return len([c for c in cards if c.rowNumber == row_number and not c.isInBullHeadStack])




def convertToJSON(gameStats, cards):

    return {
        "hasStarted": gameStats["hasStarted"],
        "playerTurn": gameStats["playerTurn"],
        "hasEnded": gameStats["hasEnded"],
        "playerScore": gameStats["playerScore"],
        "aiScore": gameStats["aiScore"],
        "playerWon": gameStats["playerWon"],
        "aiWon": gameStats["aiWon"],
        "aiAlgo": gameStats["aiAlgo"],
        "cards": [
            c.model_dump() if hasattr(c, "model_dump") else vars(c)
            for c in cards
        ],
    }

def calc_next(cards,gameStats):
    playerHand = getPlayerCards(cards)
    aiHand = getAiCards(cards)
    rows = getRows(cards)
    
    for i in range(4):
        if(len(rows[i])==6):
            for card in rows[i]:
                gameStats["playerScore"] += getBullHeads(card)
                card.rowNumber = 5
                card.isInBullHeadStack = True
                card.isFlipped = True 

    makeAiMove(cards, gameStats)

    # Step 3: check for AI overflow
    for i in range(1, 5):
        if count_cards_in_row(cards, i) >= 6:
            for card in cards:
                if card.rowNumber == i and not card.isInBullHeadStack:
                    gameStats["aiScore"] += getBullHeads(card)
                    card.rowNumber = 0
                    card.isFlipped = True
                    card.isInBullHeadStack = True


    
                    
                

    

@app.post('/')
async def process_request(state:State):
    
    # duplicate = state.model_copy(update={"playerTurn": True})
    
    cards = getCards(state)
    gameStats = getGameStats(state)

    calc_next(cards,gameStats)

    gameStats["playerTurn"] = True

    next_state = convertToJSON(gameStats,cards)

    return next_state


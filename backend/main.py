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
    r1Over: bool
    r2Over: bool
    r3Over: bool
    r1playerWon: bool
    r2playerWon: bool
    r3playerWon: bool
    r1playerScore: int
    r2playerScore: int 
    r3playerScore: int 
    r1aiScore: int 
    r2aiScore: int 
    r3aiScore: int


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
        "aiAlgo": state.aiAlgo,
        "r1Over" : state.r1Over,    
        "r2Over" : state.r2Over,
        "r3Over" : state.r3Over,
        "r1playerWon" : state.r1playerWon,
        "r2playerWon" : state.r2playerWon,
        "r3playerWon" : state.r3playerWon,
        "r1playerScore" : state.r1playerScore,
        "r2playerScore" : state.r2playerScore,
        "r3playerScore" : state.r3playerScore,
        "r1aiScore" : state.r1aiScore,
        "r2aiScore" : state.r2aiScore,
        "r3aiScore" : state.r3aiScore
    }



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
        if(card.rowNumber==row):
            card.rowNumber = 0
            card.isFlipped = True 
            card.isInBullHeadStack = True
            gameStats["aiScore"] += getBullHeads(card)


            
def getCardInRow(cards,rowNumber):
    row = [_ for _ in cards if _.rowNumber==rowNumber]
    return row 

def aiCardTooLow(cards):
    row1 = getCardInRow(cards,1)
    row2 = getCardInRow(cards,2)
    row3 = getCardInRow(cards,3)
    row4 = getCardInRow(cards,4)
    
    m1 = max(card.cardNumber for card in row1)
    m2 = max(card.cardNumber for card in row2)
    m3 = max(card.cardNumber for card in row3)
    m4 = max(card.cardNumber for card in row4)

    maxPlayerCard = max(card.cardNumber for card in cards if card.rowNumber==0 and not card.isInBullHeadStack)
    
    if(maxPlayerCard<min(m1,m2,m3,m4)):
        return True 

    return False

def getBullHeadScoreOfRow(cards,rowNumber):
    row = getCardInRow(cards,rowNumber)
    rowBullHeadScore = sum(getBullHeads(card) for card in row)
    return rowBullHeadScore
    

def handleFullRow(cards,gameStats):
    # choose the minimum  cardNumber from ai hand when the full row is taken into bullheadstack 
    minimumCardNumber = min(card.cardNumber for card in cards if card.rowNumber==0 and not card.isInBullHeadStack)
    rowScores = [1,2,3,4]
    rowScores.sort(key=lambda row:getBullHeadScoreOfRow(cards,row))
    for card in cards : 
        if card.rowNumber == rowScores[0]:
            card.rowNumber = 0
            card.isInBullHeadStack = True 
            gameStats["aiScore"] += getBullHeads(card)
        if card.cardNumber == minimumCardNumber:
            card.rowNumber = rowScores[0]
            
            
def convertToJSON(gameStats,cards):
     # Convert card objects to dicts (Pydantic will handle it too, but let's ensure it’s pure JSON)
    cards_json = [card.dict() for card in cards]

    # Construct the full state as per your State model
    state_json = {
        "hasStarted": gameStats["hasStarted"],
        "playerTurn": gameStats["playerTurn"],
        "hasEnded": gameStats["hasEnded"],
        "playerScore": gameStats["playerScore"],
        "aiScore": gameStats["aiScore"],
        "playerWon": gameStats["playerWon"],
        "aiWon": gameStats["aiWon"],
        "aiAlgo": gameStats["aiAlgo"],
        "r1Over": gameStats["r1Over"],
        "r2Over": gameStats["r2Over"],
        "r3Over": gameStats["r3Over"],
        "r1playerWon": gameStats["r1playerWon"],
        "r2playerWon": gameStats["r2playerWon"],
        "r3playerWon": gameStats["r3playerWon"],
        "r1playerScore": gameStats["r1playerScore"],
        "r2playerScore": gameStats["r2playerScore"],
        "r3playerScore": gameStats["r3playerScore"],
        "r1aiScore": gameStats["r1aiScore"],
        "r2aiScore": gameStats["r2aiScore"],
        "r3aiScore": gameStats["r3aiScore"],
        "cards": cards_json
    }

    # # Convert dict → State (so FastAPI automatically validates and serializes)
    # return State(**state_json)
    return state_json

def calc_next(state):
    cards = getCards(state)
    gameStats = getGameStats(state)
    if(aiCardTooLow(cards)):
        handleFullRow(cards,gameStats)
    else:
        # find the smallest card that can be placed in a row 
        ai_cards = [x for x in cards if x.rowNumber==0 and not x.isInBullHeadStack]
        
        ai_cards.sort(key = lambda card:card.cardNumber)
        
        r1 = [card for card in cards if card.rowNumber==1]
        r2 = [card for card in cards if card.rowNumber==2]
        r3 = [card for card in cards if card.rowNumber==3]
        r4 = [card for card in cards if card.rowNumber==4]
        
        m1 = max(card.cardNumber for card in r1 )
        m2 = max(card.cardNumber for card in r2 )
        m3 = max(card.cardNumber for card in r3 )
        m4 = max(card.cardNumber for card in r4 )

        minirow = -1
        maxis = [m1,m2,m3,m4]

        maxis.sort()

        if(maxis[0]==m1):
            minirow = 1 
        elif(maxis[0]==m2):
            minirow = 2 
        elif(maxis[0]==m3):
            minirow = 3 
        else:
            minirow = 4 

        for aic in ai_cards:
            if(aic.cardNumber>maxis[0]):
                for card in cards :
                    if card.cardNumber==aic.cardNumber:
                        card.rowNumber = minirow
                        break 
                break

        # check for if the placed card is the sixth card 

        cardCount = 0
        for card in cards : 
            if(card.rowNumber==minirow):
                cardCount+=1 

        if(cardCount==6):
            for card in cards : 
                if card.rowNumber == minirow:
                    card.rowNumber = 0
                    card.isInBullHeadStack = True 
                    gameStats["aiScore"] += getBullHeads(card)

    new_state = convertToJSON(gameStats,cards) 
    
    return new_state

@app.post('/')
async def process_request(state:State):
    
    # duplicate = state.model_copy(update={"playerTurn": True})

    new_state = calc_next(state)

    return new_state 


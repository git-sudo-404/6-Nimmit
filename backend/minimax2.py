# main.py
import copy
import math
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Tuple

# ==============================================================================
# 1. FastAPI APP SETUP AND PYDANTIC MODELS (Unchanged)
# ==============================================================================

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

class Card(BaseModel):
    cardNumber: int
    isFlipped: bool
    isSelect: bool
    rowNumber: int
    colNumber: int
    isInBullHeadStack: bool
    isInDrawPile: bool

class State(BaseModel):
    hasStarted: bool
    playerTurn: bool
    hasEnded: bool
    playerScore: int
    aiScore: int
    playerWon: bool
    aiWon: bool
    aiAlgo: int
    cards: List[Card]


# ==============================================================================
# 2. CORE GAME LOGIC HELPERS (Refactored for Reusability)
# ==============================================================================

def get_bull_heads(card: Card) -> int:
    """Calculates the number of bullheads on a single card."""
    num = card.cardNumber
    if num == 55: return 7
    if num % 11 == 0: return 5
    if num % 10 == 0: return 3
    if num % 5 == 0: return 2
    return 1

def resolve_card_placement(state: State, card_to_play: Card, is_player_move: bool):
    """
    This is the core logic for placing a single card on the board.
    It handles finding the row, taking a row if full, or taking a row if the card is too low.
    It MODIFIES the state directly.
    """
    rows: Dict[int, List[Card]] = {i: [] for i in range(1, 5)}
    for c in state.cards:
        if 1 <= c.rowNumber <= 4 and not c.isInBullHeadStack:
            rows[c.rowNumber].append(c)

    row_ends: Dict[int, Card] = {
        r_num: max(r_cards, key=lambda c: c.colNumber)
        for r_num, r_cards in rows.items() if r_cards
    }
    
    valid_rows = {
        r_num: end_card for r_num, end_card in row_ends.items() 
        if end_card.cardNumber < card_to_play.cardNumber
    }

    if valid_rows:
        target_row_num = max(valid_rows, key=lambda r: valid_rows[r].cardNumber)
        if len(rows[target_row_num]) == 5:
            _take_row_and_update_score(state, target_row_num, is_player_move)
            _place_card_on_board(card_to_play, target_row_num, 0)
        else:
            new_col_num = len(rows[target_row_num])
            _place_card_on_board(card_to_play, target_row_num, new_col_num)
    else:
        row_bullheads = {
            r_num: sum(get_bull_heads(c) for c in r_cards)
            for r_num, r_cards in rows.items() if r_cards
        }
        if not row_bullheads:
            row_to_take = 1
        else:
            row_to_take = min(row_bullheads, key=row_bullheads.get)
        
        _take_row_and_update_score(state, row_to_take, is_player_move)
        _place_card_on_board(card_to_play, row_to_take, 0)

def _place_card_on_board(card: Card, row_num: int, col_num: int):
    """Helper to physically place a card."""
    card.rowNumber = row_num
    card.colNumber = col_num
    card.isFlipped = False
    card.isSelect = False
    card.isInDrawPile = False

def _take_row_and_update_score(state: State, row_num: int, is_player_taking: bool):
    """Helper to move cards to a bullhead stack and update score."""
    score_gain = 0
    cards_in_row = [c for c in state.cards if c.rowNumber == row_num and not c.isInBullHeadStack]
    for card in cards_in_row:
        card.isInBullHeadStack = True
        card.isFlipped = True
        score_gain += get_bull_heads(card)
        card.rowNumber = 5 if is_player_taking else 0
    
    if is_player_taking:
        state.playerScore += score_gain
    else:
        state.aiScore += score_gain

# ==============================================================================
# 3. MINIMAX AI IMPLEMENTATION
# ==============================================================================

SEARCH_DEPTH = 3 # How many moves ahead the AI will look. 3 is a good balance.

def evaluate_board(state: State) -> float:
    """
    The Heuristic Evaluation Function. This is the "brain" of the AI.
    It assigns a score to a given game state from the AI's perspective.
    Positive score is good for AI, negative is good for Player.
    """
    if state.hasEnded:
        if state.aiWon: return 10000.0
        if state.playerWon: return -10000.0
        return 0.0

    # Component 1: Score Difference (the most important factor)
    score_weight = 10.0
    score_diff = (state.playerScore - state.aiScore) * score_weight
    
    # Component 2: Board Danger Analysis
    # Penalize states where rows are nearly full, especially if they have many bullheads.
    board_danger = 0.0
    rows: Dict[int, List[Card]] = {i: [] for i in range(1, 5)}
    for c in state.cards:
        if 1 <= c.rowNumber <= 4: rows[c.rowNumber].append(c)

    for r_num, r_cards in rows.items():
        if not r_cards: continue
        num_cards = len(r_cards)
        bulls = sum(get_bull_heads(c) for c in r_cards)
        # Danger increases exponentially as the row gets closer to 5 cards
        danger_factor = (num_cards / 5) ** 2
        board_danger += danger_factor * bulls
        
    # We want a high score, so we subtract the danger.
    final_score = score_diff - board_danger
    
    return final_score

def simulate_turn(state: State, ai_card: Card, player_card: Card) -> State:
    """
    Takes a state and two cards to play, and returns a NEW state representing the outcome.
    Does NOT modify the original state.
    """
    sim_state = state.model_copy(deep=True)
    
    # Find the card objects within the new copied state
    sim_ai_card = next(c for c in sim_state.cards if c.cardNumber == ai_card.cardNumber)
    sim_player_card = next(c for c in sim_state.cards if c.cardNumber == player_card.cardNumber)
    
    played_cards = sorted(
        [
            (sim_ai_card, False),      # (card, is_player_move)
            (sim_player_card, True)
        ], 
        key=lambda x: x[0].cardNumber
    )
    
    for card, is_player in played_cards:
        resolve_card_placement(sim_state, card, is_player)
        
    return sim_state

def minimax_alpha_beta(
    state: State,
    depth: int,
    alpha: float,
    beta: float,
    is_maximizing_player: bool
) -> Tuple[float, Optional[Card]]:
    """
    The Minimax algorithm with Alpha-Beta Pruning.
    Returns the best score and the corresponding best card to play.
    """
    if depth == 0 or state.hasEnded:
        return evaluate_board(state), None

    ai_hand = [c for c in state.cards if c.rowNumber == 0 and not c.isInBullHeadStack]
    player_hand = [c for c in state.cards if c.rowNumber == 5 and not c.isInBullHeadStack]

    if is_maximizing_player: # AI's Turn (MAX)
        if not ai_hand: return evaluate_board(state), None
        
        max_eval = -math.inf
        best_move_card = ai_hand[0] # Default to the first card

        # Assumption: Player makes a simple, predictable move (plays their lowest card)
        player_predictable_move = min(player_hand, key=lambda c: c.cardNumber, default=None)
        if not player_predictable_move: return evaluate_board(state), None

        for ai_move_card in ai_hand:
            # Simulate the outcome of this move
            next_state = simulate_turn(state, ai_move_card, player_predictable_move)
            
            # Recurse down the tree for the Minimizing player
            current_eval, _ = minimax_alpha_beta(next_state, depth - 1, alpha, beta, False)
            
            if current_eval > max_eval:
                max_eval = current_eval
                best_move_card = ai_move_card
            
            alpha = max(alpha, current_eval)
            if beta <= alpha:
                break # Prune this branch
                
        return max_eval, best_move_card
        
    else: # Player's Turn (MIN)
        if not player_hand: return evaluate_board(state), None
        
        min_eval = math.inf
        best_move_card = player_hand[0]

        # Assumption: AI makes a simple, predictable move (plays its lowest card)
        ai_predictable_move = min(ai_hand, key=lambda c: c.cardNumber, default=None)
        if not ai_predictable_move: return evaluate_board(state), None

        for player_move_card in player_hand:
            next_state = simulate_turn(state, ai_predictable_move, player_move_card)
            
            current_eval, _ = minimax_alpha_beta(next_state, depth - 1, alpha, beta, True)
            
            if current_eval < min_eval:
                min_eval = current_eval
                best_move_card = player_move_card
            
            beta = min(beta, current_eval)
            if beta <= alpha:
                break # Prune this branch

        return min_eval, best_move_card

# ==============================================================================
# 4. MAIN GAME CONTROLLER AND API ENDPOINT
# ==============================================================================

def calculate_final_turn(state: State) -> State:
    """
    The main function that is called by the API. It determines the AI's move
    and then resolves the turn with the player's actual move.
    """
    new_state = state.model_copy(deep=True)

    # 1. VALIDATE PLAYER MOVE
    player_selected_card_orig = next((c for c in state.cards if c.rowNumber == 5 and c.isSelect), None)
    if not player_selected_card_orig:
        # Invalid move from frontend, return original state
        return state

    # 2. GET AI's BEST MOVE USING MINIMAX
    ai_hand = [c for c in state.cards if c.rowNumber == 0 and not c.isInBullHeadStack]
    if not ai_hand: # Game should end if AI has no cards
        return state

    print(f"AI is thinking with depth {SEARCH_DEPTH}...")
    _, best_ai_card_to_play_orig = minimax_alpha_beta(
        state, SEARCH_DEPTH, -math.inf, math.inf, True
    )
    print(f"AI chose card: {best_ai_card_to_play_orig.cardNumber}")
    
    # 3. RESOLVE THE TURN with the player's *actual* move and AI's *best* move
    
    # We need to find these cards in our 'new_state' copy
    player_card = next(c for c in new_state.cards if c.cardNumber == player_selected_card_orig.cardNumber)
    ai_card = next(c for c in new_state.cards if c.cardNumber == best_ai_card_to_play_orig.cardNumber)

    played_cards_for_real = sorted(
        [(ai_card, False), (player_card, True)],
        key=lambda x: x[0].cardNumber
    )
    
    for card, is_player in played_cards_for_real:
        resolve_card_placement(new_state, card, is_player)

    # 4. POST-TURN CLEANUP
    player_card.isSelect = False
    
    player_hand_after_turn = [c for c in new_state.cards if c.rowNumber == 5 and not c.isInBullHeadStack]
    if not player_hand_after_turn:
        new_state.hasEnded = True
        if new_state.playerScore < new_state.aiScore:
            new_state.playerWon = True
        elif new_state.aiScore < new_state.playerScore:
            new_state.aiWon = True

    return new_state


@app.post('/', response_model=State)
async def process_request(state: State):
    """
    Main endpoint to process a player's move and return the new game state.
    """
    if state.hasEnded:
        return state
        
    next_state = calculate_final_turn(state)
    return next_state

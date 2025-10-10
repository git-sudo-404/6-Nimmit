# main.py
import copy
import math
import random
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
# 2. CORE GAME LOGIC HELPERS (Unchanged from Minimax version)
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

def play_one_turn(state: State, ai_card_num: int, player_card_num: int) -> State:
    """Plays one turn of the game and returns the new state."""
    sim_ai_card = next(c for c in state.cards if c.cardNumber == ai_card_num)
    sim_player_card = next(c for c in state.cards if c.cardNumber == player_card_num)

    played_cards = sorted(
        [(sim_ai_card, False), (sim_player_card, True)],
        key=lambda x: x[0].cardNumber
    )

    for card, is_player in played_cards:
        resolve_card_placement(state, card, is_player)
    
    return state

# ==============================================================================
# 3. MCTS AI IMPLEMENTATION
# ==============================================================================

MCTS_ITERATIONS = 1500  # Number of simulations to run. Higher is smarter but slower.
EXPLORATION_CONSTANT = 1.41 # The 'C' in the UCB1 formula, sqrt(2) is common.

class MCTSNode:
    def __init__(self, state: State, parent: 'MCTSNode' = None, move: Card = None):
        self.state: State = state
        self.parent: Optional[MCTSNode] = parent
        self.move: Optional[Card] = move # The AI move that led to this state
        self.children: List[MCTSNode] = []
        
        self.visits: int = 0
        self.reward: float = 0.0 # Cumulative reward from simulations
        
        self.untried_moves: List[Card] = self.get_legal_moves()

    def get_legal_moves(self) -> List[Card]:
        """Returns a list of cards the AI can play from the current state."""
        return [c for c in self.state.cards if c.rowNumber == 0 and not c.isInBullHeadStack]

    def is_fully_expanded(self) -> bool:
        """Checks if all possible moves from this node have been explored."""
        return len(self.untried_moves) == 0

    def select_best_child(self) -> 'MCTSNode':
        """
        Selects the most promising child node using the UCB1 formula.
        This balances exploiting known good moves and exploring new ones.
        """
        best_score = -1.0
        best_child = None
        for child in self.children:
            exploit_score = child.reward / child.visits
            explore_score = EXPLORATION_CONSTANT * math.sqrt(math.log(self.visits) / child.visits)
            ucb_score = exploit_score + explore_score
            
            if ucb_score > best_score:
                best_score = ucb_score
                best_child = child
        return best_child

    def expand(self) -> 'MCTSNode':
        """
        Expands the tree by creating a new child node for an untried move.
        """
        ai_move_card = self.untried_moves.pop()
        
        # To create the next state, we must simulate a player move.
        # We assume the player makes a random move.
        player_hand = [c for c in self.state.cards if c.rowNumber == 5 and not c.isInBullHeadStack]
        if not player_hand: # Player has no cards, this is a terminal state
             return self
        
        player_random_move = random.choice(player_hand)
        
        # Create the new state by playing the turn
        new_state = self.state.model_copy(deep=True)
        next_state = play_one_turn(new_state, ai_move_card.cardNumber, player_random_move.cardNumber)

        child_node = MCTSNode(next_state, parent=self, move=ai_move_card)
        self.children.append(child_node)
        return child_node

    def simulate_rollout(self) -> float:
        """
        Performs a random simulation (rollout) from the current state to the end of the game.
        Returns a reward based on the final AI score.
        """
        current_sim_state = self.state.model_copy(deep=True)
        
        while True:
            ai_hand = [c for c in current_sim_state.cards if c.rowNumber == 0 and not c.isInBullHeadStack]
            player_hand = [c for c in current_sim_state.cards if c.rowNumber == 5 and not c.isInBullHeadStack]

            if not ai_hand or not player_hand:
                break # Game over

            ai_move = random.choice(ai_hand)
            player_move = random.choice(player_hand)
            
            current_sim_state = play_one_turn(current_sim_state, ai_move.cardNumber, player_move.cardNumber)

        # Reward function: Lower score is better. We invert it so higher reward is better.
        # We add 1 to avoid division by zero.
        final_ai_score = current_sim_state.aiScore
        return 1.0 / (1.0 + final_ai_score)

    def backpropagate(self, result_reward: float):
        """
        Updates the visit counts and rewards of this node and all its parents.
        """
        self.visits += 1
        self.reward += result_reward
        if self.parent:
            self.parent.backpropagate(result_reward)

def find_best_move_mcts(initial_state: State) -> Card:
    """The main MCTS driver function."""
    root = MCTSNode(state=initial_state)
    
    # Run the MCTS algorithm for a fixed number of iterations
    for _ in range(MCTS_ITERATIONS):
        node = root
        
        # 1. Selection
        while node.is_fully_expanded() and not node.state.hasEnded and node.children:
            node = node.select_best_child()
        
        # 2. Expansion
        if not node.is_fully_expanded() and not node.state.hasEnded:
            node = node.expand()

        # 3. Simulation
        reward = node.simulate_rollout()
        
        # 4. Backpropagation
        node.backpropagate(reward)

    # After all iterations, choose the move that was visited the most
    best_child = max(root.children, key=lambda c: c.visits)
    return best_child.move


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
        return state

    # 2. GET AI's BEST MOVE USING MCTS
    ai_hand = [c for c in state.cards if c.rowNumber == 0 and not c.isInBullHeadStack]
    if not ai_hand:
        return state

    print(f"AI is thinking with {MCTS_ITERATIONS} MCTS iterations...")
    best_ai_card_to_play = find_best_move_mcts(state)
    print(f"AI chose card: {best_ai_card_to_play.cardNumber}")
    
    # 3. RESOLVE THE TURN with the player's *actual* move and AI's *best* move
    new_state = play_one_turn(new_state, best_ai_card_to_play.cardNumber, player_selected_card_orig.cardNumber)
    
    # 4. POST-TURN CLEANUP
    player_card_in_new_state = next(c for c in new_state.cards if c.cardNumber == player_selected_card_orig.cardNumber)
    player_card_in_new_state.isSelect = False
    
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

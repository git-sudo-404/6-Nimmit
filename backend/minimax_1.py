# minimax.py
"""
Minimax search for 6-Nimmt (suitable for the project environment described).
- Use find_best_ai_move(cards, gameStats, depth) to get the best AI action.
- The solver assumes perfect information (both hands known).
- Implemented: alpha-beta pruning, transposition table, move ordering, simple evaluation.
"""

from copy import deepcopy
from functools import lru_cache
import math
import time
from typing import List, Tuple, Optional, Dict, Any

MAX_INT = 10**9


# -----------------------------
# Small helpers to work safely with incoming card objects
# -----------------------------
def card_to_dict(c):
    """Normalize card representation to a dict (works for pydantic BaseModel or plain dict)."""
    if hasattr(c, "model_dump"):
        return c.model_dump()
    if hasattr(c, "dict"):
        return c.dict()
    if isinstance(c, dict):
        return dict(c)
    # fallback: object with attributes
    return {
        "cardNumber": getattr(c, "cardNumber"),
        "isFlipped": getattr(c, "isFlipped"),
        "isSelect": getattr(c, "isSelect"),
        "rowNumber": getattr(c, "rowNumber"),
        "colNumber": getattr(c, "colNumber"),
        "isInBullHeadStack": getattr(c, "isInBullHeadStack"),
        "isInDrawPile": getattr(c, "isInDrawPile"),
    }


# -----------------------------
# Game rules utilities
# -----------------------------
def get_bullheads(card: Dict[str, Any]) -> int:
    num = card["cardNumber"]
    if num == 55:
        return 7
    if num % 10 == 0:
        return 3
    if num % 11 == 0:
        return 5
    if num % 5 == 0:
        return 2
    return 1


def get_rows(cards: List[Dict[str, Any]]) -> List[List[Dict[str, Any]]]:
    rows = []
    for r in range(1, 5):
        rows.append([c for c in cards if c["rowNumber"] == r and not c.get("isInBullHeadStack", False)])
    return rows


def get_last_card_of_row(cards: List[Dict[str, Any]], row_number: int) -> Optional[Dict[str, Any]]:
    row_cards = [c for c in cards if c["rowNumber"] == row_number and not c.get("isInBullHeadStack", False)]
    if not row_cards:
        return None
    return max(row_cards, key=lambda x: x["cardNumber"])


def count_cards_in_row(cards: List[Dict[str, Any]], row_number: int) -> int:
    return len([c for c in cards if c["rowNumber"] == row_number and not c.get("isInBullHeadStack", False)])


def get_player_hand_indices(cards: List[Dict[str, Any]]) -> List[int]:
    """Return indices of player's hand (rowNumber == 5)."""
    return [i for i, c in enumerate(cards) if c["rowNumber"] == 5 and not c.get("isInBullHeadStack", False)]


def get_ai_hand_indices(cards: List[Dict[str, Any]]) -> List[int]:
    """Return indices of AI's hand (rowNumber == 0)."""
    return [i for i, c in enumerate(cards) if c["rowNumber"] == 0 and not c.get("isInBullHeadStack", False)]


# -----------------------------
# GameState simulation wrapper
# -----------------------------
class GameState:
    """
    Small in-memory game state representation.
    cards: list of dicts (copies)
    playerScore, aiScore: ints
    """

    def __init__(self, cards: List[Dict[str, Any]], player_score: int = 0, ai_score: int = 0):
        # keep cards as deep copies to avoid accidental shared references
        self.cards = deepcopy([card_to_dict(c) for c in cards])
        self.playerScore = int(player_score)
        self.aiScore = int(ai_score)

    def clone(self) -> "GameState":
        return deepcopy(self)

    # core rule: find the row where a card would be placed deterministically (if possible)
    def deterministic_row_for_card(self, card_number: int) -> Optional[int]:
        """
        Return the deterministic row (1-4) to place a card if there exists a last_card < card_number.
        This follows standard 6-nimmt rule: choose the row whose last card is < card_number and with maximal last_card.
        If no such row exists return None (means the player must take a row).
        """
        candidate_row = None
        best_last_num = -1
        for r in range(1, 5):
            last = get_last_card_of_row(self.cards, r)
            if last is None:
                # no cards in this row => treat last card as -inf so it's not chosen for deterministic placement
                continue
            last_num = last["cardNumber"]
            if last_num < card_number and last_num > best_last_num:
                best_last_num = last_num
                candidate_row = r
        return candidate_row

    def take_row(self, taker: str, row: int):
        """Taker is 'ai' or 'player'. Move all row cards to taker's bullhead stack and update score."""
        for c in self.cards:
            if c["rowNumber"] == row and not c.get("isInBullHeadStack", False):
                # accumulate bullheads
                if taker == "ai":
                    self.aiScore += get_bullheads(c)
                    c["rowNumber"] = 0
                else:
                    self.playerScore += get_bullheads(c)
                    c["rowNumber"] = 5
                c["isInBullHeadStack"] = True
                c["isFlipped"] = True

    def place_card(self, taker: str, card_index: int, chosen_row: int, took_row: bool):
        """
        Apply a move:
        - If took_row True, it means card_index was used to choose a row (the player/AI was forced to take some row),
          so first that chosen row is taken by the taker (score updated), then the played card becomes the only card in that row.
        - Otherwise, for normal placement: place card into chosen_row. If the row had 5 cards before placing, the action
          of placing causes the taker to collect those 5 cards and the placed card becomes the new row starter.
        Returns nothing, mutates state.
        """
        card = self.cards[card_index]

        # Remove card from its hand (in effect, we're moving it to a row; it remains in cards list but rowNumber changes)
        # If forced to take a row before placing (no deterministic row), the taker chooses which row to take:
        if took_row:
            # chosen_row was taken by taker
            self.take_row(taker, chosen_row)
            # now place the card into that row as the only starter
            card["rowNumber"] = chosen_row
            card["isFlipped"] = True
            card["isInDrawPile"] = False
            card["isInBullHeadStack"] = False
            return

        # Normal placement: check how many cards already in row BEFORE placing
        before_count = count_cards_in_row(self.cards, chosen_row)

        if before_count >= 5:
            # placing as 6th: the taker collects the existing row cards (standard 6-nimmt: collects the 5 existing)
            # Implementation decision: collect the existing cards, not the newly placed.
            # Collect all existing non-bullhead cards in that row
            to_collect = [c for c in self.cards if c["rowNumber"] == chosen_row and not c.get("isInBullHeadStack", False)]
            # accumulate their bullheads and move them to taker's stack
            for c in to_collect:
                if taker == "ai":
                    self.aiScore += get_bullheads(c)
                    c["rowNumber"] = 0
                else:
                    self.playerScore += get_bullheads(c)
                    c["rowNumber"] = 5
                c["isInBullHeadStack"] = True
                c["isFlipped"] = True
            # After collecting, the placed card becomes the new starter
            card["rowNumber"] = chosen_row
            card["isFlipped"] = True
            card["isInDrawPile"] = False
            card["isInBullHeadStack"] = False
            return

        # Otherwise just place the card into that row
        card["rowNumber"] = chosen_row
        card["isFlipped"] = True
        card["isInDrawPile"] = False
        card["isInBullHeadStack"] = False
        return


# -----------------------------
# Move generation
# -----------------------------
def generate_moves_for_player(state: GameState, player: str) -> List[Tuple[int, int, bool]]:
    """
    Returns a list of possible moves for `player` ('ai' or 'player').
    Each move is a tuple: (card_index, chosen_row, took_row_flag)
      - card_index: index into state.cards representing the selected card in that player's hand
      - chosen_row: target row (1..4)
      - took_row_flag: True if the move is of taking a row (card is too small and player chooses which row to take)
    Rules used:
      - If deterministic row exists for a card: that is the deterministic chosen_row (no branching).
      - If no deterministic row exists for a card: the player must choose one of rows 1..4 to take (branch on row).
    """
    moves = []
    if player == "ai":
        hand_indices = get_ai_hand_indices(state.cards)
    else:
        hand_indices = get_player_hand_indices(state.cards)

    rows_snapshot = get_rows(state.cards)  # for bullhead sums

    for idx in hand_indices:
        card = state.cards[idx]
        row_choice = state.deterministic_row_for_card(card["cardNumber"])
        if row_choice is not None:
            moves.append((idx, row_choice, False))
        else:
            # must take one of the 4 rows -> branch on which row to take
            # We can order rows by ascending bullhead penalty to help alpha-beta (heuristic)
            penalties = []
            for r in range(1, 5):
                bull_sum = sum(get_bullheads(c) for c in rows_snapshot[r - 1] if not c.get("isInBullHeadStack", False))
                penalties.append((bull_sum, r))
            penalties.sort(key=lambda x: x[0])
            for _, r in penalties:
                moves.append((idx, r, True))
    return moves


# -----------------------------
# Evaluation function
# -----------------------------
def evaluate_state_for_ai(state: GameState) -> float:
    """
    Returns a numeric evaluation where higher is better FOR AI.
    We use a simple linear evaluation that penalizes aiScore and rewards the opponent's penalties being high:
       eval = (playerScore - aiScore) * -1  == aiScore - playerScore
    But we add small heuristics:
      - fewer cards in AI hand is slightly better (we'll not include that heavily).
      - penalize large immediate bullhead sums in near future is already captured by scores.
    """
    # Primary metric: ai wants aiScore lower than player's => aiScore - playerScore smaller is better.
    # To make higher = better for AI we invert: ai_adv = (playerScore - aiScore) * -1 => aiScore - playerScore
    base = (state.aiScore - state.playerScore)

    # minor tie-breaker: fewer AI cards remaining is usually worse for AI if it means it's about to collect more
    ai_cards_left = len(get_ai_hand_indices(state.cards))
    player_cards_left = len(get_player_hand_indices(state.cards))

    # prefer states where ai has fewer penalty points and player has more
    # we scale tie-breakers small
    tie_breaker = (player_cards_left - ai_cards_left) * 0.01

    # final evaluation (higher is better for AI)
    return -base + tie_breaker  # -base makes higher better for AI


# -----------------------------
# Transposition table helper
# -----------------------------
def state_hash(state: GameState) -> Tuple:
    """
    Compute a hashable signature of the game state for caching.
    We'll use tuple of sorted (cardNumber,rowNumber,isInBullHeadStack) to be order-stable.
    Also include scores and hand-sizes to be safe.
    """
    card_sig = tuple(
        (c["cardNumber"], c["rowNumber"], bool(c.get("isInBullHeadStack", False)))
        for c in sorted(state.cards, key=lambda d: (d["cardNumber"], d["rowNumber"]))
    )
    return (card_sig, state.playerScore, state.aiScore)


# -----------------------------
# Minimax with alpha-beta and caching
# -----------------------------
def minimax(state: GameState, depth: int, alpha: float, beta: float, maximizing_player: bool,
            cache: Dict = None) -> Tuple[float, Optional[Tuple[int, int, bool]]]:
    """
    Returns (value, best_move)
     - value: numeric evaluation (higher better for AI)
     - best_move: tuple (card_index, chosen_row, took_row_flag) or None for leaf
    maximizing_player: True when it's AI's turn (we maximize), False when it's player's turn (we minimize)
    """
    if cache is None:
        cache = {}

    # Terminal: no cards left in hands, or depth 0
    if depth == 0:
        return evaluate_state_for_ai(state), None

    ai_hand = get_ai_hand_indices(state.cards)
    player_hand = get_player_hand_indices(state.cards)
    if not ai_hand and not player_hand:
        # both empty -> terminal
        return evaluate_state_for_ai(state), None

    # Transposition key
    key = (state_hash(state), depth, maximizing_player)
    if key in cache:
        return cache[key]

    if maximizing_player:
        # AI to move
        best_value = -math.inf
        best_move = None
        moves = generate_moves_for_player(state, "ai")

        # Move ordering: try heuristic best first (prefer moves with zero penalty)
        def move_score(m):
            idx, r, took = m
            if took:
                # penalty is sum of bullheads in row r
                bull_sum = sum(get_bullheads(c) for c in state.cards if c["rowNumber"] == r and not c.get("isInBullHeadStack", False))
                return -bull_sum  # prefer smaller penalty first
            else:
                # prefer small diff to last card (safer)
                last = get_last_card_of_row(state.cards, r)
                if last:
                    return -(state.cards[idx]["cardNumber"] - last["cardNumber"])
                return 0

        moves.sort(key=move_score)

        for move in moves:
            idx, r, took = move
            child = state.clone()
            child.place_card("ai", idx, r, took)
            # after AI move the next player is the opponent
            val, _ = minimax(child, depth - 1, alpha, beta, False, cache)
            if val > best_value:
                best_value = val
                best_move = move
            alpha = max(alpha, best_value)
            if beta <= alpha:
                break

        cache[key] = (best_value, best_move)
        return cache[key]
    else:
        # Player to move (we minimize AI's evaluation)
        best_value = math.inf
        best_move = None
        moves = generate_moves_for_player(state, "player")

        # Order player moves to maximize pruning: prefer moves that hurt AI (higher penalty) first
        def pmove_score(m):
            idx, r, took = m
            if took:
                bull_sum = sum(get_bullheads(c) for c in state.cards if c["rowNumber"] == r and not c.get("isInBullHeadStack", False))
                return bull_sum
            else:
                last = get_last_card_of_row(state.cards, r)
                if last:
                    return (state.cards[idx]["cardNumber"] - last["cardNumber"])
                return 0

        moves.sort(key=pmove_score, reverse=True)

        for move in moves:
            idx, r, took = move
            child = state.clone()
            child.place_card("player", idx, r, took)
            val, _ = minimax(child, depth - 1, alpha, beta, True, cache)
            if val < best_value:
                best_value = val
                best_move = move
            beta = min(beta, best_value)
            if beta <= alpha:
                break

        cache[key] = (best_value, best_move)
        return cache[key]


# -----------------------------
# Public API: pick best AI move
# -----------------------------
def find_best_ai_move(raw_cards: List[Any], gameStats: Dict[str, Any], depth: int = 4,
                      time_limit: Optional[float] = None) -> Optional[Tuple[int, int, bool]]:
    """
    Top-level function:
    - raw_cards: list of cards (pydantic models or dicts)
    - gameStats: dict with at least 'playerScore' and 'aiScore'
    - depth: search depth (higher = stronger but slower)
    - time_limit: optional seconds to limit search (not strictly enforced here)
    Returns: (card_index, row, took_row_flag) representing the best move for the AI in the `raw_cards` indexing.
    """
    state = GameState(raw_cards, player_score=gameStats.get("playerScore", 0), ai_score=gameStats.get("aiScore", 0))

    # Quick exit: if no ai cards
    ai_indices = get_ai_hand_indices(state.cards)
    if not ai_indices:
        return None

    # iterative deepening optionally (we'll do single depth by default)
    val, move = minimax(state, depth, -math.inf, math.inf, True, cache={})
    return move


# -----------------------------
# Convenience wrapper to apply the found move directly (mutates provided cards/gameStats) 
# -----------------------------
def apply_best_ai_move(cards: List[Any], gameStats: Dict[str, Any], depth: int = 4) -> None:
    """
    Finds and applies the best AI move directly on the provided cards and gameStats objects.
    This mutates `cards` and `gameStats` in place (so use deepcopy externally if you need to keep original).
    """
    move = find_best_ai_move(cards, gameStats, depth=depth)
    if not move:
        return
    # move is (card_index, row, took_row_flag) where card_index indexes into the state.cards used internally.
    # We need to find matching index in the provided `cards` list used by caller (raw objects).
    # The internal indices correspond to ordering of `cards` list; so we can apply directly.
    idx, row, took = move
    # mutate supplied game objects similarly to GameState.place_card
    # First normalize to dict references for safety, then apply
    # We'll replicate the GameState.place_card logic here, but operate on provided cards and gameStats
    cards_copy = cards  # operate in place
    card = cards_copy[idx]

    # normalize card to dict (if pydantic, mutate attributes; we assume dictionaries or mutable objects)
    # handle "take row" action
    if took:
        # collect that row to AI
        for c in cards_copy:
            if c["rowNumber"] == row and not c.get("isInBullHeadStack", False):
                gameStats["aiScore"] += get_bullheads(c)
                c["rowNumber"] = 0
                c["isInBullHeadStack"] = True
                c["isFlipped"] = True
        # place the card as row starter
        card["rowNumber"] = row
        card["isFlipped"] = True
        card["isInBullHeadStack"] = False
        card["isInDrawPile"] = False
        return

    before_count = count_cards_in_row(cards_copy, row)
    if before_count >= 5:
        # collect existing row for ai
        for c in list(cards_copy):
            if c["rowNumber"] == row and not c.get("isInBullHeadStack", False):
                gameStats["aiScore"] += get_bullheads(c)
                c["rowNumber"] = 0
                c["isInBullHeadStack"] = True
                c["isFlipped"] = True
        # placed card becomes starter
        card["rowNumber"] = row
        card["isFlipped"] = True
        card["isInBullHeadStack"] = False
        card["isInDrawPile"] = False
        return

    # normal placement
    card["rowNumber"] = row
    card["isFlipped"] = True
    card["isInBullHeadStack"] = False
    card["isInDrawPile"] = False
    return


# -----------------------------
# Quick test / example usage (can be removed)
# -----------------------------
if __name__ == "__main__":
    # tiny smoke test (not exhaustive)
    # Build a minimal plausible board state as dicts:
    sample_cards = []
    # create sample initial rows: 4 rows with one starter each
    sample_cards.extend([
        {"cardNumber": 2, "rowNumber": 1, "isInBullHeadStack": False, "isFlipped": False, "isInDrawPile": False, "isSelect": False, "colNumber": 0},
        {"cardNumber": 10, "rowNumber": 2, "isInBullHeadStack": False, "isFlipped": False, "isInDrawPile": False, "isSelect": False, "colNumber": 0},
        {"cardNumber": 18, "rowNumber": 3, "isInBullHeadStack": False, "isFlipped": False, "isInDrawPile": False, "isSelect": False, "colNumber": 0},
        {"cardNumber": 31, "rowNumber": 4, "isInBullHeadStack": False, "isFlipped": False, "isInDrawPile": False, "isSelect": False, "colNumber": 0},
    ])
    # AI hand (rowNumber == 0)
    sample_cards.extend([
        {"cardNumber": 5, "rowNumber": 0, "isInBullHeadStack": False, "isFlipped": True, "isInDrawPile": False, "isSelect": False, "colNumber": 0},
        {"cardNumber": 25, "rowNumber": 0, "isInBullHeadStack": False, "isFlipped": True, "isInDrawPile": False, "isSelect": False, "colNumber": 1},
    ])
    # Player hand (rowNumber == 5)
    sample_cards.extend([
        {"cardNumber": 17, "rowNumber": 5, "isInBullHeadStack": False, "isFlipped": False, "isInDrawPile": False, "isSelect": False, "colNumber": 0},
        {"cardNumber": 12, "rowNumber": 5, "isInBullHeadStack": False, "isFlipped": False, "isInDrawPile": False, "isSelect": False, "colNumber": 1},
    ])
    gs = {"playerScore": 0, "aiScore": 0}
    move = find_best_ai_move(sample_cards, gs, depth=3)
    print("best move:", move)


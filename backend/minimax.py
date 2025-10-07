import copy
from typing import List, Dict, Tuple

# ------------------ Evaluation ------------------
def evaluate_state(cards: List[Dict], game_stats: Dict) -> int:
    """
    Simple evaluation: AI wants lower bullheads than player.
    In 6-nimmt, score = number of bullheads collected (less is better).
    """
    return game_stats.get("playerScore", 0) - game_stats.get("aiScore", 0)


# ------------------ Get AI Possible Moves ------------------
def get_ai_moves(cards: List[Dict]) -> List[Tuple[int, int]]:
    """
    Returns all possible moves for AI.
    AI hand is all cards with rowNumber == 0.
    Can be placed in board rows 1-4.
    Each move is (card_index, target_row)
    """
    moves = []
    for i, card in enumerate(cards):
        if card["rowNumber"] == 0:  # AI hand
            for row in range(1, 5):  # board rows
                moves.append((i, row))
    return moves


# ------------------ Apply Move ------------------
def apply_move(cards: List[Dict], move: Tuple[int, int], is_ai: bool = True) -> List[Dict]:
    """
    Apply a move. If placing 6th card in row, move cards to bullhead stack.
    """
    i, target_row = move
    new_cards = copy.deepcopy(cards)

    # Get cards in target row
    row_cards = [c for c in new_cards if c["rowNumber"] == target_row]

    if len(row_cards) >= 5:  # 6th card triggers bullhead stack
        for c in row_cards:
            c["rowNumber"] = 0 if is_ai else 5  # move row cards to player's/AI's bullhead stack
            c["isInBullHeadStack"] = True

    # Place the chosen card
    new_cards[i]["rowNumber"] = target_row
    new_cards[i]["isFlipped"] = False
    new_cards[i]["isInBullHeadStack"] = False  # reset if previously flagged

    return new_cards


# ------------------ Simulate Game ------------------
def simulate_game(cards: List[Dict], game_stats: Dict) -> Dict:
    """
    Update scores based on bullhead stacks.
    AI score = number of bullheads in AI stack
    Player score = number of bullheads in player stack
    """
    new_stats = copy.deepcopy(game_stats)

    new_stats["aiScore"] = sum(1 for c in cards if c["isInBullHeadStack"] and c["rowNumber"] == 0)
    new_stats["playerScore"] = sum(1 for c in cards if c["isInBullHeadStack"] and c["rowNumber"] == 5)

    return new_stats


# ------------------ Minimal Minimax ------------------
def minimax(cards: List[Dict], game_stats: Dict, depth: int = 1) -> int:
    """
    Returns evaluation score for this branch.
    Only 1-depth minimax for simplicity.
    """
    moves = get_ai_moves(cards)
    if not moves:
        return evaluate_state(cards, game_stats)

    best_score = -float("inf")
    for move in moves:
        new_cards = apply_move(cards, move, is_ai=True)
        new_stats = simulate_game(new_cards, game_stats)
        score = evaluate_state(new_cards, new_stats)
        best_score = max(best_score, score)
    return best_score


# ------------------ Get Best AI Move ------------------
def get_best_move(cards: List[Dict], game_stats: Dict) -> Tuple[List[Dict], Dict, Tuple[int, int]]:
    best_move = None
    best_score = -float("inf")
    for move in get_ai_moves(cards):
        new_cards = apply_move(cards, move, is_ai=True)
        new_stats = simulate_game(new_cards, game_stats)
        score = evaluate_state(new_cards, new_stats)
        if score > best_score:
            best_score = score
            best_move = move

    if best_move is None:
        return cards, game_stats, None

    final_cards = apply_move(cards, best_move, is_ai=True)
    final_stats = simulate_game(final_cards, game_stats)
    final_stats["playerTurn"] = True  # switch turn back to player

    return final_cards, final_stats, best_move


import random

def infer_transaction_intent(buyer: str, seller: str, value: float) -> dict:
    """
    Infers the likely purpose of a blockchain transaction using heuristics.
    Returns a dictionary with intent, confidence score, and reasoning.
    """

    # Predefined possible intents
    intents = [
        "payment_for_goods_or_services",
        "exchange_swap",
        "smart_contract_interaction",
        "transfer_between_wallets",
        "donation",
        "NFT_purchase",
        "DEX_liquidity_move",
        "gambling",
        "loan_repayment",
        "phishing_suspected"
    ]

    # Simulated heuristics (you can replace with on-chain queries)
    reasons = []

    # Heuristic 1: Same buyer/seller cluster → likely self-transfer or rebalancing
    if buyer[:6] == seller[:6]:  # simplistic clustering heuristic
        reasons.append("Buyer and seller have similar wallet prefixes (likely self-transfer)")
        intent = "transfer_between_wallets"
        confidence = 0.85

    # Heuristic 2: Low value transaction
    elif value < 0.01:
        reasons.append("Transaction value is very low")
        intent = "donation" if random.random() < 0.5 else "phishing_suspected"
        confidence = 0.65 if intent == "donation" else 0.75

    # Heuristic 3: Clean round numbers (like 1.00, 5.00, etc.)
    elif round(value, 2) in [1.0, 5.0, 10.0, 100.0]:
        reasons.append("Transaction value is a clean round number")
        intent = "payment_for_goods_or_services"
        confidence = 0.78

    # Heuristic 4: NFT price range
    elif 0.05 <= value <= 2.5:
        reasons.append("Transaction value falls in common NFT pricing range")
        intent = "NFT_purchase"
        confidence = 0.7

    # Heuristic 5: High value spikes
    elif value > 1000:
        reasons.append("Transaction value is unusually high")
        intent = "loan_repayment"
        confidence = 0.8

    # Heuristic 6: Random fallback
    else:
        intent = random.choice(intents)
        confidence = round(random.uniform(0.4, 0.7), 2)
        reasons.append("No strong heuristics matched — inferred from fallback model")

    return {
        "intent": intent,
        "confidence": round(confidence, 2),
        "reasons": reasons
    }


# 🔍 Example usage
if __name__ == "__main__":
    result = infer_transaction_intent("0xabc123...", "0xabc991...", 1.00)
    print("Intent Inference Result:")
    print(result)

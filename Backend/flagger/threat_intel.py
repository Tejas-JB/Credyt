import random

def query_threat_intel(recipient: str, token: str = "ETH") -> dict:
    """
    Simulates threat intelligence lookups for a recipient address and token.
    Replace these stubs with real API calls for production use.
    """

    # 1. Blacklist check (stubbed – can link to Chainabuse, blocklist CSV, etc.)
    blacklisted_wallets = {
        "0xscammer1": "Known phishing scam",
        "0xrugpuller": "Rugpull operator",
        "0xfakecex": "Fake centralized exchange impersonation"
    }

    is_blacklisted = recipient.lower() in blacklisted_wallets
    blacklist_reason = blacklisted_wallets.get(recipient.lower(), None)

    # 2. Contract flag (based on known bad contract types – stubbed)
    contract_flags = ["proxy_contract", "flashloan_exploiter", "honeypot_trigger"]
    contract_flag = random.choice(contract_flags) if random.random() < 0.3 else None

    # 3. Token-level risk score and rugpull flag (stubbed)
    token_rugpull_flag = random.random() < 0.1  # ~10% chance
    token_risk_score = round(random.uniform(0.1, 1.0), 2) if token_rugpull_flag else round(random.uniform(0.0, 0.3), 2)

    # 4. Etherscan labels (fake for now – can use real API)
    etherscan_labels = ["Fake USDT", "Suspicious Mixer", "Wallet Drainer", "None"]
    etherscan_label = random.choice(etherscan_labels)

    # 5. Overall threat score computation (weighted logic)
    threat_score = 0.0
    if is_blacklisted:
        threat_score += 0.5
    if contract_flag:
        threat_score += 0.2
    if token_rugpull_flag:
        threat_score += 0.2
    if etherscan_label != "None":
        threat_score += 0.1

    return {
        "is_blacklisted_wallet": is_blacklisted,
        "blacklist_reason": blacklist_reason,
        "contract_flag": contract_flag,
        "token_risk_score": token_risk_score,
        "token_rugpull_flag": token_rugpull_flag,
        "etherscan_label": etherscan_label,
        "threat_score": round(threat_score, 2)
    }

# 🔍 Example usage (for test or demo)
if __name__ == "__main__":
    test_result = query_threat_intel("0xscammer1", "USDT")
    print("Threat Intel Result:")
    print(test_result)

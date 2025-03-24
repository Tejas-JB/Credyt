import os
import json
import numpy as np
from datetime import datetime

# Folder to store transaction JSON files
OUTPUT_DIR = "transactions"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def extract_and_save_features(transaction: dict, wallet_history: dict = None):
    tx_id = transaction.get("tx_id", f"tx_{datetime.now().timestamp()}")
    sender = transaction["sender"]
    recipient = transaction["recipient"]
    value = transaction["value"]
    gas = transaction["gas"]
    timestamp = transaction.get("timestamp", int(datetime.now().timestamp()))

    # Mock/stub feature extraction
    contract_type = "contract"
    ens = None
    cluster_risk = np.random.uniform(0.0, 1.0)
    sender_age = np.random.randint(1, 1000)
    recipient_age = np.random.randint(1, 1000)
    interaction_freq = wallet_history.get(recipient, 0) if wallet_history else 0
    avg_tx_value = wallet_history.get("avg_tx_value", 1) if wallet_history else 1
    avg_gas = wallet_history.get("avg_gas", 21000) if wallet_history else 21000
    time_deviation = 1 if datetime.fromtimestamp(timestamp).hour < 4 or datetime.fromtimestamp(timestamp).hour > 23 else 0
    gas_volatility = abs(gas - avg_gas) / avg_gas
    token_hygiene = np.random.uniform(0.0, 1.0)
    contract_similarity = np.random.uniform(0.0, 1.0)
    value_ratio = value / avg_tx_value

    features = {
        "recipient_contract_type": contract_type,
        "recipient_ens": ens,
        "recipient_cluster_risk": cluster_risk,
        "wallet_age_days": sender_age,
        "recipient_age_days": recipient_age,
        "value_to_avg_ratio": value_ratio,
        "interaction_frequency": interaction_freq,
        "recipient_token_hygiene": token_hygiene,
        "contract_code_similarity_score": contract_similarity,
        "gas_volatility_score": gas_volatility,
        "tx_time_deviation": time_deviation
    }

    output = {
        "tx_id": tx_id,
        "sender": sender,
        "recipient": recipient,
        "features": features
    }

    file_path = os.path.join(OUTPUT_DIR, f"{tx_id}.json")
    with open(file_path, "w") as f:
        json.dump(output, f, indent=2)

    print(f"✅ Saved extracted features to: {file_path}")
    return file_path

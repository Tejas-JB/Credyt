# test_all_modules.py

from feature_extract import extract_and_save_features
from threat_intel import query_threat_intel
from intent import infer_transaction_intent
import json
from datetime import datetime

# Sample transaction
sample_tx = {
    "tx_id": "0x123test",
    "sender": "0xabc001...",
    "recipient": "0xabc991...",
    "value": 1.25,
    "gas": 21000,
    "timestamp": int(datetime.now().timestamp())
}

wallet_history = {
    "avg_tx_value": 0.5,
    "avg_gas": 21000,
    "0xabc991...": 2
}

# Run feature extraction
print("\n🔍 Feature Extraction")
feature_path = extract_and_save_features(sample_tx, wallet_history)

# Load feature output
with open(feature_path) as f:
    features = json.load(f)
print(json.dumps(features, indent=2))

# Run threat intel
print("\n🛡 Threat Intelligence")
threat_result = query_threat_intel(sample_tx["recipient"])
print(json.dumps(threat_result, indent=2))

# Run intent inference
print("\n🧠 Intent Inference")
intent_result = infer_transaction_intent(sample_tx["sender"], sample_tx["recipient"], sample_tx["value"])
print(json.dumps(intent_result, indent=2))

import os
import pickle
import numpy as np
import json
from datetime import datetime

from feature_extract import extract_and_save_features
from threat_intel import query_threat_intel
from intent import infer_transaction_intent

# 📂 Dynamic paths to model and scaler
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "isolation_fraud_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "scaler.pkl")

# ✅ Load model and scaler
with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

with open(SCALER_PATH, "rb") as f:
    scaler = pickle.load(f)

# 💸 Simulate a new transaction
sample_tx = {
    "tx_id": "0xTEST123",
    "sender": "0xabc111...",
    "recipient": "0xabc999...",
    "value": 1.8,
    "gas": 21000,
    "timestamp": int(datetime.now().timestamp())
}

wallet_history = {
    "avg_tx_value": 0.6,
    "avg_gas": 21000,
    "0xabc999...": 3
}

# 🔍 Step 1: Feature extraction
feature_path = extract_and_save_features(sample_tx, wallet_history)
with open(feature_path) as f:
    features = json.load(f)["features"]

# 🛡 Step 2: Threat intel
threat = query_threat_intel(sample_tx["recipient"])

# 🧠 Step 3: Intent inference
intent = infer_transaction_intent(sample_tx["sender"], sample_tx["recipient"], sample_tx["value"])

# 🔗 Step 4: Merge all features into one vector
vector = [
    features["wallet_age_days"],
    features["recipient_age_days"],
    features["value_to_avg_ratio"],
    features["interaction_frequency"],
    features["recipient_token_hygiene"],
    features["contract_code_similarity_score"],
    features["gas_volatility_score"],
    features["tx_time_deviation"],
    features["recipient_cluster_risk"],
    threat["threat_score"],
    intent["confidence"]
]

# 🧠 Step 5: Predict anomaly score
X = scaler.transform([vector])
anomaly_score = model.decision_function(X)[0]  # higher is safer
fraud_probability = round(1 - (anomaly_score + 0.5), 3)  # normalized

# 🚨 Final verdict
print("\n🚨 Fraud Risk Assessment")
print(f"Fraud Probability: {fraud_probability}")
if fraud_probability > 0.7:
    print("⚠️ HIGH RISK: Flag for review")
elif fraud_probability > 0.4:
    print("🟠 MEDIUM RISK: Monitor closely")
else:
    print("🟢 LOW RISK: Looks normal")

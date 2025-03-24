import pandas as pd
import pickle
import numpy as np

# Create 20 diverse test cases
test_inputs = [
    # 1. New user with low activity
    {
        'wallet_age': 60,
        'transaction_volume_total': 5000,
        'transaction_count': 25,
        'active_days': 30,
        'average_tx_value': 200,
        'gas_spent_total': 3000,
        'tokens_held': 5,
        'DEX_activity_count': 10,
        'contract_interactions': 8,
        'NFT_activity': 2,
        'liquidation_events': 0,
        'scam_interaction_count': 0,
        'failed_transaction_count': 3,
        'eth_ratio': 0.80,
        'btc_ratio': 0.15,
        'nft_ratio': 0.05,
        'nft_collection_diversity': 1,
        'average_eth_holding_age': 45,
        'average_btc_holding_age': 30,
        'predicted_holding_duration': 60
    },
    
    # 2. Average user with balanced portfolio
    {
        'wallet_age': 250,
        'transaction_volume_total': 40000,
        'transaction_count': 300,
        'active_days': 200,
        'average_tx_value': 800,
        'gas_spent_total': 25000,
        'tokens_held': 22,
        'DEX_activity_count': 70,
        'contract_interactions': 50,
        'NFT_activity': 15,
        'liquidation_events': 0,
        'scam_interaction_count': 1,
        'failed_transaction_count': 4,
        'eth_ratio': 0.45,
        'btc_ratio': 0.35,
        'nft_ratio': 0.20,
        'nft_collection_diversity': 5,
        'average_eth_holding_age': 120,
        'average_btc_holding_age': 180,
        'predicted_holding_duration': 150
    },
    
    # 3. Experienced trader with high activity
    {
        'wallet_age': 800,
        'transaction_volume_total': 95000,
        'transaction_count': 700,
        'active_days': 450,
        'average_tx_value': 1500,
        'gas_spent_total': 40000,
        'tokens_held': 35,
        'DEX_activity_count': 150,
        'contract_interactions': 180,
        'NFT_activity': 30,
        'liquidation_events': 0,
        'scam_interaction_count': 0,
        'failed_transaction_count': 6,
        'eth_ratio': 0.40,
        'btc_ratio': 0.40,
        'nft_ratio': 0.20,
        'nft_collection_diversity': 12,
        'average_eth_holding_age': 250,
        'average_btc_holding_age': 300,
        'predicted_holding_duration': 280
    },
    
    # 4. NFT collector
    {
        'wallet_age': 400,
        'transaction_volume_total': 30000,
        'transaction_count': 350,
        'active_days': 280,
        'average_tx_value': 600,
        'gas_spent_total': 28000,
        'tokens_held': 12,
        'DEX_activity_count': 30,
        'contract_interactions': 120,
        'NFT_activity': 45,
        'liquidation_events': 0,
        'scam_interaction_count': 1,
        'failed_transaction_count': 8,
        'eth_ratio': 0.30,
        'btc_ratio': 0.10,
        'nft_ratio': 0.60,
        'nft_collection_diversity': 18,
        'average_eth_holding_age': 180,
        'average_btc_holding_age': 150,
        'predicted_holding_duration': 200
    },
    
    # 5. Long-term holder
    {
        'wallet_age': 900,
        'transaction_volume_total': 25000,
        'transaction_count': 120,
        'active_days': 300,
        'average_tx_value': 1200,
        'gas_spent_total': 15000,
        'tokens_held': 8,
        'DEX_activity_count': 20,
        'contract_interactions': 35,
        'NFT_activity': 5,
        'liquidation_events': 0,
        'scam_interaction_count': 0,
        'failed_transaction_count': 2,
        'eth_ratio': 0.60,
        'btc_ratio': 0.35,
        'nft_ratio': 0.05,
        'nft_collection_diversity': 2,
        'average_eth_holding_age': 350,
        'average_btc_holding_age': 400,
        'predicted_holding_duration': 365
    },
    
    # 6. High-risk trader with liquidations
    {
        'wallet_age': 180,
        'transaction_volume_total': 70000,
        'transaction_count': 500,
        'active_days': 150,
        'average_tx_value': 1000,
        'gas_spent_total': 30000,
        'tokens_held': 28,
        'DEX_activity_count': 180,
        'contract_interactions': 150,
        'NFT_activity': 10,
        'liquidation_events': 2,
        'scam_interaction_count': 1,
        'failed_transaction_count': 15,
        'eth_ratio': 0.35,
        'btc_ratio': 0.45,
        'nft_ratio': 0.20,
        'nft_collection_diversity': 4,
        'average_eth_holding_age': 60,
        'average_btc_holding_age': 90,
        'predicted_holding_duration': 45
    },
    
    # 7. New but active trader
    {
        'wallet_age': 90,
        'transaction_volume_total': 50000,
        'transaction_count': 450,
        'active_days': 80,
        'average_tx_value': 700,
        'gas_spent_total': 22000,
        'tokens_held': 25,
        'DEX_activity_count': 130,
        'contract_interactions': 100,
        'NFT_activity': 8,
        'liquidation_events': 1,
        'scam_interaction_count': 0,
        'failed_transaction_count': 10,
        'eth_ratio': 0.50,
        'btc_ratio': 0.30,
        'nft_ratio': 0.20,
        'nft_collection_diversity': 3,
        'average_eth_holding_age': 40,
        'average_btc_holding_age': 35,
        'predicted_holding_duration': 70
    },
    
    # 8. Victim of multiple scams
    {
        'wallet_age': 150,
        'transaction_volume_total': 15000,
        'transaction_count': 100,
        'active_days': 100,
        'average_tx_value': 500,
        'gas_spent_total': 10000,
        'tokens_held': 15,
        'DEX_activity_count': 40,
        'contract_interactions': 60,
        'NFT_activity': 12,
        'liquidation_events': 0,
        'scam_interaction_count': 4,
        'failed_transaction_count': 12,
        'eth_ratio': 0.40,
        'btc_ratio': 0.30,
        'nft_ratio': 0.30,
        'nft_collection_diversity': 6,
        'average_eth_holding_age': 80,
        'average_btc_holding_age': 60,
        'predicted_holding_duration': 90
    },
    
    # 9. DeFi power user
    {
        'wallet_age': 500,
        'transaction_volume_total': 85000,
        'transaction_count': 600,
        'active_days': 350,
        'average_tx_value': 1100,
        'gas_spent_total': 38000,
        'tokens_held': 40,
        'DEX_activity_count': 190,
        'contract_interactions': 200,
        'NFT_activity': 20,
        'liquidation_events': 1,
        'scam_interaction_count': 0,
        'failed_transaction_count': 5,
        'eth_ratio': 0.50,
        'btc_ratio': 0.25,
        'nft_ratio': 0.25,
        'nft_collection_diversity': 8,
        'average_eth_holding_age': 200,
        'average_btc_holding_age': 180,
        'predicted_holding_duration': 220
    },
    
    # 10. Low activity, high value
    {
        'wallet_age': 600,
        'transaction_volume_total': 60000,
        'transaction_count': 80,
        'active_days': 250,
        'average_tx_value': 1800,
        'gas_spent_total': 8000,
        'tokens_held': 10,
        'DEX_activity_count': 15,
        'contract_interactions': 25,
        'NFT_activity': 10,
        'liquidation_events': 0,
        'scam_interaction_count': 0,
        'failed_transaction_count': 1,
        'eth_ratio': 0.70,
        'btc_ratio': 0.25,
        'nft_ratio': 0.05,
        'nft_collection_diversity': 3,
        'average_eth_holding_age': 300,
        'average_btc_holding_age': 280,
        'predicted_holding_duration': 320
    },
    
    # 11. High activity, low value
    {
        'wallet_age': 300,
        'transaction_volume_total': 20000,
        'transaction_count': 550,
        'active_days': 280,
        'average_tx_value': 200,
        'gas_spent_total': 35000,
        'tokens_held': 30,
        'DEX_activity_count': 160,
        'contract_interactions': 180,
        'NFT_activity': 25,
        'liquidation_events': 0,
        'scam_interaction_count': 1,
        'failed_transaction_count': 7,
        'eth_ratio': 0.35,
        'btc_ratio': 0.25,
        'nft_ratio': 0.40,
        'nft_collection_diversity': 10,
        'average_eth_holding_age': 150,
        'average_btc_holding_age': 120,
        'predicted_holding_duration': 160
    },
    
    # 12. High BTC ratio
    {
        'wallet_age': 450,
        'transaction_volume_total': 55000,
        'transaction_count': 320,
        'active_days': 300,
        'average_tx_value': 900,
        'gas_spent_total': 20000,
        'tokens_held': 18,
        'DEX_activity_count': 90,
        'contract_interactions': 70,
        'NFT_activity': 5,
        'liquidation_events': 0,
        'scam_interaction_count': 0,
        'failed_transaction_count': 3,
        'eth_ratio': 0.20,
        'btc_ratio': 0.75,
        'nft_ratio': 0.05,
        'nft_collection_diversity': 2,
        'average_eth_holding_age': 200,
        'average_btc_holding_age': 350,
        'predicted_holding_duration': 280
    },
    
    # 13. Whale account
    {
        'wallet_age': 950,
        'transaction_volume_total': 98000,
        'transaction_count': 800,
        'active_days': 480,
        'average_tx_value': 1900,
        'gas_spent_total': 45000,
        'tokens_held': 45,
        'DEX_activity_count': 180,
        'contract_interactions': 220,
        'NFT_activity': 40,
        'liquidation_events': 0,
        'scam_interaction_count': 0,
        'failed_transaction_count': 2,
        'eth_ratio': 0.60,
        'btc_ratio': 0.30,
        'nft_ratio': 0.10,
        'nft_collection_diversity': 15,
        'average_eth_holding_age': 300,
        'average_btc_holding_age': 350,
        'predicted_holding_duration': 330
    },
    
    # 14. NFT flipper
    {
        'wallet_age': 200,
        'transaction_volume_total': 35000,
        'transaction_count': 400,
        'active_days': 180,
        'average_tx_value': 600,
        'gas_spent_total': 32000,
        'tokens_held': 15,
        'DEX_activity_count': 50,
        'contract_interactions': 150,
        'NFT_activity': 35,
        'liquidation_events': 0,
        'scam_interaction_count': 2,
        'failed_transaction_count': 10,
        'eth_ratio': 0.40,
        'btc_ratio': 0.10,
        'nft_ratio': 0.50,
        'nft_collection_diversity': 22,
        'average_eth_holding_age': 120,
        'average_btc_holding_age': 90,
        'predicted_holding_duration': 110
    },
    
    # 15. Dormant account with history
    {
        'wallet_age': 700,
        'transaction_volume_total': 18000,
        'transaction_count': 150,
        'active_days': 100,
        'average_tx_value': 700,
        'gas_spent_total': 7000,
        'tokens_held': 8,
        'DEX_activity_count': 20,
        'contract_interactions': 30,
        'NFT_activity': 10,
        'liquidation_events': 0,
        'scam_interaction_count': 0,
        'failed_transaction_count': 2,
        'eth_ratio': 0.55,
        'btc_ratio': 0.35,
        'nft_ratio': 0.10,
        'nft_collection_diversity': 3,
        'average_eth_holding_age': 400,
        'average_btc_holding_age': 380,
        'predicted_holding_duration': 390
    },
    
    # 16. Multiple liquidations
    {
        'wallet_age': 220,
        'transaction_volume_total': 65000,
        'transaction_count': 550,
        'active_days': 200,
        'average_tx_value': 850,
        'gas_spent_total': 30000,
        'tokens_held': 30,
        'DEX_activity_count': 170,
        'contract_interactions': 160,
        'NFT_activity': 15,
        'liquidation_events': 3,
        'scam_interaction_count': 1,
        'failed_transaction_count': 18,
        'eth_ratio': 0.30,
        'btc_ratio': 0.40,
        'nft_ratio': 0.30,
        'nft_collection_diversity': 7,
        'average_eth_holding_age': 90,
        'average_btc_holding_age': 100,
        'predicted_holding_duration': 70
    },
    
    # 17. Trader with many failed transactions
    {
        'wallet_age': 150,
        'transaction_volume_total': 30000,
        'transaction_count': 280,
        'active_days': 120,
        'average_tx_value': 600,
        'gas_spent_total': 18000,
        'tokens_held': 20,
        'DEX_activity_count': 90,
        'contract_interactions': 80,
        'NFT_activity': 10,
        'liquidation_events': 0,
        'scam_interaction_count': 1,
        'failed_transaction_count': 25,
        'eth_ratio': 0.45,
        'btc_ratio': 0.35,
        'nft_ratio': 0.20,
        'nft_collection_diversity': 5,
        'average_eth_holding_age': 100,
        'average_btc_holding_age': 80,
        'predicted_holding_duration': 120
    },
    
    # 18. High diversity, balanced account
    {
        'wallet_age': 350,
        'transaction_volume_total': 45000,
        'transaction_count': 380,
        'active_days': 280,
        'average_tx_value': 800,
        'gas_spent_total': 28000,
        'tokens_held': 38,
        'DEX_activity_count': 100,
        'contract_interactions': 120,
        'NFT_activity': 25,
        'liquidation_events': 0,
        'scam_interaction_count': 0,
        'failed_transaction_count': 5,
        'eth_ratio': 0.33,
        'btc_ratio': 0.33,
        'nft_ratio': 0.34,
        'nft_collection_diversity': 14,
        'average_eth_holding_age': 180,
        'average_btc_holding_age': 200,
        'predicted_holding_duration': 190
    },
    
    # 19. New user with high value
    {
        'wallet_age': 80,
        'transaction_volume_total': 25000,
        'transaction_count': 70,
        'active_days': 50,
        'average_tx_value': 1500,
        'gas_spent_total': 5000,
        'tokens_held': 8,
        'DEX_activity_count': 15,
        'contract_interactions': 20,
        'NFT_activity': 5,
        'liquidation_events': 0,
        'scam_interaction_count': 0,
        'failed_transaction_count': 3,
        'eth_ratio': 0.70,
        'btc_ratio': 0.25,
        'nft_ratio': 0.05,
        'nft_collection_diversity': 2,
        'average_eth_holding_age': 60,
        'average_btc_holding_age': 50,
        'predicted_holding_duration': 120
    },
    
    # 20. Average user with scam history
    {
        'wallet_age': 280,
        'transaction_volume_total': 35000,
        'transaction_count': 320,
        'active_days': 220,
        'average_tx_value': 700,
        'gas_spent_total': 22000,
        'tokens_held': 25,
        'DEX_activity_count': 85,
        'contract_interactions': 90,
        'NFT_activity': 18,
        'liquidation_events': 0,
        'scam_interaction_count': 3,
        'failed_transaction_count': 8,
        'eth_ratio': 0.40,
        'btc_ratio': 0.30,
        'nft_ratio': 0.30,
        'nft_collection_diversity': 7,
        'average_eth_holding_age': 140,
        'average_btc_holding_age': 160,
        'predicted_holding_duration': 170
    }
]

# Convert to DataFrame
df = pd.DataFrame(test_inputs)

# Load the model
try:
    with open("xgboost_credit_model.pkl", "rb") as f:
        loaded_data = pickle.load(f)
    
    # Check if the loaded object is already the model (old format) or a dictionary (new format)
    if hasattr(loaded_data, 'predict'):
        # This is just the model
        model = loaded_data
        # We don't have a scaler in this case, so we'll use the data as-is
        df_scaled = df.values
        expected_features = None
    else:
        # This is a dictionary with model, scaler, etc.
        model = loaded_data['model']
        scaler = loaded_data['scaler']
        expected_features = list(loaded_data['feature_names']) if 'feature_names' in loaded_data else None
        
        # If we have stored feature names, ensure columns match
        if expected_features:
            # Check for missing features
            missing_features = set(expected_features) - set(df.columns)
            if missing_features:
                print(f"Warning: Missing features: {missing_features}")
                for feature in missing_features:
                    df[feature] = 0  # Add with default value
            
            # Reorder columns to match training order
            df = df[expected_features]
        
        # Scale the features
        df_scaled = scaler.transform(df)
        
except Exception as e:
    print(f"Error loading model: {e}")
    raise

# Predict
predictions = model.predict(df_scaled)

# Display results with profile descriptions
profile_descriptions = [
    "New user with low activity",
    "Average user with balanced portfolio",
    "Experienced trader with high activity",
    "NFT collector",
    "Long-term holder",
    "High-risk trader with liquidations",
    "New but active trader",
    "Victim of multiple scams",
    "DeFi power user",
    "Low activity, high value",
    "High activity, low value",
    "High BTC ratio",
    "Whale account",
    "NFT flipper",
    "Dormant account with history",
    "Multiple liquidations",
    "Trader with many failed transactions",
    "High diversity, balanced account",
    "New user with high value",
    "Average user with scam history"
]

# Display results
print("\n=== CREDIT SCORE PREDICTIONS ===\n")
for i, (prediction, profile) in enumerate(zip(predictions, test_inputs)):
    print(f"Profile {i+1}: {profile_descriptions[i]}")
    print(f"Predicted credit score: {prediction:.2f}")
    print("-" * 50)
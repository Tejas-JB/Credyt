import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
from sklearn.preprocessing import MinMaxScaler
from token_duration_predictor import TokenHoldingDurationPredictor
import pickle

# Instead of generating data, load existing synthetic data
df = pd.read_csv("synthetic_credit_data.csv")
print("Loaded existing synthetic credit data")

# Load and initialize the duration predictor
duration_predictor = TokenHoldingDurationPredictor.load_model('trained_token_duration_model.joblib')

# Predict holding durations for all records
duration_features = df[['eth_ratio', 'btc_ratio', 'nft_ratio', 
                       'nft_collection_diversity', 'average_eth_holding_age', 
                       'average_btc_holding_age']]
df['predicted_holding_duration'] = duration_predictor.predict(duration_features)

# Check that the credit_score column exists
if 'credit_score' not in df.columns:
    raise ValueError("CSV must include a 'credit_score' column.")

# Split into features (X) and target (y)
X = df.drop(columns=['credit_score'])
y = df['credit_score']

# Normalize features
scaler = MinMaxScaler()
X_scaled = scaler.fit_transform(X)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# Train the XGBoost model
model = xgb.XGBRegressor(objective='reg:squarederror', max_depth=5, n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Predict and evaluate
preds = model.predict(X_test)
mse = mean_squared_error(y_test, preds)
print(f"\n✅ Model trained successfully!")
print(f"📉 Test Mean Squared Error: {mse:.2f}")

# Save the trained model
import pickle

# Create a dictionary containing the model, scaler, and feature names
model_data = {
    'model': model,
    'scaler': scaler,
    'feature_names': list(X.columns)  # Save feature names used for training
}

# Save everything to a pickle file
with open("xgboost_credit_model.pkl", "wb") as f:
    pickle.dump(model_data, f)

print("💾 Model and preprocessing components saved to 'xgboost_credit_model.pkl'")
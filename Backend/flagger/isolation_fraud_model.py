import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import pickle

# Load the dataset
df = pd.read_csv("fraud_detection_data.csv")

# Separate features (remove the label, since it's unsupervised)
X = df.drop(columns=["is_fraud"])

# Standardize the features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Train the Isolation Forest model
model = IsolationForest(
    n_estimators=100,
    contamination=0.05,  # expected % of frauds
    max_samples='auto',
    random_state=42
)
model.fit(X_scaled)

# Save the model
with open("isolation_fraud_model.pkl", "wb") as f:
    pickle.dump(model, f)

# Save the scaler
with open("scaler.pkl", "wb") as f:
    pickle.dump(scaler, f)

print("✅ Isolation Forest model and scaler saved successfully.")

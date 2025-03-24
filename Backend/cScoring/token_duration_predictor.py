import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import joblib

class TokenHoldingDurationPredictor:
    def __init__(self, n_estimators=100, max_depth=10, random_state=42):
        """Initialize the predictor with customizable parameters."""
        self.model = RandomForestRegressor(
            n_estimators=n_estimators,
            max_depth=max_depth,
            random_state=random_state
        )
        self.scaler = StandardScaler()
        self.feature_columns = [
            'eth_ratio',
            'btc_ratio',
            'nft_ratio',
            'nft_collection_diversity',
            'average_eth_holding_age',
            'average_btc_holding_age'
        ]
    
    def prepare_features(self, data):
        """Prepare and validate features for the model."""
        missing_columns = set(self.feature_columns) - set(data.columns)
        if missing_columns:
            raise ValueError(f"Missing required columns: {missing_columns}")
        
        # Validate that ratios sum to approximately 1
        total_ratio = data['eth_ratio'] + data['btc_ratio'] + data['nft_ratio']
        if not np.allclose(total_ratio, 1.0, atol=0.01):
            raise ValueError("Portfolio ratios (eth_ratio + btc_ratio + nft_ratio) must sum to 1.0")
        
        return data[self.feature_columns]
    
    def train(self, X, y):
        """Train the model and return performance metrics."""
        X_scaled = self.scaler.fit_transform(X)
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42
        )
        
        self.model.fit(X_train, y_train)
        y_pred = self.model.predict(X_test)
        
        # Calculate feature importance
        feature_importance = pd.DataFrame({
            'feature': self.feature_columns,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        metrics = {
            'mse': mean_squared_error(y_test, y_pred),
            'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
            'r2': r2_score(y_test, y_pred),
            'test_predictions': y_pred,
            'test_actual': y_test,
            'feature_importance': feature_importance
        }
        
        return metrics
    
    def predict(self, X):
        """Make predictions for new data."""
        if not isinstance(X, pd.DataFrame):
            raise ValueError("Input must be a pandas DataFrame")
            
        X = self.prepare_features(X)
        X_scaled = self.scaler.transform(X)
        return self.model.predict(X_scaled)
    
    def save_model(self, filepath):
        """Save the trained model to a file."""
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'feature_columns': self.feature_columns
        }
        joblib.dump(model_data, filepath)
    
    @classmethod
    def load_model(cls, filepath):
        """Load a trained model from a file."""
        model_data = joblib.load(filepath)
        instance = cls()
        instance.model = model_data['model']
        instance.scaler = model_data['scaler']
        instance.feature_columns = model_data['feature_columns']
        return instance
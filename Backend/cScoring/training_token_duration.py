import pandas as pd
import numpy as np
from token_duration_predictor import TokenHoldingDurationPredictor
import matplotlib.pyplot as plt
import seaborn as sns

def train_model_with_synthetic_data():
    # Load the synthetic dataset
    data = pd.read_csv('portfolio_training_data.csv')
    
    # Split features and target
    X = data.drop('holding_duration', axis=1)
    y = data['holding_duration']
    
    # Initialize and train the model
    predictor = TokenHoldingDurationPredictor(
        n_estimators=200,
        max_depth=15,
        random_state=42
    )
    
    # Train and get metrics
    metrics = predictor.train(X, y)
    
    # Print training results
    print("\nModel Training Results:")
    print(f"Root Mean Square Error: {metrics['rmse']:.2f} days")
    print(f"R² Score: {metrics['r2']:.3f}")
    
    # Display feature importance
    importance_df = metrics['feature_importance']
    print("\nFeature Importance:")
    print(importance_df)
    
    # Create feature importance plot
    plt.figure(figsize=(10, 6))
    sns.barplot(x='importance', y='feature', data=importance_df)
    plt.title('Feature Importance in Predicting Holding Duration')
    plt.xlabel('Importance Score')
    plt.tight_layout()
    plt.savefig('feature_importance.png')
    
    # Make some example predictions
    print("\nExample Predictions:")
    sample_portfolios = pd.DataFrame({
        'eth_ratio': [0.5, 0.3, 0.6],
        'btc_ratio': [0.3, 0.5, 0.2],
        'nft_ratio': [0.2, 0.2, 0.2],
        'nft_collection_diversity': [5, 3, 8],
        'average_eth_holding_age': [120, 90, 180],
        'average_btc_holding_age': [180, 160, 220]
    })
    
    predictions = predictor.predict(sample_portfolios)
    
    example_results = pd.DataFrame({
        'Portfolio Type': ['Balanced', 'BTC Heavy', 'ETH Heavy'],
        'Predicted Holding Duration (days)': predictions.round(2)
    })
    print(example_results)
    
    # Save the trained model
    predictor.save_model('trained_token_duration_model.joblib')
    
    return predictor, metrics

if __name__ == "__main__":
    predictor, metrics = train_model_with_synthetic_data()

# Test the model with a sample prediction
sample_portfolio = pd.DataFrame({
    'eth_ratio': [0.45],
    'btc_ratio': [0.35],
    'nft_ratio': [0.20],
    'nft_collection_diversity': [5],
    'average_eth_holding_age': [120],
    'average_btc_holding_age': [180]
})

prediction = predictor.predict(sample_portfolio)
print("\nSample Prediction:")
print(f"Predicted holding duration: {prediction[0]:.2f} days")
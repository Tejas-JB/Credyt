from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
import sys
import os
import json
from pathlib import Path

# Credit score response model
class CreditScoreResponse(BaseModel):
    score: int
    maxScore: int
    factors: dict
    lastUpdated: str

# Router
router = APIRouter()

@router.get("/credit-score", response_model=CreditScoreResponse)
async def get_credit_score(wallet: str = Query(..., description="The wallet address to check")):
    """
    Calculate and return a credit score for the provided wallet address.
    """
    if not wallet or len(wallet) < 10:
        raise HTTPException(status_code=400, detail="Invalid wallet address")
    
    try:
        # Mock implementation - no ML model needed
        # Calculate a deterministic score based on wallet address
        address_hash = hash(wallet) % 350
        score = 500 + address_hash
        
        # Features for this wallet (mock data)
        features = {
            'wallet_address': wallet,
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
            'failed_transaction_count': 4
        }
        
        # Generate response factors
        positive_factors = []
        negative_factors = []
        
        # Positive factors
        positive_factors.append("Wallet has significant age (250 days)")
        positive_factors.append("Active transaction history (300 transactions)")
        positive_factors.append("Diverse token portfolio (22 tokens)")
        positive_factors.append("Significant DEX activity (70 interactions)")
        
        # Negative factors
        if score < 700:
            negative_factors.append("Interaction with suspicious addresses detected")
            negative_factors.append("Higher than average failed transactions")
        
        return CreditScoreResponse(
            score=score,
            maxScore=850,
            factors={
                "positive": positive_factors,
                "negative": negative_factors
            },
            lastUpdated=f"{features['wallet_age']} days ago"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating credit score: {str(e)}") 
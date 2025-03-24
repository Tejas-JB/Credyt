from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Dict

class CreditScoreResponse(BaseModel):
    score: int
    maxScore: int
    factors: Dict[str, List[str]]
    lastUpdated: str

class RiskProfile(BaseModel):
    overallRisk: str
    details: List[str]

class WalletStats(BaseModel):
    age: int
    transactionCount: int
    averageValue: float
    totalVolume: float

class WalletAnalysisResponse(BaseModel):
    creditScore: CreditScoreResponse
    riskProfile: RiskProfile
    walletStats: WalletStats

router = APIRouter()

@router.get("/wallet-analysis", response_model=WalletAnalysisResponse)
async def get_wallet_analysis(wallet: str = Query(..., description="The wallet address to analyze")):
    """
    Provide a comprehensive analysis of a wallet address.
    """
    if not wallet or len(wallet) < 10:
        raise HTTPException(status_code=400, detail="Invalid wallet address")
    
    try:
        # Mock implementation - create mock data for wallet analysis
        # Credit score
        address_hash = hash(wallet) % 350
        score = 500 + address_hash
        
        # Determine credit score factors
        positive_factors = [
            "Long history of responsible transactions",
            "No interactions with known suspicious addresses",
            "Consistent transaction patterns"
        ]
        
        negative_factors = []
        if score < 750:
            negative_factors = [
                "Some interactions with newer protocols",
                "Occasional high-value transactions"
            ]
        
        # Risk profile based on score
        if score > 750:
            risk_level = "low"
            risk_details = [
                "Long history of responsible transactions",
                "No interactions with known suspicious addresses",
                "Consistent transaction patterns"
            ]
        elif score > 650:
            risk_level = "medium"
            risk_details = [
                "Some interactions with newer protocols",
                "Occasional high-value transactions",
                "Moderate token diversity"
            ]
        else:
            risk_level = "high"
            risk_details = [
                "Limited transaction history",
                "Interactions with addresses of concern",
                "Unusual transaction patterns"
            ]
        
        # Wallet stats based on address
        address_num = int(wallet[-4:], 16) if wallet[-4:].isalnum() else 500
        age = 30 + (address_num % 1000)
        transaction_count = 10 + (address_num % 500)
        average_value = 50 + (address_num % 1000)
        total_volume = average_value * transaction_count
        
        return WalletAnalysisResponse(
            creditScore=CreditScoreResponse(
                score=score,
                maxScore=850,
                factors={
                    "positive": positive_factors,
                    "negative": negative_factors
                },
                lastUpdated=f"{age} days ago"
            ),
            riskProfile=RiskProfile(
                overallRisk=risk_level,
                details=risk_details
            ),
            walletStats=WalletStats(
                age=age,
                transactionCount=transaction_count,
                averageValue=average_value,
                totalVolume=total_volume
            )
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing wallet: {str(e)}") 
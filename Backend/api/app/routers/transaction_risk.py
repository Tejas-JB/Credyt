from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

class TransactionRiskRequest(BaseModel):
    sender: str
    recipient: str
    value: float
    token: str = "ETH"

class RiskFeature(BaseModel):
    feature: str
    value: float
    threshold: float

class TransactionRiskResponse(BaseModel):
    riskScore: float
    riskLevel: str
    explanation: List[str]
    flaggedFeatures: Optional[List[RiskFeature]] = None

router = APIRouter()

@router.post("/transaction-risk", response_model=TransactionRiskResponse)
async def analyze_transaction_risk(request: TransactionRiskRequest):
    """
    Analyze the risk level of a cryptocurrency transaction.
    """
    try:
        # Mock implementation - no ML model needed
        # Base risk score on transaction amount and recipient
        recipientRisk = int(request.recipient[-2:], 16) % 100 / 100 if len(request.recipient) >= 2 else 0.5
        amountRisk = min(request.value / 10000, 1)
        riskScore = min((recipientRisk * 0.7 + amountRisk * 0.3) * 100, 100)
        
        # Determine risk level
        if riskScore < 25:
            riskLevel = "low"
        elif riskScore < 50:
            riskLevel = "medium"
        elif riskScore < 75:
            riskLevel = "high"
        else:
            riskLevel = "critical"
        
        # Generate explanation and features
        explanation = []
        flaggedFeatures = []
        
        if request.value > 1000:
            explanation.append("The transaction amount is unusually large")
            flaggedFeatures.append(RiskFeature(
                feature="transaction_value",
                value=request.value,
                threshold=1000
            ))
        
        if recipientRisk > 0.5:
            explanation.append("The recipient address has limited transaction history")
            flaggedFeatures.append(RiskFeature(
                feature="recipient_reputation",
                value=recipientRisk * 100,
                threshold=50
            ))
        
        if riskLevel == "low":
            explanation.append("No significant risk factors detected")
        
        return TransactionRiskResponse(
            riskScore=riskScore,
            riskLevel=riskLevel,
            explanation=explanation,
            flaggedFeatures=flaggedFeatures if flaggedFeatures else None
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing transaction risk: {str(e)}") 
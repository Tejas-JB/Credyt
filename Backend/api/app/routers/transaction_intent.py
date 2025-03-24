from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

class TransactionIntentRequest(BaseModel):
    sender: str
    recipient: str
    value: float

class TransactionIntentResponse(BaseModel):
    intent: str
    confidence: float
    reasons: List[str]

router = APIRouter()

@router.post("/transaction-intent", response_model=TransactionIntentResponse)
async def predict_transaction_intent(request: TransactionIntentRequest):
    """
    Predict the intent behind a cryptocurrency transaction.
    """
    try:
        # Mock implementation - determine intent based on transaction characteristics
        value = request.value
        sender = request.sender
        recipient = request.recipient
        
        # Determine intent based on transaction characteristics
        intent = ""
        confidence = 0.0
        reasons = []
        
        if value < 0.01:
            intent = "gas_fee_payment"
            confidence = 0.92
            reasons.append("Very small transaction amount typical of gas fee payments")
        elif value < 0.1:
            intent = "donation"
            confidence = 0.75
            reasons.append("Small round amount typical of donations")
        elif value > 10 and value % 1 == 0:
            intent = "payment_for_goods_or_services"
            confidence = 0.85
            reasons.append("Clean round number typical of payment for services")
        elif 0.1 <= value <= 5:
            intent = "NFT_purchase"
            confidence = 0.82
            reasons.append("Amount falls within common NFT price range")
        else:
            intent = "transfer_between_wallets"
            confidence = 0.65
            reasons.append("Transaction characteristics suggest a transfer between owned wallets")
        
        # Add a second reason
        if len(sender) > 4 and len(recipient) > 4 and sender[:4] == recipient[:4]:
            reasons.append("Sender and recipient have similar wallet patterns")
            if intent == "transfer_between_wallets":
                confidence += 0.15
        
        return TransactionIntentResponse(
            intent=intent,
            confidence=min(confidence, 0.98),
            reasons=reasons
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error predicting transaction intent: {str(e)}") 
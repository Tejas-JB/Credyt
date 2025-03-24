from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .routers import credit_score, transaction_risk, transaction_intent, wallet_analysis

# Create FastAPI instance
app = FastAPI(
    title="ZKredit API",
    description="API for the ZKredit privacy-preserving trust and risk layer for Web3 wallets",
    version="1.0.0"
)

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://localhost",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(credit_score.router, prefix="/api", tags=["Credit Score"])
app.include_router(transaction_risk.router, prefix="/api", tags=["Transaction Risk"])
app.include_router(transaction_intent.router, prefix="/api", tags=["Transaction Intent"])
app.include_router(wallet_analysis.router, prefix="/api", tags=["Wallet Analysis"])

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to the ZKredit API",
        "version": "1.0.0",
        "documentation": "/docs"
    } 
# ZKredit: A Privacy-Preserving Trust & Risk Layer for Web3 Wallets

ZKredit provides a decentralized, privacy-preserving trust framework that acts as the Web3 equivalent of a credit bureau + fraud detection engine. It can plug into wallets, DeFi protocols, NFT marketplaces, and more.

## Features

- **ZK-Based Credit Scoring System**: Analyzes on-chain behavior and generates creditworthiness scores without exposing any transaction data
- **ML-Powered Transaction Risk Analyzer**: Monitors outgoing transactions and flags suspicious activity in real-time
- **Transaction Intent Prediction**: Automatically determines the purpose of transactions
- **Comprehensive Wallet Analysis**: Get a complete picture of a wallet's reputation and activity

## Project Structure

```
├── Frontend/                # Next.js frontend application
│   ├── app/                 # Application components and pages
│   │   ├── components/      # Reusable components
│   │   ├── utils/           # Utility functions and API client
│   │   └── ...              # Other app directories
│   └── ...                  # Next.js configuration files
│
├── Backend/                 # Python-based backend
│   ├── api/                 # FastAPI server
│   │   ├── app/             # API application
│   │   │   ├── routers/     # API endpoints
│   │   │   └── main.py      # Main application entry point
│   │   └── run.py           # Script to run the API server
│   ├── cScoring/            # Credit scoring ML models
│   └── flagger/             # Transaction risk analysis
└── run_integrated.sh        # Script to run both frontend and backend
```

## Prerequisites

- Node.js 16+
- Python 3.8+
- npm or yarn

## Installation

### Frontend

```bash
cd Frontend
npm install
```

### Backend

```bash
cd Backend/api
pip install -r requirements.txt
```

## Running the Application

### Option 1: Integrated Run

Run both the frontend and backend with a single command:

```bash
./run_integrated.sh
```

### Option 2: Separate Servers

**Backend:**

```bash
cd Backend/api
python run.py
```

The API will be available at http://localhost:8000 with Swagger documentation at http://localhost:8000/docs.

**Frontend:**

```bash
cd Frontend
npm run dev
```

The frontend will be available at http://localhost:3000.

## Development

- The frontend uses a mock API during development if the backend is not running
- The backend includes mock implementations of ML models for development purposes
- Set `NEXT_PUBLIC_API_URL` to point to your backend API when deployed
- Set `NEXT_PUBLIC_USE_MOCK_API=true` to force using mock API even when backend is available

## Features Roadmap

- [ ] Zero-knowledge proof generation for credit score verification
- [ ] Soulbound NFT representation of credit score
- [ ] Integration with DeFi lending protocols
- [ ] User-friendly credit score improvement recommendations
- [ ] Multi-chain support

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
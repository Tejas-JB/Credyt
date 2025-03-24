#!/bin/bash

# Colors for better visualization
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to clean up on exit
cleanup() {
  echo -e "\n${RED}Shutting down services...${NC}"
  kill $FRONTEND_PID $BACKEND_PID 2>/dev/null
  exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Print header
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}   ZKredit Integrated System Launcher    ${NC}"
echo -e "${GREEN}==========================================${NC}"

# Start the backend server
echo -e "${BLUE}Starting backend server...${NC}"
cd Backend/api
# Changed port from 5000 to 8000 to avoid macOS conflicts
python -m uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

# Check if backend started successfully
sleep 3
if ! ps -p $BACKEND_PID > /dev/null; then
  echo -e "${RED}Backend failed to start.${NC}"
  cleanup
fi

echo -e "${GREEN}Backend server running on http://localhost:8000${NC}"
echo -e "${GREEN}API documentation available at http://localhost:8000/docs${NC}"

# Start the frontend server
echo -e "\n${BLUE}Starting frontend server...${NC}"
cd ../../Frontend
npm run dev &
FRONTEND_PID=$!

# Check if frontend started successfully
sleep 5
if ! ps -p $FRONTEND_PID > /dev/null; then
  echo -e "${RED}Frontend failed to start.${NC}"
  cleanup
fi

echo -e "${GREEN}Frontend running on http://localhost:3000${NC}"

# Keep script running to maintain both services
echo -e "\n${GREEN}Both services are running.${NC}"
echo -e "${BLUE}Press Ctrl+C to stop both servers.${NC}"
wait $BACKEND_PID $FRONTEND_PID 
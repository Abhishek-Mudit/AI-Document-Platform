#!/bin/bash

echo "========================================"
echo "AI Document Platform - Quick Start"
echo "========================================"
echo ""

echo "Step 1: Installing Python dependencies..."
cd backend
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

echo ""
echo "Step 2: Starting the server..."
echo ""
echo "Backend will start at: http://localhost:8000"
echo "Frontend will be available at: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python main.py

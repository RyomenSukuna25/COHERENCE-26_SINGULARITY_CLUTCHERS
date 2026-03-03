#!/bin/bash
echo "🚀 Setting up PulsePoint..."

echo "📦 Installing backend dependencies..."
cd backend && pip install -r requirements.txt
python -m spacy download en_core_web_sm

echo "📦 Installing frontend dependencies..."
cd ../frontend && npm install

echo "✅ Setup complete! Run:"
echo "   Backend:  cd backend && uvicorn app.main:app --reload"
echo "   Frontend: cd frontend && npm start"

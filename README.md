# SentinelFlow: Real-Time Fraud Intelligence & ML Observability Platform

A production-grade, full-stack real-time fraud intelligence and machine learning observability platform engineered to monitor high-throughput transaction streams, score anomaly risks using Isolation Forests, and audit model drift in real time.

## Architecture & Tech Stack
- **Backend**: Flask (Python), RESTful telemetry endpoints, streaming feature ingestion pipeline, joblib model persistence.
- **Frontend**: React (Single Page Application), Tailwind CSS (Cinematic Obsidian & Rose aesthetic), Lucide icons, Recharts for live anomaly velocity tracking.
- **ML Pipeline**: Scikit-Learn Isolation Forest ensemble for unsupervised streaming anomaly detection across multidimensional feature vectors.

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python train_model.py
python app.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

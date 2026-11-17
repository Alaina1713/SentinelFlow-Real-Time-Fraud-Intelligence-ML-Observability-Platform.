# SentinelFlow — Fraud Intelligence & ML Observability

From ML Model to Production-Style Risk Intelligence Platform. A production-style machine-learning engineering project: train a fraud-risk classifier, serve online predictions through FastAPI, explain risk signals, persist scored events, simulate traffic, and expose operational metrics.

> **Important:** the bundled data generator is synthetic. Any metrics from it are demonstration metrics, not evidence of real-world fraud detection performance.

## Why it is substantial
- Reproducible synthetic-data pipeline and Random Forest model training.
- Holdout evaluation with ROC-AUC and PR-AUC.
- Typed FastAPI inference endpoint with validation and duplicate transaction protection.
- Risk bands and decision policy (`approve`, `step_up`, `review`).
- Human-readable rule signals accompanying model scores.
- SQLAlchemy persistence with SQLite locally or PostgreSQL in Docker Compose.
- Prediction history, aggregate analytics, Prometheus counters and latency histogram.
- Traffic simulator, Dockerfile, Compose stack, pytest tests and GitHub Actions CI.

## Architecture
```text
Transaction producer / simulator
             |
             v
       FastAPI /v1/score
             |
     Feature transformation
             |
      Random Forest model
             |
  Risk probability + rule signals
             |
   Decision: approve / step_up / review
             |
       SQLite / PostgreSQL
             |
    Analytics API + Prometheus metrics
```

## Run locally
Python 3.10+:
```bash
git clone https://github.com/YOUR_USERNAME/sentinelflow.git
cd sentinelflow
python -m venv .venv
# macOS/Linux: source .venv/bin/activate
# Windows PowerShell: .venv\\Scripts\\Activate.ps1
pip install -e '.[dev]'
sentinelflow-train
uvicorn sentinelflow.api:app --reload
```
Open `http://localhost:8000/docs`.

## Run with PostgreSQL and Docker
```bash
docker compose up --build
```
The Compose password is for local development only. Replace it and configure secrets before deployment.

## Score a transaction
```bash
curl -X POST http://localhost:8000/v1/score \\
 -H 'Content-Type: application/json' \\
 -d '{"transaction_id":"txn-demo-001","amount":2450,"account_age_days":12,"transactions_last_hour":11,"distance_from_home_km":850,"is_new_device":true,"merchant_risk":0.91,"country_mismatch":true}'
```

## Generate traffic
Install `httpx` (`pip install httpx`) then run:
```bash
python -m sentinelflow.simulator --count 100 --delay 0.05
```

## Endpoints
- `GET /health` — service health and model version.
- `POST /v1/score` — score a transaction; duplicate IDs return HTTP 409.
- `GET /v1/predictions?limit=100` — recent prediction history.
- `GET /v1/analytics/summary` — aggregate stats over latest 1,000 predictions.
- `GET /metrics` — Prometheus exposition format.
- `GET /docs` — interactive OpenAPI docs.

## Tests
```bash
pip install -e '.[dev]'
pytest -q
```

## Decision thresholds
- `approve`: score below 0.40
- `step_up`: score from 0.40 to below 0.75
- `review`: score at least 0.75

These are illustrative thresholds. Real systems require calibrated probabilities, cost-sensitive threshold selection, representative validation data, fairness evaluation and human oversight.

## Limitations and production roadmap
This is a portfolio demonstration, not a deployable financial decision system. The baseline is trained on synthetic data; the API is a single-service deployment; and the current analytics are simple recent-window aggregates. A production roadmap includes temporal validation, calibration, feature store, Kafka/Redpanda ingestion, drift detection, model registry and approval gates, authentication, rate limiting, audit controls, load testing, and alerting. Synthetic data cannot establish real-world performance.

## CV project description
Built **SentinelFlow**, an end-to-end fraud intelligence platform using Python, FastAPI, scikit-learn and PostgreSQL, implementing model training/evaluation, explainable risk scoring, persistent prediction analytics, Dockerised deployment and Prometheus monitoring. Only list components you have personally run and can explain in an interview.

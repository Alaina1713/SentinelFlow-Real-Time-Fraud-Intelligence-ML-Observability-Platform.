# Interview guide

## Problem framing
The service estimates transaction risk and routes events into approval, step-up verification, or manual-review bands. It is a prioritisation aid, not an autonomous financial decision-maker.

## Model discussion
The example model is a Random Forest trained on generated data. Explain why PR-AUC is useful for imbalanced outcomes, why thresholds depend on false-positive and false-negative costs, and why temporal validation is preferable to a random split for time-dependent production data.

## Explainability distinction
The model probability is learned from data. The human-readable reason list is a separate deterministic rule layer; it is not SHAP and should not be described as causal feature attribution.

## Production gaps
Discuss authentication, authorisation, idempotency under concurrent requests, database migrations, secret management, drift detection, model registry, canary rollout, audit retention, load tests, and human review.

## Data caveat
All included labels are synthetic. Do not claim the demo achieves real-world fraud detection performance or quote synthetic metrics as business impact.

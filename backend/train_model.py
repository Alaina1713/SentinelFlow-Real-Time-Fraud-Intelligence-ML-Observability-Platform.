import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib
import os

def train_and_save():
    np.random.seed(42)
    n_samples = 4000
    
    amount = np.random.exponential(scale=180, size=n_samples)
    velocity = np.random.poisson(lam=3.5, size=n_samples)
    device_risk = np.random.uniform(0.0, 1.0, size=n_samples)
    geo_distance = np.random.exponential(scale=25, size=n_samples)
    
    X = np.column_stack((amount, velocity, device_risk, geo_distance))
    
    model = IsolationForest(n_estimators=150, contamination=0.04, random_state=42)
    model.fit(X)
    
    os.makedirs(os.path.dirname(__file__) or '.', exist_ok=True)
    joblib.dump(model, 'model.pkl')
    print("SentinelFlow Isolation Forest model successfully trained and saved.")

if __name__ == '__main__':
    train_and_save()

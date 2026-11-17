from __future__ import annotations
import os, joblib, numpy as np
from pathlib import Path
from datetime import datetime, timezone
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, average_precision_score
from pydantic import BaseModel, Field, ConfigDict

FEATURES=["log_amount","account_age_days","transactions_last_hour","distance_from_home_km","is_new_device","merchant_risk","country_mismatch"]
class Transaction(BaseModel):
    model_config=ConfigDict(extra="forbid")
    transaction_id:str=Field(min_length=3,max_length=80)
    amount:float=Field(gt=0,le=1_000_000)
    account_age_days:int=Field(ge=0,le=50000)
    transactions_last_hour:int=Field(ge=0,le=10000)
    distance_from_home_km:float=Field(ge=0,le=50000)
    is_new_device:bool
    merchant_risk:float=Field(ge=0,le=1)
    country_mismatch:bool=False

def features(t):
    return np.asarray([[np.log1p(t.amount),t.account_age_days,t.transactions_last_hour,t.distance_from_home_km,float(t.is_new_device),t.merchant_risk,float(t.country_mismatch)]],dtype=float)

def synthetic_data(n=12000,seed=42):
    r=np.random.default_rng(seed); amount=r.lognormal(4.2,1,n); age=r.integers(0,2500,n); velocity=r.poisson(2.2,n); distance=r.exponential(90,n); device=r.binomial(1,.12,n); merchant=r.beta(2,5,n); mismatch=r.binomial(1,.035,n)
    z=-5.2+.62*(amount>1500)+.58*(velocity>7)+device+.8*(distance>500)+1.4*(merchant>.75)+1.5*mismatch+.00035*np.maximum(0,90-age)
    y=r.binomial(1,1/(1+np.exp(-z)))
    X=np.column_stack([np.log1p(amount),age,velocity,distance,device,merchant,mismatch])
    return X,y

def make_model():
    return Pipeline([("scale",StandardScaler()),("classifier",RandomForestClassifier(n_estimators=180,max_depth=12,min_samples_leaf=4,class_weight="balanced_subsample",random_state=42,n_jobs=-1))])

def train(path="artifacts/fraud_model.joblib"):
    X,y=synthetic_data(); a,b,c,d=train_test_split(X,y,test_size=.25,random_state=42,stratify=y); model=make_model(); model.fit(a,c); p=model.predict_proba(b)[:,1]
    print(f"Synthetic holdout ROC-AUC={roc_auc_score(d,p):.4f}; PR-AUC={average_precision_score(d,p):.4f}")
    final=make_model().fit(X,y); Path(path).parent.mkdir(parents=True,exist_ok=True); joblib.dump({"model":final,"features":FEATURES,"version":"baseline-v1"},path); print(f"Saved {path}")

def predict(t):
    path=Path(os.getenv("MODEL_PATH","artifacts/fraud_model.joblib"))
    if not path.exists(): train(str(path))
    model=joblib.load(path)["model"]
    return float(model.predict_proba(features(t))[0,1])

def explanations(t):
    out=[]
    if t.amount>=1500: out.append("High transaction amount")
    if t.transactions_last_hour>=8: out.append("Unusually high transaction velocity")
    if t.is_new_device: out.append("New device")
    if t.distance_from_home_km>=500: out.append("Large distance from usual location")
    if t.merchant_risk>=.75: out.append("High merchant risk indicator")
    if t.country_mismatch: out.append("Country mismatch")
    return out or ["No individual high-risk rule triggered"]

if __name__=="__main__": train()

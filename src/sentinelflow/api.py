import os,time
from datetime import datetime,timezone
from fastapi import FastAPI,HTTPException
from fastapi.responses import Response
from sqlalchemy import create_engine,String,Float,DateTime,JSON,Integer,select
from sqlalchemy.orm import DeclarativeBase,Mapped,mapped_column,sessionmaker
from prometheus_client import Counter,Histogram,generate_latest,CONTENT_TYPE_LATEST
from .core import Transaction,predict,explanations

URL=os.getenv("DATABASE_URL") or "sqlite:///./sentinelflow.db"
engine=create_engine(URL,connect_args={"check_same_thread":False} if URL.startswith("sqlite") else {},pool_pre_ping=True)
Session=sessionmaker(bind=engine,expire_on_commit=False)
class Base(DeclarativeBase): pass
class Prediction(Base):
    __tablename__="predictions"
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    transaction_id:Mapped[str]=mapped_column(String(80),unique=True,index=True)
    amount:Mapped[float]=mapped_column(Float); risk_score:Mapped[float]=mapped_column(Float,index=True)
    risk_band:Mapped[str]=mapped_column(String(20)); decision:Mapped[str]=mapped_column(String(20))
    model_version:Mapped[str]=mapped_column(String(40)); features:Mapped[dict]=mapped_column(JSON)
    explanations:Mapped[list]=mapped_column(JSON); scored_at:Mapped[datetime]=mapped_column(DateTime(timezone=True))

app=FastAPI(title="SentinelFlow Risk Intelligence API",version="1.0.0",description="Explainable transaction risk scoring, persistence and operational metrics")
REQ=Counter("sentinelflow_scoring_requests_total","Scoring requests",["decision"]); LAT=Histogram("sentinelflow_scoring_latency_seconds","Scoring latency")
@app.on_event("startup")
def startup(): Base.metadata.create_all(engine)
@app.get("/")
def root(): return {"service":"SentinelFlow","docs":"/docs","health":"/health"}
@app.get("/health")
def health(): return {"status":"ok","model_version":os.getenv("MODEL_VERSION","baseline-v1")}
@app.post("/v1/score")
def score(tx:Transaction):
    start=time.perf_counter()
    try:
        s=predict(tx); band="high" if s>=.75 else "medium" if s>=.4 else "low"; decision="review" if s>=.75 else "step_up" if s>=.4 else "approve"; now=datetime.now(timezone.utc); why=explanations(tx)
        with Session() as db:
            row=Prediction(transaction_id=tx.transaction_id,amount=tx.amount,risk_score=s,risk_band=band,decision=decision,model_version=os.getenv("MODEL_VERSION","baseline-v1"),features=tx.model_dump(mode="json"),explanations=why,scored_at=now); db.add(row); db.commit()
        REQ.labels(decision=decision).inc()
        return {"transaction_id":tx.transaction_id,"risk_score":round(s,6),"risk_band":band,"decision":decision,"model_version":os.getenv("MODEL_VERSION","baseline-v1"),"explanations":why,"scored_at":now}
    except Exception as e:
        if "unique" in str(e).lower() or "duplicate key" in str(e).lower(): raise HTTPException(409,"transaction_id already scored")
        raise
    finally: LAT.observe(time.perf_counter()-start)
@app.get("/v1/predictions")
def predictions(limit:int=100):
    if not 1<=limit<=1000: raise HTTPException(422,"limit must be 1..1000")
    with Session() as db: rows=db.scalars(select(Prediction).order_by(Prediction.id.desc()).limit(limit)).all()
    return [{"transaction_id":r.transaction_id,"risk_score":r.risk_score,"risk_band":r.risk_band,"decision":r.decision,"model_version":r.model_version,"scored_at":r.scored_at} for r in rows]
@app.get("/v1/analytics/summary")
def summary():
    with Session() as db: rows=db.scalars(select(Prediction).order_by(Prediction.id.desc()).limit(1000)).all()
    n=len(rows); high=sum(x.risk_band=="high" for x in rows)
    return {"window":"latest_1000_predictions","total_scored":n,"high_risk_count":high,"high_risk_rate":round(high/n,4) if n else 0,"average_risk_score":round(sum(x.risk_score for x in rows)/n,4) if n else 0}
@app.get("/metrics")
def metrics(): return Response(generate_latest(),media_type=CONTENT_TYPE_LATEST)

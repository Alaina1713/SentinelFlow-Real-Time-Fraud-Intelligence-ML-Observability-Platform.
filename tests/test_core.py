from sentinelflow.core import synthetic_data,Transaction,features,explanations

def sample(**kw):
 d=dict(transaction_id="txn-001",amount=100,account_age_days=500,transactions_last_hour=1,distance_from_home_km=10,is_new_device=False,merchant_risk=.1,country_mismatch=False); d.update(kw); return Transaction(**d)
def test_data_reproducible():
 x,y=synthetic_data(100,7); a,b=synthetic_data(100,7); assert x.shape==(100,7); assert (x==a).all() and (y==b).all()
def test_features_and_explanations():
 t=sample(amount=3000,is_new_device=True,country_mismatch=True); assert features(t).shape==(1,7); e=explanations(t); assert "High transaction amount" in e and "New device" in e

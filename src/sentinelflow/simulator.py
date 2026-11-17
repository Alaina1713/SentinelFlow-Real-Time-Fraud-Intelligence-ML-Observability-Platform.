import argparse,random,time,httpx
from datetime import datetime,timezone

def main():
 p=argparse.ArgumentParser(); p.add_argument("--count",type=int,default=50); p.add_argument("--url",default="http://localhost:8000"); p.add_argument("--delay",type=float,default=.1); a=p.parse_args()
 with httpx.Client(timeout=10) as c:
  for i in range(a.count):
   bad=random.random()<.12; data={"transaction_id":f"demo-{i}-{random.randrange(100000,999999)}","amount":round(random.uniform(500,5000) if bad else random.uniform(5,350),2),"account_age_days":random.randint(0,30) if bad else random.randint(100,2500),"transactions_last_hour":random.randint(8,18) if bad else random.randint(0,5),"distance_from_home_km":round(random.uniform(500,3000) if bad else random.uniform(0,100),1),"is_new_device":bad,"merchant_risk":round(random.uniform(.7,1) if bad else random.uniform(0,.5),2),"country_mismatch":bad and random.random()<.5,"occurred_at":datetime.now(timezone.utc).isoformat()}
   r=c.post(a.url+"/v1/score",json=data); print(r.status_code,r.json()); time.sleep(a.delay)
if __name__=="__main__": main()

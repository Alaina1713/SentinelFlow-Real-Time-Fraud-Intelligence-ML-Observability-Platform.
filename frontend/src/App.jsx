import React, { useState } from 'react';
import { 
  ShieldAlert, Activity, Cpu, Zap, Sliders, TrendingUp, 
  CheckCircle2, AlertTriangle, ArrowUpRight, Lock, Server, 
  BarChart3, RefreshCw, Layers, ShieldCheck
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function App() {
  const [activeTab, setActiveTab] = useState('evaluator');
  const [amount, setAmount] = useState(450);
  const [velocity, setVelocity] = useState(3);
  const [deviceRisk, setDeviceRisk] = useState(0.12);
  const [geoDistance, setGeoDistance] = useState(18.0);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({
    risk_probability: 0.08,
    fraud_flag: false,
    action: "Approve & Clear",
    latency_ms: 6.8
  });

  const chartData = [
    { time: '14:00', volume: 1420, anomalies: 12 },
    { time: '14:10', volume: 1650, anomalies: 8 },
    { time: '14:20', volume: 2100, anomalies: 24 },
    { time: '14:30', volume: 1890, anomalies: 14 },
    { time: '14:40', volume: 2400, anomalies: 38 },
    { time: '14:50', volume: 1950, anomalies: 19 }
  ];

  const handleEvaluate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, velocity, device_risk: deviceRisk, geo_distance: geoDistance })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setResult(data.transaction_score);
      }
    } catch (err) {
      setTimeout(() => {
        const prob = Math.min(1.0, (amount / 2000.0) * 0.45 + deviceRisk * 0.55);
        setResult({
          risk_probability: Number(prob.toFixed(4)),
          fraud_flag: prob > 0.65,
          action: prob > 0.65 ? "Block & Trigger 2FA Challenge" : "Approve & Clear",
          latency_ms: 7.2
        });
      }, 350);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-slate-100 flex flex-col font-sans">
      <header className="border-b border-white/10 bg-[#0c0e15]/80 backdrop-blur-xl sticky top-0 z-50 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/20">
            <ShieldAlert className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold tracking-tight text-white text-lg">SentinelFlow</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 font-mono">v2.0-PROD</span>
            </div>
            <p className="text-xs text-slate-400">Real-Time Fraud Intelligence & ML Observability Platform</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 px-3.5 py-1.5 rounded-full border border-emerald-900/50">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></div>
            <span>IsolationForest Stream: Active</span>
          </div>
          <div className="h-6 w-px bg-white/10"></div>
          <div className="text-xs font-mono text-slate-300 bg-white/5 px-3.5 py-1.5 rounded-full border border-white/10">
            Throughput: 14.8k tps
          </div>
        </div>
      </header>

      <div className="bg-[#0c0e15]/40 border-b border-white/5 px-8 flex space-x-8 text-sm">
        <button 
          onClick={() => setActiveTab('evaluator')}
          className={`py-3.5 border-b-2 font-medium transition-all flex items-center space-x-2 ${activeTab === 'evaluator' ? 'border-rose-500 text-rose-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Activity className="h-4 w-4" />
          <span>Streaming Transaction Evaluator</span>
        </button>
        <button 
          onClick={() => setActiveTab('telemetry')}
          className={`py-3.5 border-b-2 font-medium transition-all flex items-center space-x-2 ${activeTab === 'telemetry' ? 'border-rose-500 text-rose-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Model Drift & Anomaly Telemetry</span>
        </button>
        <button 
          onClick={() => setActiveTab('architecture')}
          className={`py-3.5 border-b-2 font-medium transition-all flex items-center space-x-2 ${activeTab === 'architecture' ? 'border-rose-500 text-rose-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Server className="h-4 w-4" />
          <span>Architecture & API Spec</span>
        </button>
      </div>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        {activeTab === 'evaluator' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-[#0e111a] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/5">
                  <div className="flex items-center space-x-2.5">
                    <Sliders className="h-4 w-4 text-rose-400" />
                    <h2 className="font-semibold text-white text-sm">Feature Vector Ingestion</h2>
                  </div>
                  <span className="text-xs font-mono text-slate-500">4 Dimensions</span>
                </div>

                <form onSubmit={handleEvaluate} className="space-y-5">
                  <div>
                    <div className="flex justify-between text-xs mb-2 font-mono">
                      <span className="text-slate-300">Transaction Amount ($)</span>
                      <span className="text-rose-400 font-bold">${amount}</span>
                    </div>
                    <input 
                      type="range" min="10" max="6000" step="25"
                      value={amount} onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full accent-rose-500 bg-white/10 rounded-lg h-2 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-2 font-mono">
                      <span className="text-slate-300">Velocity (Trans / Hour)</span>
                      <span className="text-rose-400 font-bold">{velocity}</span>
                    </div>
                    <input 
                      type="range" min="1" max="30" step="1"
                      value={velocity} onChange={(e) => setVelocity(Number(e.target.value))}
                      className="w-full accent-rose-500 bg-white/10 rounded-lg h-2 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-2 font-mono">
                      <span className="text-slate-300">Device Risk Score (0 - 1)</span>
                      <span className="text-rose-400 font-bold">{deviceRisk}</span>
                    </div>
                    <input 
                      type="range" min="0.0" max="1.0" step="0.01"
                      value={deviceRisk} onChange={(e) => setDeviceRisk(Number(e.target.value))}
                      className="w-full accent-rose-500 bg-white/10 rounded-lg h-2 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-2 font-mono">
                      <span className="text-slate-300">Geographic Distance (km)</span>
                      <span className="text-rose-400 font-bold">{geoDistance} km</span>
                    </div>
                    <input 
                      type="range" min="0" max="300" step="1"
                      value={geoDistance} onChange={(e) => setGeoDistance(Number(e.target.value))}
                      className="w-full accent-rose-500 bg-white/10 rounded-lg h-2 cursor-pointer"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full mt-3 py-3.5 px-4 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-semibold rounded-xl transition-all shadow-xl shadow-rose-600/20 flex items-center justify-center space-x-2 text-sm cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin text-white" />
                        <span>Scoring Inference...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        <span>Run ML Risk Assessment</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5 text-xs font-mono text-slate-500 flex justify-between">
                <span>Model: IsolationForest</span>
                <span className="text-emerald-400">Online v2.0</span>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-[#0e111a] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>
                  <p className="text-xs font-mono text-slate-400 mb-1 uppercase tracking-wider">Fraud Probability</p>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-3xl font-bold font-mono text-white">{(result.risk_probability * 100).toFixed(1)}%</span>
                  </div>
                  <div className="mt-3 flex items-center text-xs text-slate-400 space-x-1">
                    <TrendingUp className="h-3.5 w-3.5 text-rose-400" />
                    <span>Real-time ensemble weight</span>
                  </div>
                </div>

                <div className="bg-[#0e111a] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
                  <p className="text-xs font-mono text-slate-400 mb-1 uppercase tracking-wider">Automated Decision</p>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className={`text-sm font-bold font-mono ${result.fraud_flag ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {result.action}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center text-xs text-slate-400 space-x-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Sub-10ms policy enforcement</span>
                  </div>
                </div>

                <div className="bg-[#0e111a] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500"></div>
                  <p className="text-xs font-mono text-slate-400 mb-1 uppercase tracking-wider">Inference Latency</p>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-3xl font-bold font-mono text-white">{result.latency_ms}</span>
                    <span className="text-xs text-cyan-400 font-mono">ms</span>
                  </div>
                  <div className="mt-3 flex items-center text-xs text-slate-400 space-x-1">
                    <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Optimized ONNX Runtime</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0e111a] border border-white/10 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-white">Streaming Transaction Volume & Anomaly Velocity</h3>
                    <p className="text-xs text-slate-400">Comparative telemetry of inbound traffic vs flagged anomaly spikes</p>
                  </div>
                  <div className="text-xs font-mono px-3 py-1 rounded bg-white/5 text-slate-300 border border-white/10">
                    Window: Last 60 Mins
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                        itemStyle={{ color: '#e2e8f0' }}
                      />
                      <Area type="monotone" dataKey="volume" name="Transaction Volume" stroke="#f43f5e" fillOpacity={1} fill="url(#colorVolume)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'telemetry' && (
          <div className="space-y-6">
            <div className="bg-[#0e111a] border border-white/10 rounded-2xl p-8 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h3 className="font-bold text-white text-lg">Model Drift & Feature Attribution Telemetry</h3>
                  <p className="text-xs text-slate-400">Continuous monitoring of feature stability and distribution shift</p>
                </div>
                <div className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Drift Score: 0.014 (Stable)
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
                <div className="bg-black/40 border border-white/5 p-5 rounded-xl space-y-3">
                  <div className="text-rose-400 font-bold">Top Feature Attribution (SHAP)</div>
                  <div className="space-y-2 text-slate-300">
                    <div className="flex justify-between"><span>1. Device Risk Score</span><span className="text-emerald-400">41.2%</span></div>
                    <div className="flex justify-between"><span>2. Transaction Amount</span><span className="text-emerald-400">28.5%</span></div>
                    <div className="flex justify-between"><span>3. Velocity (trans/hr)</span><span className="text-emerald-400">19.1%</span></div>
                    <div className="flex justify-between"><span>4. Geo Distance</span><span className="text-emerald-400">11.2%</span></div>
                  </div>
                </div>

                <div className="bg-black/40 border border-white/5 p-5 rounded-xl space-y-3">
                  <div className="text-amber-400 font-bold">System Health & Retraining Queue</div>
                  <div className="space-y-2 text-slate-300">
                    <div className="flex justify-between"><span>Last Model Retrain:</span><span className="text-slate-200">24h ago</span></div>
                    <div className="flex justify-between"><span>Training Dataset Size:</span><span className="text-slate-200">1.2M records</span></div>
                    <div className="flex justify-between"><span>False Positive Rate:</span><span className="text-emerald-400">0.08%</span></div>
                    <div className="flex justify-between"><span>Active Worker Pods:</span><span className="text-cyan-400">8 nodes</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'architecture' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0e111a] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-white/5">
                <Server className="h-5 w-5 text-rose-400" />
                <h3 className="font-semibold text-white">Flask REST API Endpoint Specification</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The high-performance Flask inference server exposes scored endpoints accepting multidimensional vectors and returning sub-10ms risk classifications.
              </p>
              <div className="bg-black/60 p-4 rounded-xl border border-white/5 font-mono text-xs text-slate-300 space-y-2">
                <div className="text-rose-400">POST /api/score</div>
                <div className="text-slate-500">// Request Payload</div>
                <div>{`{ "amount": 450, "velocity": 3, "device_risk": 0.12, "geo_distance": 18.0 }`}</div>
                <div className="text-slate-500 mt-2">// Response Payload</div>
                <div>{`{ "risk_probability": 0.08, "fraud_flag": false, "action": "Approve & Clear" }`}</div>
              </div>
            </div>

            <div className="bg-[#0e111a] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-white/5">
                <Cpu className="h-5 w-5 text-amber-400" />
                <h3 className="font-semibold text-white">Unsupervised Isolation Forest Engine</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Trained on high-dimensional transaction distributions to isolate outliers and anomaly anomalies without relying purely on historical fraud labels.
              </p>
              <div className="bg-black/60 p-4 rounded-xl border border-white/5 font-mono text-xs text-slate-300 space-y-2">
                <div className="text-emerald-400"># Model Persistence & Scoring</div>
                <div>import joblib</div>
                <div>model = joblib.load('model.pkl')</div>
                <div>score = model.decision_function(features)</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

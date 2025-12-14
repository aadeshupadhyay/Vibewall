import React from 'react';
import { UserState, ScenarioConfig, PlanTier } from '../types';
import { TrendingUp, Users, DollarSign, Activity, Sparkles, BarChart2 } from 'lucide-react';
import { CircularGauge, ActivityChart } from './VizComponents';

interface AdminDashboardProps {
  userState: UserState;
  scenario: ScenarioConfig;
  onClose: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ userState, scenario, onClose }) => {
  const isFree = userState.tier === PlanTier.FREE;
  const currentLimit = isFree ? scenario.freeLimit : (typeof scenario.proPlan.limit === 'number' ? scenario.proPlan.limit : 99999);
  const usagePct = (userState.usageCount / currentLimit) * 100;
  
  // Inference Logic
  let inference = { title: "Monitoring", desc: "User is exploring the platform.", color: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-500/10" };
  let conversionProb = 10;

  if (isFree) {
    if (usagePct >= 100) {
      inference = { title: "Paywall Hit", desc: "High conversion intent. Critical blocker active.", color: "text-red-400", border: "border-red-500/50", bg: "bg-red-500/10" };
      conversionProb = 85;
    } else if (usagePct > 60) {
      inference = { title: "High Engagement", desc: "User approaching free limits. Prepare upsell.", color: "text-yellow-400", border: "border-yellow-500/30", bg: "bg-yellow-500/10" };
      conversionProb = 45;
    }
  } else {
    inference = { title: "Active Subscriber", desc: "Healthy usage patterns. Monitoring for overage.", color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10" };
    conversionProb = 98;
    if (userState.walletBalance > scenario.proPlan.price * 1.5) {
        inference = { title: "Whale User", desc: "High volume overage charges detected.", color: "text-purple-400", border: "border-purple-500/50", bg: "bg-purple-500/10" };
    }
  }

  // Derive chart data from actual history (Analysis Result Scores)
  // Reverse history so it flows left to right (oldest to newest)
  const historyReversed = [...userState.history].reverse();
  const chartData = historyReversed.length > 0
    ? historyReversed.map(h => h.reportData.score)
    : [50, 50, 50]; // Baseline
  
  const chartLabels = historyReversed.length > 0
    ? historyReversed.map((_, i) => `Query ${i + 1}`)
    : [];

  return (
    <div className="absolute inset-0 z-40 bg-slate-900/95 backdrop-blur-md p-6 overflow-y-auto animate-in slide-in-from-right-10 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Activity className="text-indigo-400" />
              Live Customer Intelligence
            </h2>
            <p className="text-slate-400 text-sm mt-1">
                Context: <span className="text-white font-mono">{scenario.name}</span> | User ID: <span className="font-mono text-slate-500">anon_8x29a</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium border border-slate-600"
          >
            Close Dashboard
          </button>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
            <div className="flex justify-between items-start mb-2 relative z-10">
              <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Revenue</span>
              <DollarSign className="text-emerald-400" size={16} />
            </div>
            <div className="text-3xl font-mono font-bold text-white relative z-10">
              ${userState.walletBalance.toFixed(2)}
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
                <DollarSign size={80} className="text-emerald-500" />
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
             <div className="flex justify-between items-start mb-2 relative z-10">
              <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Total Actions</span>
              <Activity className="text-indigo-400" size={16} />
            </div>
            <div className="text-3xl font-mono font-bold text-white relative z-10">
              {userState.usageCount}
            </div>
             <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
                <Activity size={80} className="text-indigo-500" />
            </div>
          </div>
          
          <div className="col-span-2 bg-slate-800 rounded-xl p-5 border border-slate-700 flex items-center justify-between">
             <div className="flex-1">
                 <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={16} className={inference.color} />
                    <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">AI Inference</span>
                 </div>
                 <h3 className={`text-xl font-bold ${inference.color} mb-1`}>{inference.title}</h3>
                 <p className="text-slate-400 text-sm">{inference.desc}</p>
             </div>
             <div className="h-full w-px bg-slate-700 mx-4"></div>
             <div className="text-center min-w-[100px]">
                 <div className="text-2xl font-bold text-white mb-1">{conversionProb}%</div>
                 <div className="text-xs text-slate-500">Conv. Probability</div>
             </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* Visual 1: Usage vs Limits Gauge */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col items-center justify-center">
                 <h3 className="w-full text-left text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <BarChart2 size={16} /> Entitlement Usage
                 </h3>
                 <div className="flex space-x-8">
                    <CircularGauge 
                        value={userState.usageCount} 
                        max={currentLimit} 
                        color={usagePct >= 100 ? 'text-red-500' : 'text-blue-500'} 
                        label="Primary Limit"
                    />
                 </div>
            </div>

            {/* Visual 2: Usage Trend Line Chart */}
            <div className="col-span-2 bg-slate-800 rounded-xl border border-slate-700 p-6">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp size={16} /> Analysis Score Trends
                    </h3>
                    <div className="flex gap-2">
                        <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                        <span className="text-xs text-slate-400">Result Health Score</span>
                    </div>
                 </div>
                 
                 <div className="w-full h-48 bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                    {historyReversed.length > 0 ? (
                        <ActivityChart data={chartData} labels={chartLabels} color="text-indigo-500" />
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-500 text-sm italic">
                            Run a few queries to see the trend graph.
                        </div>
                    )}
                 </div>
            </div>
        </div>

        {/* Detailed Logs Table */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
             <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Users size={16} /> Recent User Activity Stream
                 </h3>
                 <span className="text-xs text-slate-500 font-mono">Real-time sync active</span>
             </div>
             
             <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                     <thead className="bg-slate-700/50 text-slate-400 font-medium">
                         <tr>
                             <th className="p-4">Timestamp</th>
                             <th className="p-4">Action</th>
                             <th className="p-4">Target Item</th>
                             <th className="p-4">Result Score</th>
                             <th className="p-4">Cost Impact</th>
                             <th className="p-4">Status</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-700">
                         {userState.history.length === 0 ? (
                             <tr>
                                 <td colSpan={6} className="p-8 text-center text-slate-500 italic">
                                     No user activity recorded yet. Interact with the app to generate logs.
                                 </td>
                             </tr>
                         ) : (
                             userState.history.slice(0, 5).map((log) => (
                                 <tr key={log.id} className="hover:bg-slate-700/30 transition-colors">
                                     <td className="p-4 font-mono text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                     <td className="p-4 text-white font-medium">{scenario.actionName}</td>
                                     <td className="p-4 text-indigo-400">{log.itemName}</td>
                                     <td className="p-4">
                                         <div className="flex items-center gap-2">
                                             <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                 <div className="h-full bg-blue-500" style={{ width: `${log.reportData.score}%` }}></div>
                                             </div>
                                             <span className="text-xs text-slate-300">{log.reportData.score}</span>
                                         </div>
                                     </td>
                                     <td className="p-4 text-slate-300">
                                         {isFree ? '$0.00' : (userState.usageCount > (scenario.proPlan.limit as number) ? `$${scenario.proPlan.overageCost}` : 'Included')}
                                     </td>
                                     <td className="p-4">
                                         <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400">
                                             Success
                                         </span>
                                     </td>
                                 </tr>
                             ))
                         )}
                     </tbody>
                 </table>
             </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
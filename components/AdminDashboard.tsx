import React, { useState } from 'react';
import { UserState, ScenarioConfig, PlanTier } from '../types';
import { 
  TrendingUp, Users, DollarSign, Activity, Sparkles, BarChart2, 
  Info, BookOpen, Cpu, GitBranch, Shield, Zap, X, HelpCircle 
} from 'lucide-react';
import { CircularGauge, ActivityChart } from './VizComponents';

interface AdminDashboardProps {
  userState: UserState;
  scenario: ScenarioConfig;
  onClose: () => void;
}

const LogicCard: React.FC<{ title: string; icon: any; children: React.ReactNode; color?: string }> = ({ title, icon: Icon, children, color = "text-indigo-400" }) => (
  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600 transition-colors">
    <div className={`flex items-center gap-2 mb-2 ${color} font-bold text-xs uppercase tracking-wider`}>
      <Icon size={14} />
      {title}
    </div>
    <div className="text-slate-300 text-sm leading-relaxed">
      {children}
    </div>
  </div>
);

const AdminDashboard: React.FC<AdminDashboardProps> = ({ userState, scenario, onClose }) => {
  const [showGuide, setShowGuide] = useState(false);

  const isFree = userState.tier === PlanTier.FREE;
  const currentLimit = isFree ? scenario.freeLimit : (typeof scenario.proPlan.limit === 'number' ? scenario.proPlan.limit : 99999);
  const usagePct = (userState.usageCount / currentLimit) * 100;
  
  // Inference Logic
  let inference = { title: "Monitoring", desc: "User is exploring the platform.", color: "text-blue-400", borderColor: "border-blue-500", bg: "bg-blue-500/10" };
  let conversionProb = 10;

  if (isFree) {
    if (usagePct >= 100) {
      inference = { title: "Paywall Triggered", desc: "User hit free limits. High upgrade intent detected.", color: "text-red-400", borderColor: "border-red-500", bg: "bg-red-500/10" };
      conversionProb = 85;
    } else if (usagePct > 60) {
      inference = { title: "Approaching Limit", desc: "Usage velocity suggests cap will be hit soon.", color: "text-yellow-400", borderColor: "border-yellow-500", bg: "bg-yellow-500/10" };
      conversionProb = 45;
    }
  } else {
    inference = { title: "Active Subscriber", desc: "Recurring revenue secured. Monitoring for expansion.", color: "text-emerald-400", borderColor: "border-emerald-500", bg: "bg-emerald-500/10" };
    conversionProb = 98;
    if (userState.walletBalance > scenario.proPlan.price * 1.5) {
        inference = { title: "High Value User", desc: "Significant overage charges accumulated.", color: "text-purple-400", borderColor: "border-purple-500", bg: "bg-purple-500/10" };
    }
  }

  const historyReversed = [...userState.history].reverse();
  const chartData = historyReversed.length > 0
    ? historyReversed.map(h => h.reportData.score)
    : [50, 50, 50]; 
  
  const chartLabels = historyReversed.length > 0
    ? historyReversed.map((_, i) => `Q${i + 1}`)
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 overflow-y-auto animate-in slide-in-from-bottom-10 font-sans text-slate-200">
      
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700 px-6 py-4 flex justify-between items-center shadow-lg">
         <div className="flex items-center gap-4">
            <div className={`p-2 rounded-lg bg-indigo-500/20 text-indigo-400`}>
                <Activity size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white tracking-tight">VibeWall Admin</h2>
                <div className="flex items-center text-xs text-slate-400 gap-2">
                    <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Live Simulation</span>
                    <span>•</span>
                    <span>Monitoring: <span className="text-white font-semibold">{scenario.name}</span></span>
                </div>
            </div>
         </div>
         
         <div className="flex items-center gap-4">
            <button 
                onClick={() => setShowGuide(!showGuide)}
                className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${showGuide ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
            >
                <HelpCircle size={16} />
                {showGuide ? 'Hide Explanations' : 'Show Explanations'}
            </button>
            <div className="h-8 w-px bg-slate-700"></div>
            <button 
                onClick={onClose}
                className="bg-white text-slate-900 hover:bg-slate-200 px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
            >
                <X size={16} />
                Close View
            </button>
         </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
        
        {/* Helper Banner */}
        {showGuide && (
            <div className="bg-indigo-900/30 border border-indigo-500/30 rounded-xl p-6 animate-in fade-in slide-in-from-top-2">
                <h3 className="text-indigo-300 font-bold mb-2 flex items-center gap-2">
                    <BookOpen size={18} /> What am I looking at?
                </h3>
                <p className="text-indigo-100/80 text-sm max-w-4xl leading-relaxed">
                    This is the <strong className="text-white">Admin Perspective</strong>. While the user interacts with the generated app, this dashboard monitors their behavior, tracks revenue, and executes the business logic defined in the prompt. 
                    <br/><br/>
                    The <strong>Runtime Logic Engine</strong> panel on the right shows the exact rules VibeWall generated for this specific product scenario.
                </p>
            </div>
        )}

        {/* TOP ROW: KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Revenue Card */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                        <span className="text-slate-400 text-xs uppercase font-bold tracking-wider flex items-center gap-1">
                            Total Revenue <Info size={12} className="text-slate-600 hover:text-slate-400 cursor-help" />
                        </span>
                        <h3 className="text-4xl font-black text-white mt-1 tracking-tight">
                            ${userState.walletBalance.toFixed(2)}
                        </h3>
                    </div>
                    <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
                        <DollarSign size={24} />
                    </div>
                </div>
                <div className="text-sm text-slate-400 relative z-10">
                    {userState.tier === PlanTier.PRO 
                        ? <span className="text-emerald-400 flex items-center gap-1"><Zap size={12}/> Pro Subscription Active</span>
                        : <span className="text-slate-500">Free Tier User</span>
                    }
                </div>
                {/* Background Decor */}
                <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity transform rotate-12">
                    <DollarSign size={120} />
                </div>
            </div>

            {/* Inference Card */}
            <div className={`rounded-xl p-6 border ${inference.borderColor} ${inference.bg} relative overflow-hidden transition-all`}>
                 <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                        <span className={`text-xs uppercase font-bold tracking-wider flex items-center gap-1 ${inference.color}`}>
                            AI Inference Engine
                        </span>
                        <h3 className={`text-2xl font-bold text-white mt-1 ${inference.color}`}>
                            {inference.title}
                        </h3>
                    </div>
                    <div className={`${inference.color} opacity-80`}>
                        <Sparkles size={24} />
                    </div>
                </div>
                <p className="text-sm text-slate-300 relative z-10 font-medium border-l-2 border-white/10 pl-3">
                    "{inference.desc}"
                </p>
                <div className="mt-4 flex items-center gap-3 relative z-10">
                    <div className="text-xs text-slate-400 uppercase font-bold">Conv. Probability</div>
                    <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full ${inference.color.replace('text-', 'bg-')}`} 
                            style={{ width: `${conversionProb}%` }}
                        ></div>
                    </div>
                    <div className={`text-xs font-bold ${inference.color}`}>{conversionProb}%</div>
                </div>
            </div>

            {/* Action Counter */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 relative overflow-hidden group hover:border-indigo-500/50 transition-all">
                 <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                        <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">
                            API Calls (Actions)
                        </span>
                        <h3 className="text-4xl font-black text-white mt-1 tracking-tight">
                            {userState.usageCount}
                        </h3>
                    </div>
                    <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400">
                        <Activity size={24} />
                    </div>
                </div>
                 <div className="text-sm text-slate-400 relative z-10">
                    Lifetime actions performed by user
                </div>
                 <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity transform -rotate-12">
                    <Activity size={120} />
                </div>
            </div>
        </div>

        {/* MIDDLE ROW: Logic & Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Runtime Logic Panel (Explains WHY things are happening) */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
                <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center gap-2">
                    <Cpu size={18} className="text-slate-400" />
                    <h3 className="font-bold text-slate-200">Runtime Logic Engine</h3>
                </div>
                <div className="p-4 space-y-4 flex-1 overflow-y-auto max-h-[400px]">
                    <LogicCard title="Pricing Model" icon={DollarSign} color="text-emerald-400">
                        <p><strong>Subscription:</strong> ${scenario.proPlan.price}/{scenario.proPlan.interval}</p>
                        {scenario.proPlan.overageCost && (
                            <p className="mt-1 text-emerald-200/70 text-xs">
                                + ${scenario.proPlan.overageCost} per action over limit.
                            </p>
                        )}
                    </LogicCard>

                    <LogicCard title="Entitlement Rules" icon={Shield} color="text-blue-400">
                        <ul className="list-disc list-inside space-y-1 text-xs text-slate-400">
                            <li>Free Limit: <strong>{scenario.freeLimit} {scenario.itemName}s</strong></li>
                            <li>Pro Limit: <strong>{scenario.proPlan.limit === 'unlimited' ? 'Unlimited' : scenario.proPlan.limit}</strong></li>
                            <li>Feature Lock: <span className="text-red-400">Enabled</span></li>
                        </ul>
                    </LogicCard>

                    <LogicCard title="Data Generation" icon={GitBranch} color="text-purple-400">
                        <p className="text-xs italic opacity-80">"{scenario.analysisPrompt.substring(0, 60)}..."</p>
                        <p className="mt-2 text-xs">
                            <strong className="text-purple-300">Strategy:</strong> Dynamic Gemini injection based on user prompt "{scenario.itemName}".
                        </p>
                    </LogicCard>
                </div>
            </div>

            {/* Center/Right: Visualizations */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Usage Gauge Area */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col md:flex-row items-center justify-between gap-8">
                     <div className="flex-1">
                        <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                            <BarChart2 size={18} className="text-indigo-400" /> 
                            Entitlement Consumption
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Visual representation of the user's progress towards their plan limits. 
                            {isFree ? ' Once the gauge hits 100%, the paywall effectively blocks further API calls.' : ' As a Pro user, usage is tracked for potential overage billing.'}
                        </p>
                     </div>
                     <div className="flex-shrink-0">
                        <CircularGauge 
                            value={userState.usageCount} 
                            max={currentLimit} 
                            color={usagePct >= 100 ? 'text-red-500' : (isFree ? 'text-yellow-500' : 'text-emerald-500')} 
                            label={isFree ? "Free Allowance" : "Pro Plan Usage"}
                        />
                     </div>
                </div>

                {/* Trend Chart Area */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <TrendingUp size={18} className="text-indigo-400" /> 
                            Result Quality Trends
                        </h3>
                        <div className="flex gap-4 text-xs">
                            <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Score
                            </div>
                        </div>
                     </div>
                     
                     <div className="w-full h-48 bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 relative">
                        {historyReversed.length > 0 ? (
                            <ActivityChart data={chartData} labels={chartLabels} color="text-indigo-500" />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
                                <Activity size={32} className="mb-2 opacity-50" />
                                <p className="text-sm font-medium">No Data Points</p>
                                <p className="text-xs">User has not generated any reports yet.</p>
                            </div>
                        )}
                     </div>
                     <p className="mt-3 text-xs text-slate-500 text-center">
                        Real-time tracking of the "Health Score" returned by the AI analysis engine for each query.
                     </p>
                </div>
            </div>
        </div>

        {/* BOTTOM ROW: Raw Logs */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
             <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                 <h3 className="font-bold text-slate-200 flex items-center gap-2">
                    <Users size={18} className="text-slate-400" /> 
                    Transaction & Event Log
                 </h3>
                 <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20 font-mono">
                    ● Live Sync
                 </span>
             </div>
             
             <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                     <thead className="bg-slate-900/50 text-slate-400 font-semibold border-b border-slate-700">
                         <tr>
                             <th className="p-4 w-32">Time</th>
                             <th className="p-4 w-32">Event</th>
                             <th className="p-4">Target Resource</th>
                             <th className="p-4 w-24 text-center">Score</th>
                             <th className="p-4 w-32">Financial</th>
                             <th className="p-4 w-24">Result</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-700">
                         {userState.history.length === 0 ? (
                             <tr>
                                 <td colSpan={6} className="p-12 text-center text-slate-500 italic bg-slate-800/50">
                                     Waiting for user interaction...
                                 </td>
                             </tr>
                         ) : (
                             userState.history.slice(0, 8).map((log) => (
                                 <tr key={log.id} className="hover:bg-slate-700/30 transition-colors group">
                                     <td className="p-4 font-mono text-slate-500 text-xs">
                                        {new Date(log.timestamp).toLocaleTimeString()}
                                     </td>
                                     <td className="p-4 text-white font-medium flex items-center gap-2">
                                        <Zap size={12} className="text-yellow-500" />
                                        {scenario.actionName}
                                     </td>
                                     <td className="p-4 text-indigo-300 font-mono text-xs">{log.itemName}</td>
                                     <td className="p-4 text-center">
                                         <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                                            log.reportData.score > 80 ? 'bg-emerald-500/20 text-emerald-400' : 
                                            log.reportData.score > 50 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                                         }`}>
                                            {log.reportData.score}
                                         </span>
                                     </td>
                                     <td className="p-4 font-mono text-slate-400 text-xs">
                                         {isFree ? (
                                            <span className="text-slate-600">Free</span>
                                         ) : (
                                            userState.usageCount > (scenario.proPlan.limit as number) 
                                                ? <span className="text-emerald-400">+${scenario.proPlan.overageCost}</span> 
                                                : <span className="text-slate-500">Included</span>
                                         )}
                                     </td>
                                     <td className="p-4">
                                         <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold uppercase tracking-wider">
                                             <Shield size={12} /> OK
                                         </div>
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
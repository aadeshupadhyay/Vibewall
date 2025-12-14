import React, { useState, useRef, useEffect } from 'react';
import { UserState, ScenarioConfig, PlanTier } from '../types';
import { 
  TrendingUp, Users, DollarSign, Activity, Sparkles, BarChart2, 
  Info, BookOpen, Cpu, GitBranch, Shield, Zap, X, HelpCircle,
  MessageSquare, Send, Bot, User, AlertCircle
} from 'lucide-react';
import { CircularGauge, ActivityChart } from './VizComponents';
import { generateDashboardInsight } from '../services/geminiService';

interface AdminDashboardProps {
  userState: UserState;
  scenario: ScenarioConfig;
  onClose: () => void;
}

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
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
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'ai', text: `Hello! I'm your VibeIntelligence analyst. Ask me anything about the ${scenario.name} performance data.` }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isFree = userState.tier === PlanTier.FREE;
  const isUnlimited = !isFree && scenario.proPlan.limit === 'unlimited';
  
  // Calculate Gauge Max
  // If unlimited, we create a visual max that is always a bit higher than current usage to show activity
  const visualMax = isUnlimited 
      ? Math.max(userState.usageCount + 20, 100) 
      : (isFree ? scenario.freeLimit : (scenario.proPlan.limit as number));
  
  const usagePct = (userState.usageCount / visualMax) * 100;
  
  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Inference Logic (Top Cards)
  let inference = { title: "Monitoring", desc: "User is exploring the platform.", color: "text-blue-400", borderColor: "border-blue-500", bg: "bg-blue-500/10" };
  let conversionProb = 10;

  if (isFree) {
    if (userState.usageCount >= scenario.freeLimit) {
      inference = { title: "Paywall Triggered", desc: "User hit free limits. High upgrade intent detected.", color: "text-red-400", borderColor: "border-red-500", bg: "bg-red-500/10" };
      conversionProb = 85;
    } else if (userState.usageCount > (scenario.freeLimit * 0.6)) {
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

  // Chart Data Preparation
  const historyReversed = [...userState.history].reverse();
  const hasHistory = historyReversed.length > 0;

  // Simulated data for fallback if history is empty
  const simulatedHistory = [65, 68, 72, 69, 75, 78];
  const simulatedLabels = ['Sim-1', 'Sim-2', 'Sim-3', 'Sim-4', 'Sim-5', 'Sim-6'];

  const chartData = hasHistory ? historyReversed.map(h => h.reportData.score) : simulatedHistory;
  const chartLabels = hasHistory ? historyReversed.map((_, i) => `Run-${i + 1}`) : simulatedLabels;
  
  // Trend Analysis
  let trendText = "Awaiting Data";
  let trendColor = "text-slate-500";
  if (hasHistory) {
     const last = chartData[chartData.length - 1];
     const prev = chartData.length > 1 ? chartData[chartData.length - 2] : last;
     if (last > prev) { trendText = "Quality Improving"; trendColor = "text-emerald-400"; }
     else if (last < prev) { trendText = "Quality Declining"; trendColor = "text-red-400"; }
     else { trendText = "Stable Performance"; trendColor = "text-blue-400"; }
  } else {
     trendText = "Simulated Baseline";
     trendColor = "text-slate-500 italic";
  }

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    const response = await generateDashboardInsight(userMsg, userState, scenario);
    
    setIsChatLoading(false);
    setChatHistory(prev => [...prev, { role: 'ai', text: response }]);
  };

  const handleQuickPrompt = (prompt: string) => {
    setChatInput(prompt);
  };

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

        {/* MIDDLE ROW: Logic & Intelligence Console */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Logic Engine */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col h-[520px]">
                <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center gap-2">
                    <Cpu size={18} className="text-slate-400" />
                    <h3 className="font-bold text-slate-200">Runtime Logic Engine</h3>
                </div>
                <div className="p-4 space-y-4 flex-1 overflow-y-auto">
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

                    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 flex items-center justify-between gap-4 mt-4">
                         <div className="flex-1">
                            <h3 className="font-bold text-white mb-1 flex items-center gap-2 text-sm">
                                <BarChart2 size={14} className="text-indigo-400" /> 
                                {isUnlimited ? "Usage Volume" : "Entitlements"}
                            </h3>
                            <div className="text-[10px] text-slate-500">
                                {isUnlimited ? "Unlimited Plan Activity" : "Plan Consumption"}
                            </div>
                         </div>
                         <div className="flex-shrink-0 scale-75 origin-right">
                            <CircularGauge 
                                value={userState.usageCount} 
                                max={visualMax} 
                                color={usagePct >= 100 && !isUnlimited ? 'text-red-500' : (isFree ? 'text-yellow-500' : 'text-emerald-500')} 
                                label=""
                            />
                         </div>
                    </div>
                </div>
            </div>

            {/* Right Column: VibeIntelligence Console (Chart + Chat) */}
            <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col h-[520px]">
                
                {/* Chart Section (Top Half) */}
                <div className="h-1/2 p-6 border-b border-slate-700 bg-slate-800/80 flex flex-col">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <TrendingUp size={18} className="text-indigo-400" /> 
                            Quality Trends
                        </h3>
                        <div className="flex gap-4 text-xs">
                            <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                <span className="text-slate-400">AI Health Score</span>
                            </div>
                        </div>
                     </div>
                     
                     <div className="flex-1 relative w-full min-h-0">
                        <ActivityChart 
                            data={chartData} 
                            labels={chartLabels} 
                            color={hasHistory ? "text-indigo-500" : "text-slate-600"} 
                        />
                     </div>
                     <div className="mt-2 flex items-center gap-2 text-xs">
                         <span className="text-slate-500">Trend Analysis:</span>
                         <span className={`font-bold uppercase tracking-wider ${trendColor}`}>
                            {trendText}
                         </span>
                     </div>
                </div>

                {/* Chat Section (Bottom Half) */}
                <div className="h-1/2 flex flex-col bg-slate-900/50">
                    {/* Chat Header */}
                    <div className="px-4 py-2 border-b border-slate-700/50 bg-slate-800/50 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                             <Sparkles size={14} className="text-indigo-400" />
                             <span className="text-xs font-bold text-indigo-100 uppercase tracking-wider">Ask the Data</span>
                        </div>
                        <span className="text-[10px] text-slate-500">AI Analyst Active</span>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {chatHistory.map((msg, i) => (
                            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'ai' && (
                                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                        <Bot size={14} className="text-indigo-400" />
                                    </div>
                                )}
                                <div className={`px-4 py-2 rounded-2xl text-sm max-w-[85%] ${
                                    msg.role === 'user' 
                                        ? 'bg-indigo-600 text-white rounded-br-none' 
                                        : 'bg-slate-700 text-slate-200 rounded-tl-none'
                                }`}>
                                    {msg.text}
                                </div>
                                {msg.role === 'user' && (
                                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
                                        <User size={14} className="text-slate-400" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {isChatLoading && (
                             <div className="flex gap-3 justify-start">
                                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                    <Bot size={14} className="text-indigo-400" />
                                </div>
                                <div className="bg-slate-700 px-4 py-2 rounded-2xl rounded-tl-none flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                                </div>
                             </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-slate-800 border-t border-slate-700">
                        {/* Quick Prompts */}
                        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
                            {["Analyze revenue trends", "Project next month", "Why was the last score low?", "User retention status"].map((p) => (
                                <button 
                                    key={p}
                                    onClick={() => handleQuickPrompt(p)}
                                    className="whitespace-nowrap px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-full text-xs text-slate-300 transition-colors border border-slate-600"
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Ask a question about the live data..."
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-500"
                            />
                            <button 
                                onClick={handleSendMessage}
                                disabled={isChatLoading || !chatInput.trim()}
                                className="absolute right-2 top-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
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
                                     <div className="flex flex-col items-center gap-2">
                                        <AlertCircle size={24} />
                                        <span>Waiting for user interaction...</span>
                                        <span className="text-xs text-slate-600">Interact with the app to populate live logs</span>
                                     </div>
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
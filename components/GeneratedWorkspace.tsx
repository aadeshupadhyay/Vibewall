import React, { useState, useEffect } from 'react';
import { ScenarioConfig, UserState, PlanTier } from '../types';
import { generateContent, generateScenarioData, generateAnalysisReport } from '../services/geminiService';
import AdminDashboard from './AdminDashboard';
import { CircularGauge, ActivityChart, BarChart } from './VizComponents';
import { 
  ShieldAlert, 
  BarChart3, 
  Scale, 
  Lock, 
  Zap, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  TrendingUp,
  CreditCard,
  Database,
  Users,
  LayoutDashboard,
  FileText,
  Lightbulb
} from 'lucide-react';

interface GeneratedWorkspaceProps {
  scenario: ScenarioConfig;
  userState: UserState;
  onUpdateUserState: (newState: UserState) => void;
  onTriggerPaywall: () => void;
}

const IconMap: Record<string, any> = {
  ShieldAlert,
  BarChart3,
  Scale,
  TrendingUp,
  Users,
  Database
};

const GeneratedWorkspace: React.FC<GeneratedWorkspaceProps> = ({ 
  scenario, 
  userState, 
  onUpdateUserState,
  onTriggerPaywall
}) => {
  const [items, setItems] = useState<string[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [processingItem, setProcessingItem] = useState<string | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);

  const Icon = IconMap[scenario.icon] || Zap;
  
  // Theme helpers
  const getThemeClass = (type: 'bg' | 'text' | 'border' | 'btn', intensity: string) => {
    return `${type}-${scenario.themeColor}-${intensity}`;
  };

  useEffect(() => {
    const loadItems = async () => {
      setLoadingItems(true);
      const data = await generateScenarioData(scenario.dataPrompt);
      setItems(data);
      setLoadingItems(false);
    };
    loadItems();
  }, [scenario]);

  const handleAction = async (item: string) => {
    // 1. Check Entitlements
    let allowed = false;
    if (userState.tier === PlanTier.PRO) {
        if (typeof scenario.proPlan.limit === 'number' && userState.usageCount >= scenario.proPlan.limit) {
             // Overage logic
             allowed = true;
             onUpdateUserState({
                ...userState,
                usageCount: userState.usageCount + 1,
                walletBalance: userState.walletBalance + (scenario.proPlan.overageCost || 0)
             });
        } else {
             allowed = true;
             onUpdateUserState({
                ...userState,
                usageCount: userState.usageCount + 1
             });
        }
    } else {
        // FREE Tier
        if (userState.usageCount < scenario.freeLimit) {
            allowed = true;
             onUpdateUserState({
                ...userState,
                usageCount: userState.usageCount + 1
             });
        } else {
            allowed = false;
            onTriggerPaywall();
            return;
        }
    }

    if (!allowed) return;

    // 2. Perform Action (Gemini)
    setProcessingItem(item);
    
    const analysisPrompt = scenario.analysisPrompt.replace('${itemName}', item);
    // Use the new structured generator
    const reportData = await generateAnalysisReport(analysisPrompt);
    
    // 3. Update History
    const newResult = {
        id: Math.random().toString(36).substr(2, 9),
        itemName: item,
        timestamp: Date.now(),
        reportData: reportData
    };
    
    onUpdateUserState({
        ...userState,
        usageCount: userState.usageCount + 1, // Double ensure count update if sync issues
        history: [newResult, ...userState.history]
    });
    setProcessingItem(null);
  };

  const isLocked = (userState.tier === PlanTier.FREE && userState.usageCount >= scenario.freeLimit);
  const progressPercent = userState.tier === PlanTier.FREE 
    ? (userState.usageCount / scenario.freeLimit) * 100 
    : (typeof scenario.proPlan.limit === 'number' ? (userState.usageCount / scenario.proPlan.limit) * 100 : 0);

  // Helper to determine score color/status
  const getScoreStatus = (score: number) => {
      if (score >= 80) return { color: 'text-emerald-500', label: 'EXCELLENT', bg: 'bg-emerald-50' };
      if (score >= 60) return { color: 'text-indigo-500', label: 'GOOD', bg: 'bg-indigo-50' };
      if (score >= 40) return { color: 'text-yellow-500', label: 'FAIR', bg: 'bg-yellow-50' };
      return { color: 'text-red-500', label: 'CRITICAL', bg: 'bg-red-50' };
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 text-slate-800 font-sans overflow-hidden relative">
      
      {/* Admin Dashboard Overlay */}
      {showAdmin && (
        <AdminDashboard 
          userState={userState} 
          scenario={scenario} 
          onClose={() => setShowAdmin(false)} 
        />
      )}

      {/* Header */}
      <header className={`h-16 border-b bg-white flex items-center justify-between px-6 shadow-sm z-10`}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getThemeClass('bg', '100')} ${getThemeClass('text', '600')}`}>
            <Icon size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">{scenario.name}</h1>
            <p className="text-xs text-slate-500">Powered by VibeWall Engine</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
           {/* Admin Toggle */}
           <button 
             onClick={() => setShowAdmin(true)}
             className="text-slate-400 hover:text-slate-800 transition-colors flex items-center text-xs font-medium"
           >
             <LayoutDashboard size={14} className="mr-1" />
             Admin View
           </button>

           <div className="h-6 w-px bg-slate-200"></div>

           {/* Usage Meter */}
           <div className="flex flex-col items-end min-w-[140px]">
             <div className="flex justify-between w-full text-xs mb-1 font-medium text-slate-600">
               <span>{userState.tier === PlanTier.FREE ? 'Free Plan' : scenario.proPlan.name}</span>
               <span>
                  {userState.usageCount} / {userState.tier === PlanTier.FREE ? scenario.freeLimit : (scenario.proPlan.limit === 'unlimited' ? '∞' : scenario.proPlan.limit)} used
               </span>
             </div>
             <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
               <div 
                 className={`h-full rounded-full transition-all duration-500 ${isLocked ? 'bg-red-500' : getThemeClass('bg', '500')}`}
                 style={{ width: `${Math.min(progressPercent, 100)}%` }}
               />
             </div>
             {userState.walletBalance > 0 && (
                <div className="text-xs text-emerald-600 font-bold mt-1">
                   Spend: ${userState.walletBalance.toFixed(2)}
                </div>
             )}
           </div>

           {userState.tier === PlanTier.FREE && (
             <button 
                onClick={onTriggerPaywall}
                className="bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
             >
                Upgrade to Pro
             </button>
           )}
           {userState.tier === PlanTier.PRO && (
             <div className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold flex items-center">
                <CheckCircle size={12} className="mr-1"/> PRO ACTIVE
             </div>
           )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar / List */}
        <div className="w-1/3 bg-white border-r overflow-y-auto">
          <div className="p-4 border-b bg-gray-50/50">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
               Available {scenario.itemName}s
             </h3>
          </div>
          {loadingItems ? (
             <div className="p-8 flex justify-center text-slate-400">
                <Loader2 className="animate-spin" />
             </div>
          ) : (
            <div className="divide-y">
              {items.map((item, idx) => {
                 const isProcessing = processingItem === item;
                 const hasResult = userState.history.some(h => h.itemName === item);
                 
                 return (
                    <div key={idx} className="p-4 hover:bg-slate-50 transition-colors group">
                       <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-slate-700">{item}</span>
                          {hasResult && <CheckCircle size={16} className="text-emerald-500" />}
                       </div>
                       <button
                         disabled={isProcessing}
                         onClick={() => handleAction(item)}
                         className={`w-full py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center space-x-2 
                           ${hasResult 
                              ? 'bg-slate-100 text-slate-500 cursor-default' 
                              : `bg-white border border-slate-200 text-slate-700 hover:border-${scenario.themeColor}-500 hover:text-${scenario.themeColor}-600 shadow-sm`
                           }
                         `}
                       >
                          {isProcessing ? (
                             <Loader2 size={16} className="animate-spin" />
                          ) : (
                             <>
                               {hasResult ? <span>Processed</span> : (
                                  <>
                                     <Zap size={14} className={isLocked && !hasResult ? "text-slate-400" : `text-${scenario.themeColor}-500`} />
                                     <span>{hasResult ? 'View Report' : scenario.actionName}</span>
                                  </>
                               )}
                             </>
                          )}
                       </button>
                    </div>
                 );
              })}
            </div>
          )}
        </div>

        {/* Detail View */}
        <div className="flex-1 bg-slate-50 overflow-y-auto p-8">
           {userState.history.length > 0 ? (
             <div className="space-y-8 pb-10">
                <div className="flex items-center justify-between">
                   <h2 className="text-2xl font-bold text-slate-800">Analysis Reports</h2>
                   <div className="text-sm text-slate-500">
                      {userState.history.length} reports generated
                   </div>
                </div>
                
                {userState.history.map((result) => {
                   const { reportData } = result;
                   const chartColor = `text-${scenario.themeColor}-500`;
                   const scoreStatus = getScoreStatus(reportData.score);

                   return (
                     <div key={result.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                        {/* Report Header */}
                        <div className="p-6 border-b border-slate-50 flex justify-between items-start">
                           <div>
                              <div className="flex items-center space-x-2 mb-1">
                                 <FileText size={16} className="text-slate-400" />
                                 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Generated Report</span>
                              </div>
                              <h3 className="font-bold text-xl text-slate-800">{result.itemName}</h3>
                              <p className="text-xs text-slate-400 mt-1 font-mono">{result.id} • {new Date(result.timestamp).toLocaleTimeString()}</p>
                           </div>
                           
                           {/* Score Badge */}
                           <div className={`flex flex-col items-end`}>
                                <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${scoreStatus.color}`}>
                                    {scoreStatus.label}
                                </span>
                                <div className={`text-3xl font-black ${scoreStatus.color}`}>
                                    {reportData.score}
                                </div>
                           </div>
                        </div>

                        {/* Visual Body */}
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                           {/* Left Column: Metrics & Summary */}
                           <div className="md:col-span-2 space-y-6">
                              {/* Executive Summary */}
                              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                 <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Executive Summary</h4>
                                 <p className="text-sm text-slate-700 leading-relaxed">
                                    {reportData.summary}
                                 </p>
                              </div>

                              {/* Recommendation Card */}
                              <div className={`p-4 rounded-lg border border-${scenario.themeColor}-100 bg-${scenario.themeColor}-50/30 flex items-start gap-3`}>
                                 <Lightbulb className={`flex-shrink-0 w-5 h-5 text-${scenario.themeColor}-600 mt-0.5`} />
                                 <div>
                                     <h4 className={`text-xs font-bold text-${scenario.themeColor}-700 uppercase mb-1`}>Recommendation</h4>
                                     <p className={`text-sm text-${scenario.themeColor}-800 font-medium`}>
                                        {reportData.recommendation}
                                     </p>
                                 </div>
                              </div>

                              {/* Key Metrics Grid */}
                              <div className="grid grid-cols-3 gap-4">
                                 {reportData.keyMetrics.map((metric, i) => (
                                    <div key={i} className="bg-white border border-slate-100 p-3 rounded-lg shadow-sm text-center">
                                       <div className="text-xs text-slate-400 mb-1 truncate">{metric.label}</div>
                                       <div className={`font-bold text-slate-800 ${String(metric.value).length > 8 ? 'text-sm' : 'text-lg'}`}>
                                          {metric.value}
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>

                           {/* Right Column: Score Gauge & Chart */}
                           <div className="flex flex-col space-y-6">
                                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100 h-full">
                                    <CircularGauge 
                                        value={reportData.score} 
                                        max={100} 
                                        color={scoreStatus.color}
                                        label="Overall Score"
                                    />
                                </div>
                           </div>
                        </div>

                        {/* Chart Section */}
                        <div className="px-6 pb-6 pt-2">
                           <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center">
                              <BarChart3 size={14} className="mr-2" />
                              {reportData.chart.title}
                           </h4>
                           <div className="h-48 w-full bg-slate-50 rounded-lg border border-slate-100 p-4 relative">
                              {reportData.chart.type === 'bar' ? (
                                 <BarChart 
                                    data={reportData.chart.data} 
                                    labels={reportData.chart.labels} 
                                    color={chartColor}
                                 />
                              ) : (
                                 <ActivityChart 
                                    data={reportData.chart.data} 
                                    labels={reportData.chart.labels}
                                    color={chartColor}
                                 />
                              )}
                           </div>
                        </div>

                     </div>
                   );
                })}
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-400 animate-in fade-in zoom-in duration-500">
                <div className={`p-6 rounded-full bg-slate-100 mb-4`}>
                   <Icon size={48} className="text-slate-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-600">Ready to Analyze</h3>
                <p className="text-sm max-w-xs text-center mt-2">
                   Select an item from the sidebar and click "{scenario.actionName}" to generate a rich, interactive report.
                </p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default GeneratedWorkspace;
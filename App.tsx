import React, { useState } from 'react';
import { SCENARIOS } from './constants';
import { ScenarioConfig, UserState, PlanTier } from './types';
import VibeLoader from './components/VibeLoader';
import GeneratedWorkspace from './components/GeneratedWorkspace';
import FlowgladPaywall from './components/FlowgladPaywall';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<ScenarioConfig | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  
  // Per-scenario user state simulation
  // In a real app this would be in a context or store
  const [userState, setUserState] = useState<UserState>({
    tier: PlanTier.FREE,
    usageCount: 0,
    walletBalance: 0,
    history: []
  });

  const handleSelectScenario = (scenario: ScenarioConfig) => {
    setIsGenerating(true);
    setActiveScenario(scenario);
    // Reset state for new demo
    setUserState({
      tier: PlanTier.FREE,
      usageCount: 0,
      walletBalance: 0,
      history: []
    });
  };

  const handleGenerationComplete = () => {
    setIsGenerating(false);
  };

  const handleUpgrade = () => {
    setUserState(prev => ({
      ...prev,
      tier: PlanTier.PRO,
      walletBalance: prev.walletBalance + (activeScenario?.proPlan.price || 0)
    }));
  };

  if (isGenerating && activeScenario) {
    return (
      <div className="h-screen w-full bg-black p-4 flex items-center justify-center">
        <VibeLoader 
          scenarioName={activeScenario.name} 
          onComplete={handleGenerationComplete} 
        />
      </div>
    );
  }

  if (activeScenario) {
    return (
      <div className="h-screen w-full relative">
        <GeneratedWorkspace 
          scenario={activeScenario}
          userState={userState}
          onUpdateUserState={setUserState}
          onTriggerPaywall={() => setShowPaywall(true)}
        />
        
        <FlowgladPaywall 
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
          onUpgrade={handleUpgrade}
          scenario={activeScenario}
        />

        {/* Floating Reset Button for Demo Purposes */}
        <button 
          onClick={() => setActiveScenario(null)}
          className="fixed bottom-4 right-4 bg-slate-800 text-white px-3 py-1 rounded-full text-xs opacity-50 hover:opacity-100 transition-opacity"
        >
          Reset VibeWall
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      <div className="max-w-5xl mx-auto px-6 py-16">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-black rounded-xl mb-4 shadow-xl shadow-indigo-200">
             <Zap className="text-yellow-400 fill-yellow-400" size={32} />
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 mb-2">
            VibeWall
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 font-medium max-w-2xl mx-auto">
            The AI Product Generator.
            <br/>
            <span className="text-indigo-600">Monetization is now a UI decision.</span>
          </p>
        </div>

        {/* Input Area (Visual Only for Demo) */}
        <div className="relative max-w-3xl mx-auto mb-16 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 p-2 flex items-center">
             <div className="p-3">
               <Sparkles className="text-indigo-500" />
             </div>
             <input 
               type="text" 
               disabled
               placeholder="Describe a product to generate (e.g. 'Paid dashboard for...')"
               className="w-full text-lg bg-transparent outline-none text-slate-600 placeholder:text-slate-300 cursor-not-allowed"
             />
             <div className="px-4 py-2 bg-slate-100 text-slate-400 rounded-lg text-sm font-medium">
               Select Preset
             </div>
          </div>
          <p className="text-center text-xs text-slate-400 mt-3">
            * For this demo, please select a curated scenario below to generate the full React app + Entitlement logic.
          </p>
        </div>

        {/* Scenario Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => handleSelectScenario(scenario)}
              className="group relative bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-500 text-left transition-all duration-300 hover:shadow-xl hover:shadow-indigo-100 hover:-translate-y-1 flex flex-col h-full"
            >
              <div className={`w-12 h-12 rounded-xl bg-${scenario.themeColor}-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                 {/* Icons are dynamically mapped in Workspace, simpler here for list */}
                 <Zap className={`text-${scenario.themeColor}-600`} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-800 group-hover:text-indigo-600 transition-colors">
                {scenario.name}
              </h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed flex-grow">
                {scenario.description}
              </p>
              
              <div className="border-t border-slate-100 pt-4 mt-auto">
                 <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <span>Monetization</span>
                 </div>
                 <div className="flex items-baseline space-x-1">
                    <span className="text-lg font-bold text-slate-900">${scenario.proPlan.price}</span>
                    <span className="text-slate-500">/mo</span>
                 </div>
                 <div className="mt-4 flex items-center text-indigo-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
                    Generate App <ArrowRight size={16} className="ml-2" />
                 </div>
              </div>
            </button>
          ))}
        </div>
        
        <div className="mt-20 text-center border-t border-slate-200 pt-8">
           <p className="text-slate-400 text-sm">
             Built with React 18, Tailwind, and Gemini API. 
             <br/>
             Demonstrates Runtime UI Generation & Metered Billing Logic.
           </p>
        </div>

      </div>
    </div>
  );
};

export default App;
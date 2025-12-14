import React, { useState } from 'react';
import { ShieldCheck, Check, ExternalLink, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { ScenarioConfig } from '../types';

interface FlowgladPaywallProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  scenario: ScenarioConfig;
}

const PAYMENT_URL = "https://app.flowglad.com/product/prod_knhGVTPJACzH5y49t1wUc/purchase";

const FlowgladPaywall: React.FC<FlowgladPaywallProps> = ({ isOpen, onClose, onUpgrade, scenario }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'plans' | 'checkout'>('plans');

  if (!isOpen) return null;

  const handleRedirect = () => {
    setIsProcessing(true);
    // Redirect to the real payment gateway
    window.location.href = PAYMENT_URL;
  };

  const handleSimulateSuccess = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onUpgrade();
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col md:flex-row relative">
         <button 
           onClick={onClose}
           className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10"
         >
           Close
         </button>

         {/* Brand Side */}
         <div className="w-full md:w-2/5 bg-slate-900 text-white p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
               <div className="flex items-center space-x-2 mb-6 text-slate-400">
                  <ShieldCheck size={20} />
                  <span className="font-bold tracking-wider text-xs uppercase">Powered by Flowglad</span>
               </div>
               <h2 className="text-3xl font-bold mb-4">Upgrade to Pro</h2>
               <p className="text-slate-300 text-sm leading-relaxed">
                  Unlock the full power of {scenario.name}. Secure checkout handled externally.
               </p>
            </div>
            
            <div className="relative z-10 space-y-3 mt-8">
               <div className="flex items-center space-x-3 text-sm">
                  <div className="bg-green-500/20 p-1 rounded text-green-400"><Check size={14} /></div>
                  <span>Higher Usage Limits</span>
               </div>
               <div className="flex items-center space-x-3 text-sm">
                  <div className="bg-green-500/20 p-1 rounded text-green-400"><Check size={14} /></div>
                  <span>Advanced AI Models</span>
               </div>
               <div className="flex items-center space-x-3 text-sm">
                  <div className="bg-green-500/20 p-1 rounded text-green-400"><Check size={14} /></div>
                  <span>Priority Processing</span>
               </div>
            </div>

            {/* Abstract Background Decoration */}
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-600 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-600 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
         </div>

         {/* Form Side */}
         <div className="w-full md:w-3/5 p-8 bg-white flex flex-col">
            {step === 'plans' && (
               <div className="h-full flex flex-col animate-in slide-in-from-left-8 duration-300">
                  <div className="text-center mb-8">
                     <h3 className="text-lg font-bold text-slate-800">Select Plan</h3>
                  </div>
                  
                  <div className="border-2 border-indigo-600 bg-indigo-50 rounded-xl p-6 relative cursor-pointer hover:shadow-md transition-shadow">
                     <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg">
                        RECOMMENDED
                     </div>
                     <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-xl text-indigo-900">{scenario.proPlan.name}</h4>
                        <div className="text-right">
                           <span className="text-2xl font-bold text-slate-900">${scenario.proPlan.price}</span>
                           <span className="text-slate-500 text-sm">/{scenario.proPlan.interval}</span>
                        </div>
                     </div>
                     <p className="text-sm text-slate-600 mt-2">{scenario.proPlan.description}</p>
                  </div>

                  <div className="mt-auto">
                     <button 
                        onClick={() => setStep('checkout')}
                        className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center justify-center"
                     >
                        Continue to Checkout
                     </button>
                  </div>
               </div>
            )}

            {step === 'checkout' && (
               <div className="h-full flex flex-col animate-in slide-in-from-right-8 duration-300">
                  <div className="relative text-center mb-6 flex items-center justify-center">
                     <button 
                       onClick={() => setStep('plans')}
                       className="absolute left-0 p-1 text-slate-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50"
                       title="Back to Plans"
                     >
                       <ArrowLeft size={20} />
                     </button>
                     <h3 className="text-lg font-bold text-slate-800">Secure Checkout</h3>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 mb-8">
                     <div className="bg-indigo-50 p-4 rounded-full">
                        <ExternalLink size={32} className="text-indigo-600" />
                     </div>
                     <div>
                        <p className="text-slate-600 font-medium">You will be redirected to Flowglad to complete your purchase of</p>
                        <p className="text-xl font-bold text-indigo-900 mt-1">{scenario.proPlan.name} — ${scenario.proPlan.price}</p>
                     </div>
                     <p className="text-xs text-slate-400 max-w-xs mx-auto">
                        Your payment information is handled securely by Flowglad. VibeWall does not store your card details.
                     </p>
                  </div>

                  <div className="mt-auto space-y-3">
                     <button 
                        onClick={handleRedirect}
                        disabled={isProcessing}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
                     >
                        {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <ExternalLink size={18} className="mr-2" />}
                        {isProcessing ? 'Redirecting...' : 'Proceed to Payment'}
                     </button>
                     
                     <div className="pt-2 border-t border-slate-100 flex justify-center">
                        <button 
                           onClick={handleSimulateSuccess}
                           className="text-xs text-slate-400 hover:text-indigo-600 underline"
                        >
                           Demo Mode: Simulate Successful Payment
                        </button>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default FlowgladPaywall;
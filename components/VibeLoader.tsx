import React, { useEffect, useState } from 'react';

interface VibeLoaderProps {
  onComplete: () => void;
  scenarioName: string;
}

const STEPS = [
  "Parsing user intent...",
  "Generating revenue model...",
  "Constructing entitlement engine...",
  "Wiring Flowglad payment gateways...",
  "Compiling React components...",
  "Injecting Vibe...",
  "Done."
];

const VibeLoader: React.FC<VibeLoaderProps> = ({ onComplete, scenarioName }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep >= STEPS.length) {
      const timeout = setTimeout(onComplete, 800);
      return () => clearTimeout(timeout);
    }

    const duration = Math.random() * 600 + 400; // Random duration between 400-1000ms
    const timeout = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, duration);

    return () => clearTimeout(timeout);
  }, [currentStep, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] w-full bg-black text-green-500 font-mono p-8 rounded-xl shadow-2xl border border-green-900/50">
      <div className="w-full max-w-md space-y-4">
        <div className="text-xl font-bold mb-6 text-white text-center animate-pulse">
           BUILDING {scenarioName.toUpperCase()}
        </div>
        
        <div className="space-y-2">
          {STEPS.map((step, index) => (
            <div 
              key={index} 
              className={`flex items-center space-x-3 transition-opacity duration-300 ${
                index > currentStep ? 'opacity-0' : index === currentStep ? 'opacity-100 text-green-300' : 'opacity-50'
              }`}
            >
              <span className="text-xs">{index < currentStep ? '✓' : '>'}</span>
              <span>{step}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 h-1 w-full bg-gray-900 rounded overflow-hidden">
          <div 
            className="h-full bg-green-500 transition-all duration-300 ease-out"
            style={{ width: `${Math.min((currentStep / (STEPS.length - 1)) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default VibeLoader;
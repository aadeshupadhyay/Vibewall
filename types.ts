export enum PlanTier {
  FREE = 'FREE',
  PRO = 'PRO'
}

export interface SubscriptionPlan {
  name: string;
  price: number;
  interval: 'month' | 'year';
  limit: number | 'unlimited';
  overageCost?: number;
  description: string;
}

export interface ScenarioConfig {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  themeColor: string;
  
  // Terminology
  itemName: string; // e.g., "Repository", "Campaign"
  actionName: string; // e.g., "Scan", "Analyze"
  
  // Data Generation
  dataPrompt: string; // Prompt for Gemini to generate items
  analysisPrompt: string; // Prompt for Gemini to generate analysis results
  
  // Monetization
  freeLimit: number;
  proPlan: SubscriptionPlan;
}

export interface ReportData {
  summary: string;
  recommendation: string; // Actionable advice
  score: number; // 0-100
  keyMetrics: { label: string; value: string | number }[];
  chart: {
    title: string;
    labels: string[];
    data: number[];
    type: 'line' | 'bar';
  };
}

export interface AnalysisResult {
  id: string;
  itemName: string;
  timestamp: number;
  reportData: ReportData;
}

export interface UserState {
  tier: PlanTier;
  usageCount: number;
  walletBalance: number; // Simulated total spend
  history: AnalysisResult[];
}
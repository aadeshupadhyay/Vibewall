import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ReportData, UserState, ScenarioConfig, PlanTier } from "../types";

// Initialize the Gemini API client
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateContent = async (prompt: string): Promise<string> => {
  if (!apiKey) {
    console.warn("No API Key provided for Gemini.");
    return "Simulation Mode: API Key missing. This is simulated content.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No content generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating content. Please try again.";
  }
};

export const generateScenarioData = async (prompt: string): Promise<string[]> => {
  if (!apiKey) {
    return ["Mock Item A", "Mock Item B", "Mock Item C", "Mock Item D", "Mock Item E"];
  }

  try {
    const fullPrompt = `${prompt} Return ONLY a JSON array of strings.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    const text = response.text || "[]";
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText) as string[];
  } catch (error) {
    console.error("Gemini Data Gen Error:", error);
    return ["Fallback Item 1", "Fallback Item 2", "Fallback Item 3"];
  }
};

export const generateAnalysisReport = async (prompt: string): Promise<ReportData> => {
  // Schema definition for the rich report
  const reportSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      summary: { type: Type.STRING, description: "A concise executive summary of the analysis (max 3 sentences)." },
      recommendation: { type: Type.STRING, description: "A specific, actionable recommendation for the user based on the data." },
      score: { type: Type.INTEGER, description: "A score from 0-100 indicating health/quality/success. 0 is bad, 100 is perfect." },
      keyMetrics: {
        type: Type.ARRAY,
        description: "3 key metrics extracted from the analysis.",
        items: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING },
            value: { type: Type.STRING, description: "Formatted value (e.g. '$500', '12%')" }
          }
        }
      },
      chart: {
        type: Type.OBJECT,
        description: "Data for a visualization relevant to the analysis.",
        properties: {
          title: { type: Type.STRING },
          type: { type: Type.STRING, enum: ["line", "bar"] },
          labels: { type: Type.ARRAY, items: { type: Type.STRING } },
          data: { type: Type.ARRAY, items: { type: Type.INTEGER } }
        }
      }
    },
    required: ["summary", "recommendation", "score", "keyMetrics", "chart"]
  };

  if (!apiKey) {
    // Mock return for simulation mode
    return {
      summary: "Simulation Mode: API Key missing. This is a simulated report summary.",
      recommendation: "Please provide a valid API key to generate real insights.",
      score: 85,
      keyMetrics: [
        { label: "Metric A", value: "92%" },
        { label: "Metric B", value: "Low Risk" },
        { label: "Metric C", value: "$1.2k" }
      ],
      chart: {
        title: "Trend Analysis",
        type: "line",
        labels: ["Jan", "Feb", "Mar", "Apr", "May"],
        data: [45, 52, 49, 62, 85]
      }
    };
  }

  try {
    const systemInstruction = `
      You are a specialized business intelligence engine.
      Your goal is to generate REALISTIC, GROUNDED data for business dashboards.
      
      GUIDELINES:
      1. REALISM: Do not generate inflated numbers. ROI should be 5-300%. Vulnerability counts 0-20. Scores 0-100.
      2. CONSISTENCY: Chart data must match the narrative.
      3. ACTIONABLE: The 'recommendation' field must be a specific "next step" (e.g., "Upgrade dependency X", "Increase bid on keyword Y").
      4. FORMAT: "keyMetrics" values should be nicely formatted strings (e.g., "$1,204", "14.5%").
      5. CHARTING: "chart.data" must be an array of integers. "chart.labels" must match the length of "chart.data".
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: reportSchema,
        systemInstruction: systemInstruction
      }
    });
    
    const text = response.text || "{}";
    return JSON.parse(text) as ReportData;
  } catch (error) {
    console.error("Gemini Report Gen Error:", error);
    return {
      summary: "Error generating report. Please try again.",
      recommendation: "Retry the analysis.",
      score: 0,
      keyMetrics: [],
      chart: { title: "Error", type: "bar", labels: [], data: [] }
    };
  }
};

export const generateDashboardInsight = async (query: string, userState: UserState, scenario: ScenarioConfig): Promise<string> => {
  if (!apiKey) {
    return "I can't analyze live data without a valid Gemini API key. Please check your configuration.";
  }

  // 1. Calculate Statistics directly to ensure ground truth
  const history = userState.history;
  const count = history.length;
  
  let avgScore = 0;
  let scoreTrend = "No Data";
  let latestItemName = "None";
  
  if (count > 0) {
      const scores = history.map(h => h.reportData.score);
      const totalScore = scores.reduce((sum, score) => sum + score, 0);
      avgScore = Math.round(totalScore / count);
      
      // Determine trend (Compare latest vs previous)
      // Note: history is often [newest, ..., oldest]
      const latestScore = scores[0];
      const previousScore = count > 1 ? scores[1] : latestScore;
      
      if (latestScore > previousScore + 5) scoreTrend = "Improving Significantly";
      else if (latestScore > previousScore) scoreTrend = "Improving Slighty";
      else if (latestScore < previousScore - 5) scoreTrend = "Declining Significantly";
      else if (latestScore < previousScore) scoreTrend = "Declining Slightly";
      else scoreTrend = "Stable";

      latestItemName = history[0].itemName;
  }

  // 2. Extract detailed recent logs for the LLM to reference
  const recentLogs = history.slice(0, 5).map(h => ({
    timestamp: new Date(h.timestamp).toLocaleTimeString(),
    item: h.itemName,
    score: h.reportData.score,
    summary: h.reportData.summary, 
    keyFindings: h.reportData.keyMetrics.map(k => `${k.label}: ${k.value}`).join(", ")
  }));

  // 3. Construct Data Payload
  const contextPayload = {
    productName: scenario.name,
    userTier: userState.tier,
    financials: {
        revenue: userState.walletBalance,
        actionsConsumed: userState.usageCount,
        costPerAction: scenario.proPlan.overageCost
    },
    performanceStats: {
        totalReports: count,
        averageScore: avgScore,
        currentTrend: scoreTrend,
        latestItemAnalyzed: latestItemName
    },
    recentLogs: recentLogs
  };

  const prompt = `
    You are the "VibeIntelligence" Data Analyst for the ${scenario.name} dashboard.
    Your job is to answer the user's question based ONLY on the provided data context.
    
    USER QUESTION: "${query}"
    
    DATA CONTEXT: ${JSON.stringify(contextPayload, null, 2)}
    
    STRICT RULES:
    1. GROUNDING: Do not hallucinate numbers. If the data says the average score is ${avgScore}, do not say it is something else.
    2. EXPLAINING SCORES: If asked "Why is the score low/high?", look at the 'recentLogs'. Find the specific item and reference its 'summary' or 'keyFindings'.
    3. MISSING DATA: If 'recentLogs' is empty, explicitly say "I cannot analyze trends yet because no reports have been generated. Please run an analysis first."
    4. TONE: Professional, analytical, and helpful.
    5. LENGTH: Keep it under 3 sentences unless asked for a detailed breakdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "I couldn't generate an insight at this moment.";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Error analyzing data.";
  }
};
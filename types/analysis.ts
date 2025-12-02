// DeepSeek 分析结果类型定义
export interface AnalysisResult {
  scenario_type: string;
  primary_target: {
    company_name: string;
    position: string;
    reasoning: string;
  };
  value_assessment: {
    rating: 'S' | 'A' | 'B' | 'C';
    financial_bandwidth: string;
    urgency_level: '高' | '中' | '低';
    timeline_criticality: string;
  };
  strategic_analysis: {
    core_opportunity: string;
    key_decision_makers: string;
    competitive_landscape: string;
    risk_factors: string;
  };
  action_plan: {
    recommended_approach: string;
    best_contact_timing: string;
    conversation_hook: string;
    customized_pitch: {
      purpose: string;
      script: string;
    };
  };
  follow_up_opportunities: Array<{
    service: string;
    potential_value: string;
    trigger_condition: string;
  }>;
}

// API 响应类型
export interface AnalyzeTrademarkResponse {
  success: boolean;
  message?: string;
  tmName?: string;
  error?: string;
  results?: {
    total: number;
    success: number;
    failed: number;
    details: Array<{
      tmName: string;
      status: 'success' | 'failed';
      error?: string;
    }>;
  };
}

// API 请求类型
export interface AnalyzeTrademarkRequest {
  tmName?: string;  // 如果为空，则分析所有商标
}


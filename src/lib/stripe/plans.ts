export interface PlanConfig {
  name: string
  price: number
  assetsPerMonth: number
  maxDurationMinutes: number
  llmProvider: 'gemini' | 'claude'
  features: string[]
}

export const PLANS: Record<string, PlanConfig> = {
  free: {
    name: 'Free',
    price: 0,
    assetsPerMonth: 1,
    maxDurationMinutes: 15,
    llmProvider: 'gemini',
    features: ['1 asset/month', '15 min max duration', 'Gemini Flash AI', 'Watermarked outputs'],
  },
  creator: {
    name: 'Creator',
    price: 19,
    assetsPerMonth: 5,
    maxDurationMinutes: 120,
    llmProvider: 'claude',
    features: [
      '5 assets/month',
      '2 hour max duration',
      'Claude Sonnet AI',
      'Brand voice customization',
      'All platforms',
    ],
  },
  pro: {
    name: 'Pro',
    price: 49,
    assetsPerMonth: 20,
    maxDurationMinutes: 240,
    llmProvider: 'claude',
    features: [
      '20 assets/month',
      '4 hour max duration',
      'Claude Sonnet AI',
      'Priority processing',
      'Output history',
      'Bulk export',
    ],
  },
  agency: {
    name: 'Agency',
    price: 99,
    assetsPerMonth: 999,
    maxDurationMinutes: 480,
    llmProvider: 'claude',
    features: [
      'Unlimited assets',
      '8 hour max duration',
      'Claude Sonnet AI',
      'Team seats (v2)',
      'White-label (v2)',
    ],
  },
}

// Time-series and slice data for Revenue Operations & Forecasting modules.

export const weeklyRevenue = [
  { week: "W1", revenue: 850, billable: 78 },
  { week: "W2", revenue: 920, billable: 80 },
  { week: "W3", revenue: 1100, billable: 82 },
  { week: "W4", revenue: 1250, billable: 83 },
  { week: "W5", revenue: 1180, billable: 81 },
  { week: "W6", revenue: 1320, billable: 84 },
  { week: "W7", revenue: 1400, billable: 86 },
  { week: "W8", revenue: 1450, billable: 87 },
  { week: "W9", revenue: 1380, billable: 85 },
  { week: "W10", revenue: 1490, billable: 87 },
  { week: "W11", revenue: 1530, billable: 88 },
  { week: "W12", revenue: 1620, billable: 89 },
];

export const monthlyRevenue = [
  { month: "Jan", revenue: 4200, target: 4000 },
  { month: "Feb", revenue: 4400, target: 4200 },
  { month: "Mar", revenue: 4900, target: 4500 },
  { month: "Apr", revenue: 5300, target: 4800 },
  { month: "May", revenue: 5800, target: 5200 },
  { month: "Jun", revenue: 6100, target: 5600 },
];

export const quarterlyRevenue = [
  { quarter: "Q1 25", revenue: 11_200, margin: 28 },
  { quarter: "Q2 25", revenue: 12_400, margin: 30 },
  { quarter: "Q3 25", revenue: 13_100, margin: 31 },
  { quarter: "Q4 25", revenue: 14_300, margin: 32 },
  { quarter: "Q1 26", revenue: 13_500, margin: 34 },
  { quarter: "Q2 26", revenue: 17_200, margin: 36 },
];

export const revenueByIndustry = [
  { industry: "Banking", value: 4800 },
  { industry: "Manufacturing", value: 5600 },
  { industry: "Healthcare", value: 3200 },
  { industry: "Defense", value: 6400 },
  { industry: "Pharma", value: 4100 },
  { industry: "Energy", value: 3900 },
  { industry: "Insurance", value: 2100 },
  { industry: "Logistics", value: 1800 },
  { industry: "Tech", value: 2700 },
  { industry: "Aerospace", value: 3700 },
  { industry: "Retail", value: 1400 },
];

export const revenueByPractice = [
  { practice: "AI Strategy", value: 6800 },
  { practice: "AI Modernization", value: 12_400 },
  { practice: "AI Governance", value: 4200 },
  { practice: "Security", value: 3100 },
  { practice: "Adoption", value: 5900 },
  { practice: "Managed Services", value: 4400 },
];

export const revenueForecast = [
  { period: "Jul 26", base: 6300, optimistic: 7100, pessimistic: 5500 },
  { period: "Aug 26", base: 6700, optimistic: 7600, pessimistic: 5800 },
  { period: "Sep 26", base: 7100, optimistic: 8100, pessimistic: 6100 },
  { period: "Oct 26", base: 7400, optimistic: 8600, pessimistic: 6300 },
  { period: "Nov 26", base: 7800, optimistic: 9100, pessimistic: 6500 },
  { period: "Dec 26", base: 8100, optimistic: 9600, pessimistic: 6700 },
];

export const utilizationForecast = [
  { period: "Jun", target: 80, forecast: 84 },
  { period: "Jul", target: 80, forecast: 82 },
  { period: "Aug", target: 80, forecast: 79 },
  { period: "Sep", target: 80, forecast: 81 },
  { period: "Oct", target: 80, forecast: 83 },
  { period: "Nov", target: 80, forecast: 85 },
];

export const marginTrend = [
  { period: "Q1 25", value: 28 },
  { period: "Q2 25", value: 30 },
  { period: "Q3 25", value: 31 },
  { period: "Q4 25", value: 32 },
  { period: "Q1 26", value: 34 },
  { period: "Q2 26", value: 36 },
];

export const customerHealthTrend = [
  { period: "Jan", score: 76 },
  { period: "Feb", score: 78 },
  { period: "Mar", score: 79 },
  { period: "Apr", score: 80 },
  { period: "May", score: 82 },
];

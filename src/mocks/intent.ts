import { IntentKpis, TopicRow, PromptItem } from "@/types/intent"

/**
 * Simulate async loading delay
 */
export const simulateLoad = <T>(data: T, delay: number = 500): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay)
  })
}

/**
 * Mock KPIs data
 */
export const mockIntentKpis: IntentKpis = {
  topicCount: 128,
  promptCount: 2345,
  compositeRank: 2,
  avgVisibility: 78.5,
  avgMentionRate: 65.2,
  avgSentiment: 0.68,
}

/**
 * Mock Prompt Items
 */
const mockPrompts: PromptItem[] = [
  {
    id: "p1",
    text: "What are the best business credit cards for startups?",
    platform: "ChatGPT",
    role: "Entrepreneur",
    rank: 1,
    mentionsBrand: true,
    sentiment: 0.8,
    aiResponse: "Based on current market analysis, the top business credit cards for startups include Chase Ink Business Preferred, American Express Business Gold, and Brex. These cards offer excellent rewards, flexible payment terms, and features tailored for growing businesses.",
    mentions: 5,
    citation: 3,
    focus: 25.5,
    intent: "Comparison",
  },
  {
    id: "p2",
    text: "Compare business credit cards for small businesses",
    platform: "Gemini",
    role: "Small Business Owner",
    rank: 2,
    mentionsBrand: true,
    sentiment: 0.65,
    aiResponse: "For small businesses, key options include Chase Ink Business Cash, Capital One Spark Cash Plus, and Brex. Consider factors like annual fees, cashback rates, and credit limits when making your decision.",
    mentions: 4,
    citation: 2,
    focus: 18.2,
    intent: "Comparison",
  },
  {
    id: "p3",
    text: "Which credit card is best for startup financing?",
    platform: "Claude",
    role: "Founder",
    rank: 3,
    mentionsBrand: false,
    sentiment: 0.5,
    aiResponse: "Startup financing options vary by stage and needs. While business credit cards can provide short-term capital, consider other financing options like SBA loans, venture debt, or equity financing.",
    mentions: 2,
    citation: 4,
    focus: 0,
    intent: "Information",
  },
  {
    id: "p4",
    text: "What credit card offers the best rewards for businesses?",
    platform: "ChatGPT",
    role: "CFO",
    rank: 1,
    mentionsBrand: true,
    sentiment: 0.7,
    aiResponse: "The best rewards business credit cards include American Express Business Platinum (luxury perks), Chase Ink Business Preferred (travel rewards), and Brex (no personal guarantee). Rewards structures vary, so match the card to your spending patterns.",
    mentions: 6,
    citation: 5,
    focus: 32.8,
    intent: "Evaluation",
  },
  {
    id: "p5",
    text: "Top business credit cards in 2024",
    platform: "Gemini",
    role: undefined,
    rank: 2,
    mentionsBrand: false,
    sentiment: 0.6,
    aiResponse: "The top business credit cards for 2024 include options from Chase, American Express, Capital One, and newer fintech players like Brex and Ramp. Each offers unique benefits for different business needs.",
    mentions: 5,
    citation: 3,
    focus: 0,
    intent: "Information",
  },
]

/**
 * Mock Topic Rows
 */
export const mockTopicRows: TopicRow[] = [
  {
    id: "t1",
    topic: "Business Credit Cards",
    intent: "Comparison",
    promptCount: 5,
    visibility: 82.5,
    mentionRate: 70.0,
    sentiment: 0.68,
    rank: 1,
    prompts: mockPrompts.slice(0, 3),
  },
  {
    id: "t2",
    topic: "Startup Financing",
    intent: "Information",
    promptCount: 8,
    visibility: 75.3,
    mentionRate: 60.5,
    sentiment: 0.65,
    rank: 2,
    prompts: mockPrompts.slice(1, 4),
  },
  {
    id: "t3",
    topic: "Credit Card Rewards",
    intent: "Comparison",
    promptCount: 4,
    visibility: 68.2,
    mentionRate: 55.0,
    sentiment: 0.72,
    rank: 3,
    prompts: mockPrompts.slice(2, 5),
  },
  {
    id: "t4",
    topic: "Business Banking",
    intent: "Information",
    promptCount: 6,
    visibility: 65.8,
    mentionRate: 50.2,
    sentiment: 0.58,
    rank: 4,
    prompts: mockPrompts.slice(0, 2),
  },
  {
    id: "t5",
    topic: "Financial Management",
    intent: "Advice",
    promptCount: 3,
    visibility: 58.5,
    mentionRate: 45.3,
    sentiment: 0.55,
    rank: 5,
    prompts: mockPrompts.slice(1, 3),
  },
  {
    id: "t6",
    topic: "Credit Card Evaluation",
    intent: "Evaluation",
    promptCount: 7,
    visibility: 72.1,
    mentionRate: 62.0,
    sentiment: 0.60,
    rank: 3,
    prompts: mockPrompts.slice(0, 3),
  },
  {
    id: "t7",
    topic: "Other Financial Topics",
    intent: "Other",
    promptCount: 2,
    visibility: 45.0,
    mentionRate: 35.0,
    sentiment: 0.50,
    rank: 6,
    prompts: mockPrompts.slice(0, 2),
  },
]

/**
 * Mock Competitor Ranks
 */
export const mockCompetitorRanks = [
  { name: "Chase", rank: 1 },
  { name: "American Express", rank: 2 },
  { name: "Brex", rank: 3 },
  { name: "Ramp", rank: 4 },
]


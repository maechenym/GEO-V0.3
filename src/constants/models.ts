/**
 * 模型平台选项
 * 统一管理所有页面使用的模型选择器选项
 */
export const MODEL_OPTIONS = [
  {
    value: "all",
    labelZh: "全部模型",
    labelEn: "All Models",
  },
  {
    value: "gpt",
    labelZh: "GPT",
    labelEn: "GPT",
  },
  {
    value: "gemini",
    labelZh: "Gemini",
    labelEn: "Gemini",
  },
  {
    value: "claude",
    labelZh: "Claude",
    labelEn: "Claude",
  },
] as const

export type ModelOptionValue = typeof MODEL_OPTIONS[number]["value"]


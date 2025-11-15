const DOMAIN_CATEGORY_MAP: Record<string, string> = {
  "sohu.com": "News",
  "news.sohu.com": "News",
  "time-weekly.com": "News",
  "jjckb.cn": "News",
  "xinhuanet.com": "News",
  "people.com.cn": "News",
  "adreamertech.com.cn": "Tech Blog",
  "m.vzkoo.com": "Tech Blog",
  "smb.pconline.com.cn": "Tech Blog",
  "notebook.pconline.com.cn": "Review Site",
  "hangyan.co": "Knowledge Base",
  "hwhidc.cn": "Knowledge Base",
  "zhidx.com": "Tech Blog",
  "36kr.com": "News",
  "ithome.com": "Tech Blog",
  "csia.com.cn": "Knowledge Base",
  "chinadaily.com.cn": "News",
  "cnbeta.com": "Tech Blog",
  "kuaibao.qq.com": "News",
  "finance.sina.com.cn": "News",
  "sina.com.cn": "News",
  "weixin.qq.com": "Social Media",
  "mp.weixin.qq.com": "Social Media",
  "zhihu.com": "Forum",
  "weibo.com": "Social Media",
  "bilibili.com": "Video Platform",
  "github.com": "Knowledge Base",
  "csdn.net": "Tech Blog",
}

const FALLBACK_RULES: Array<{ pattern: RegExp; type: string }> = [
  { pattern: /(gov\.cn|.gov$)/i, type: "Government" },
  { pattern: /(news|daily|times|finance|market)/i, type: "News" },
  { pattern: /(blog|tech|pconline|it|ai|digital)/i, type: "Tech Blog" },
  { pattern: /(forum|bbs|tieba|community)/i, type: "Forum" },
  { pattern: /(weibo|wechat|weixin|twitter|facebook|instagram)/i, type: "Social Media" },
  { pattern: /(edu|university|research|academy|journal)/i, type: "Academic" },
  { pattern: /(wiki|wikipedia)/i, type: "Wiki" },
  { pattern: /(review|bench|notebook)/i, type: "Review Site" },
  { pattern: /(case|whitepaper|report|insights)/i, type: "Case Study" },
]

const DEFAULT_CATEGORY = "Other"

export const normalizeDomain = (raw: string): string => {
  if (!raw) return ""
  const withoutProtocol = raw.replace(/^https?:\/\//i, "")
  const withoutPath = withoutProtocol.split("/")[0]
  return withoutPath.toLowerCase()
}

export const getDomainCategory = (rawDomain: string): string => {
  const domain = normalizeDomain(rawDomain)
  if (!domain) return DEFAULT_CATEGORY

  if (DOMAIN_CATEGORY_MAP[domain]) {
    return DOMAIN_CATEGORY_MAP[domain]
  }

  for (const { pattern, type } of FALLBACK_RULES) {
    if (pattern.test(domain)) {
      return type
    }
  }

  return DEFAULT_CATEGORY
}



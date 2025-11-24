export interface TocItem {
  id: string
  text: string
  level: number
}

/**
 * 从 MDX 内容中提取标题生成目录
 */
export function extractToc(content: string): TocItem[] {
  const toc: TocItem[] = []
  const lines = content.split('\n')
  
  for (const line of lines) {
    // 匹配 Markdown 标题 (# ## ### 等)
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const text = headingMatch[2].trim()
      // 生成 ID（转换为小写，空格替换为连字符）
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      
      toc.push({ id, text, level })
    }
  }
  
  return toc
}

/**
 * 从 HTML 内容中提取标题（用于客户端）
 */
export function extractTocFromHTML(html: string): TocItem[] {
  const toc: TocItem[] = []
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6')
  
  headings.forEach((heading) => {
    const id = heading.id || heading.textContent?.toLowerCase().replace(/\s+/g, '-') || ''
    const text = heading.textContent || ''
    const level = parseInt(heading.tagName.charAt(1))
    
    if (id && text) {
      toc.push({ id, text, level })
    }
  })
  
  return toc
}


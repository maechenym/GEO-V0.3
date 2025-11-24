import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { extractToc } from "./toc"

export interface DocMetadata {
  title: string
  description?: string
  slug: string
}

export interface DocContent {
  content: string
  metadata: DocMetadata
  toc: ReturnType<typeof extractToc>
}

const docsDirectory = path.join(process.cwd(), "content/docs")

/**
 * 加载文档内容
 */
export function loadDoc(slug: string): DocContent | null {
  try {
    // 支持多种文件扩展名
    const possiblePaths = [
      path.join(docsDirectory, `${slug}.mdx`),
      path.join(docsDirectory, `${slug}.md`),
      path.join(docsDirectory, slug, "index.mdx"),
      path.join(docsDirectory, slug, "index.md"),
    ]

    let filePath: string | null = null
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        filePath = possiblePath
        break
      }
    }

    if (!filePath) {
      return null
    }

    const fileContents = fs.readFileSync(filePath, "utf8")
    const { data, content } = matter(fileContents)

    const metadata: DocMetadata = {
      title: data.title || slug,
      description: data.description,
      slug,
    }

    const toc = extractToc(content)

    return {
      content,
      metadata,
      toc,
    }
  } catch (error) {
    console.error(`Error loading doc ${slug}:`, error)
    return null
  }
}

/**
 * 获取所有文档的 slug 列表
 */
export function getAllDocSlugs(): string[] {
  try {
    if (!fs.existsSync(docsDirectory)) {
      // 如果目录不存在，返回默认的示例列表
      return [
        "index",
      ]
    }

    const files = fs.readdirSync(docsDirectory, { recursive: true })
    const slugs: string[] = []

    for (const file of files) {
      if (typeof file === "string") {
        if (file.endsWith(".mdx") || file.endsWith(".md")) {
          // 移除扩展名和 index
          let slug = file.replace(/\.(mdx|md)$/, "")
          if (slug.endsWith("/index")) {
            slug = slug.replace("/index", "")
          }
          if (slug === "index") {
            slugs.push("index")
          } else if (slug) {
            slugs.push(slug)
          }
        }
      }
    }

    return slugs.length > 0 ? slugs : ["index"]
  } catch (error) {
    console.error("Error getting doc slugs:", error)
    return ["index"]
  }
}


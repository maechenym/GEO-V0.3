import { notFound } from "next/navigation"
import { loadDoc, getAllDocSlugs } from "@/lib/docs/load-doc"
import { MDXRemote } from "next-mdx-remote/rsc"
import { mdxComponents } from "@/lib/docs/mdx-renderer"
import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"

interface DocsPageProps {
  params: Promise<{
    slug?: string[]
  }>
}

export default async function DocsPage({ params }: DocsPageProps) {
  const resolvedParams = await params
  // 如果没有 slug，显示首页
  const slug = resolvedParams.slug ? resolvedParams.slug.join("/") : "index"
  
  const doc = loadDoc(slug)

  if (!doc) {
    notFound()
  }

  return (
    <article className="flex-1 min-w-0">
      <div className="prose prose-slate max-w-none">
        <h1 className="text-4xl font-bold text-foreground mb-2 scroll-mt-24" id="title">
          {doc.metadata.title}
        </h1>
        {doc.metadata.description && (
          <p className="text-lg text-foreground/70 mb-8">
            {doc.metadata.description}
          </p>
        )}
        <div className="docs-content">
          <MDXRemote
            source={doc.content}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [
                  rehypeSlug,
                  [
                    rehypeAutolinkHeadings,
                    {
                      behavior: "wrap",
                      properties: {
                        className: ["anchor"],
                      },
                    },
                  ],
                ],
              },
            }}
          />
        </div>
      </div>
    </article>
  )
}

export async function generateStaticParams() {
  const slugs = getAllDocSlugs()
  return slugs.map((slug) => ({
    slug: slug === "index" ? [] : slug.split("/"),
  }))
}


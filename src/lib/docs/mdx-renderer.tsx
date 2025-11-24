import React from "react"
import { MDXComponents } from "mdx/types"

export const mdxComponents: MDXComponents = {
  h1: (props) => (
    <h1
      {...props}
      className="text-3xl font-bold text-foreground mt-8 mb-4 scroll-mt-24"
    />
  ),
  h2: (props) => (
    <h2
      {...props}
      className="text-2xl font-semibold text-foreground mt-8 mb-4 scroll-mt-24"
    />
  ),
  h3: (props) => (
    <h3
      {...props}
      className="text-xl font-semibold text-foreground mt-6 mb-3 scroll-mt-24"
    />
  ),
  h4: (props) => (
    <h4
      {...props}
      className="text-lg font-semibold text-foreground mt-4 mb-2 scroll-mt-24"
    />
  ),
  p: (props) => (
    <p {...props} className="text-foreground/80 leading-7 mb-4" />
  ),
  ul: (props) => (
    <ul {...props} className="list-disc list-inside space-y-2 mb-4 text-foreground/80 ml-4" />
  ),
  ol: (props) => (
    <ol {...props} className="list-decimal list-inside space-y-2 mb-4 text-foreground/80 ml-4" />
  ),
  li: (props) => <li {...props} className="ml-2" />,
  code: (props: any) => {
    const isInline = !props.className
    return isInline ? (
      <code
        {...props}
        className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground"
      />
    ) : (
      <code {...props} />
    )
  },
  pre: (props) => (
    <pre
      {...props}
      className="bg-muted p-4 rounded-lg overflow-x-auto mb-4"
    />
  ),
  a: (props) => (
    <a
      {...props}
      className="text-brand-600 hover:text-brand-700 underline"
    />
  ),
  blockquote: (props) => (
    <blockquote
      {...props}
      className="border-l-4 border-brand-200 pl-4 italic text-foreground/70 my-4"
    />
  ),
  hr: (props) => (
    <hr {...props} className="my-8 border-border" />
  ),
  table: (props) => (
    <div className="overflow-x-auto my-4">
      <table {...props} className="min-w-full border-collapse" />
    </div>
  ),
  th: (props) => (
    <th
      {...props}
      className="border border-border px-4 py-2 bg-muted font-semibold text-left"
    />
  ),
  td: (props) => (
    <td {...props} className="border border-border px-4 py-2" />
  ),
}


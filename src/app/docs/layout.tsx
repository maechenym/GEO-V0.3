import { DocsHeader } from "@/components/docs/docs-header"
import { DocsSidebar } from "@/components/docs/docs-sidebar"

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DocsHeader />
      <div className="flex flex-1 min-h-0">
        <DocsSidebar />
        <main className="flex-1 overflow-y-auto min-w-0">
          <div className="container mx-auto px-6 py-12 max-w-4xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}


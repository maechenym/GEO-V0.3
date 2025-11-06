/**
 * MSW Browser Worker Setup
 * 
 * 在浏览器环境中启用 MSW
 * 根据 NEXT_PUBLIC_USE_MOCK 环境变量决定是否启用
 * 
 * 注意：使用动态导入避免在服务端渲染时加载浏览器专用模块
 */
export async function initMSW() {
  if (typeof window === "undefined") {
    return null
  }

  // 开发环境默认启用 MSW，除非明确设置为 false
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK !== "false"
  if (!useMock) {
    console.log("[MSW] Mock disabled, using real API")
    return null
  }

  try {
    const { setupWorker } = await import("msw/browser")
    const { handlers } = await import("./handlers")

    console.log("[MSW] Initializing worker with", handlers.length, "handlers")
    
    const worker = setupWorker(...handlers)
    
    // 启动 worker，指定 service worker 路径
    await worker.start({
      onUnhandledRequest: (request, print) => {
        // 对于 /api/brands 相关的请求，应该被拦截
        if (request.url.includes("/api/brands")) {
          console.warn("[MSW] Unhandled request to:", request.url)
          print.warning()
        }
        // 绕过 overview, visibility, sentiment API 请求，让Next.js处理
        if (request.url.includes("/api/overview") || request.url.includes("/api/visibility") || request.url.includes("/api/sentiment")) {
          return // 不拦截，让Next.js处理
        }
        // 其他请求绕过
      },
      serviceWorker: {
        url: "/mockServiceWorker.js",
      },
      quiet: false,
    })

    console.log("✅ MSW enabled - All API requests will be mocked")
    console.log("[MSW] Worker started successfully")
    
    // 验证worker是否正在运行
    if (worker.listHandlers) {
      const handlerPaths = worker.listHandlers().map(h => h.info.header)
      console.log("[MSW] Registered handlers:", handlerPaths)
    }
    
    return worker
  } catch (error) {
    console.error("❌ Failed to initialize MSW:", error)
    console.error("Error details:", error)
    return null
  }
}


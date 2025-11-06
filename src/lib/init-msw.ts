/**
 * MSW 初始化脚本
 * 必须在应用启动时最先执行
 */

export async function initMSW() {
  if (typeof window === "undefined") {
    return
  }

  // 开发环境默认启用 MSW
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK !== "false"

  if (!useMock) {
    console.log("[MSW] Mock disabled, using real API")
    return
  }

  try {
    const { setupWorker } = await import("msw/browser")
    const { handlers } = await import("../mocks/handlers")

    const worker = setupWorker(...handlers)

    // 使用 serviceWorkerOptions 确保正确初始化
    await worker.start({
      onUnhandledRequest: "bypass",
      serviceWorker: {
        url: "/mockServiceWorker.js",
      },
      // 忽略某些路由，让实际的API route处理
      quiet: false,
    })

    console.log("✅ MSW enabled - API requests will be mocked")
  } catch (error) {
    console.error("❌ Failed to initialize MSW:", error)
    console.warn("Falling back to real API calls (may cause 404 errors)")
  }
}


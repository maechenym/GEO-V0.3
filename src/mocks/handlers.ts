import { http, HttpResponse } from "msw"

/**
 * MSW Mock Handlers for Auth API
 * 
 * 所有认证相关的 API mock 处理器
 * 
 * 注意：使用相对路径匹配，MSW 会自动匹配所有匹配的请求
 */

// 模拟用户数据库（内存）
const mockUsers: Record<
  string,
  {
    id: string
    email: string
    hasBrand: boolean
    subscription?: {
      planId?: "basic" | "advanced" | "enterprise"
      planName?: string
      trialEndsAt?: string
      status?: "trial" | "active" | "canceled"
    }
  }
> = {
  "test@example.com": {
    id: "u_1",
    email: "test@example.com",
    hasBrand: true,
  },
  "test1@example.com": {
    id: "u_test1",
    email: "test1@example.com",
    hasBrand: true, // Waitlist结束后，用户已有品牌
    subscription: {
      planId: "basic", // 已有 Basic 订阅
      planName: "Basic",
      status: "active", // 可以改为 "canceled" 来测试取消状态
      trialEndsAt: null,
    },
  },
  "test1@gmail.com": {
    id: "u_test1_gmail",
    email: "test1@gmail.com",
    hasBrand: true, // Waitlist结束后，用户已有品牌
    subscription: {
      planId: undefined, // 还未选择订阅计划（等待期结束后的状态）
      planName: undefined,
      status: undefined,
      trialEndsAt: null,
    },
  },
  "new@example.com": {
    id: "u_2",
    email: "new@example.com",
    hasBrand: false,
  },
}

// 模拟团队成员数据库（内存）
const mockTeamMembers: Record<
  string,
  {
    id: string
    email: string
    role: "Admin" | "Viewer"
    updatedAt: string
  }
> = {}

// 模拟 Products 数据存储（内存）
const mockBrands: Record<string, any> = {}
const mockProducts: Record<string, any[]> = {}
const mockPersonas: Record<string, any[]> = {}
const mockCompetitors: Record<string, any[]> = {}

// 初始化英业达品牌和产品数据
const INVENTEC_BRAND_ID = "brand_inventec"
const INVENTEC_PRODUCTS = [
  "机架解决方案",
  "AI服务器",
  "通用服务器",
  "存储服务器",
  "网络交换机",
  "笔记本电脑",
  "台式机",
  "精简型电脑",
]

// 预定义的竞品列表（从JSON文件中提取的主要竞品）
const INVENTEC_COMPETITORS = [
  "HPE",
  "超微",
  "华硕",
  "浪潮",
  "戴尔",
  "Lenovo",
  "Cisco",
  "Huawei",
  "惠普",
  "联想",
  "华为",
  "新华三",
  "AMD",
  "NVIDIA",
  "英特尔",
  "威盛電子（VIA Technologies）",
  "Dell PowerEdge R770",
  "Nfina 4408T",
  "戴尔（Dell）",
  "惠普（HPE）",
]

// 为测试账号预初始化英业达数据
function preInitializeTestAccount() {
  const testEmail = "test@example.com"
  
  // 创建英业达品牌
  mockBrands[testEmail] = {
    id: INVENTEC_BRAND_ID,
    name: "英业达 (Inventec)",
  }

  // 初始化产品列表
  mockProducts[testEmail] = []
  mockCompetitors[testEmail] = []

  // 创建所有英业达产品
  INVENTEC_PRODUCTS.forEach((productName, index) => {
    const fullProductName = `英业达 (Inventec) ${productName}`
    const productId = `product_inventec_${index + 1}_${Date.now()}`
    
    mockProducts[testEmail].push({
      id: productId,
      brandId: INVENTEC_BRAND_ID,
      name: fullProductName,
      category: productName,
      active: true,
    })

    // 为第一个产品添加竞品
    if (index === 0) {
      INVENTEC_COMPETITORS.forEach((competitorName) => {
        mockCompetitors[testEmail].push({
          id: `competitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          brandId: INVENTEC_BRAND_ID,
          name: competitorName,
          product: fullProductName,
          region: null,
        })
      })
    }
  })

  console.log(`[MSW] Pre-initialized Inventec data for test@example.com`)
  console.log(`[MSW] - Brand: ${mockBrands[testEmail].name}`)
  console.log(`[MSW] - Products: ${mockProducts[testEmail].length}`)
  console.log(`[MSW] - Competitors: ${mockCompetitors[testEmail].length}`)
}

// 在模块加载时预初始化测试账号
preInitializeTestAccount()

// 初始化函数：为指定用户创建英业达品牌和产品
async function initializeInventecBrand(email: string) {
  try {
    console.log(`[MSW] initializeInventecBrand called for ${email}`)
    
    // 创建英业达品牌
    if (!mockBrands[email] || mockBrands[email].id !== INVENTEC_BRAND_ID) {
      mockBrands[email] = {
        id: INVENTEC_BRAND_ID,
        name: "英业达 (Inventec)",
      }
      console.log(`[MSW] Created Inventec brand for ${email}`)
    }

    // 初始化产品列表
    if (!mockProducts[email]) {
      mockProducts[email] = []
    }

    // 初始化竞品列表
    if (!mockCompetitors[email]) {
      mockCompetitors[email] = []
    }

    // 从JSON文件加载竞品数据（通过API route）
    // 注意：在MSW环境中，fetch可能无法访问API route，这里采用降级策略
    let competitorsData: Record<string, string[]> = {}
    const firstProductName = `英业达 (Inventec) ${INVENTEC_PRODUCTS[0]}`
    
    try {
      // 尝试从API route获取数据
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 1000) // 1秒超时
      
      try {
        const response = await fetch(`${baseUrl}/api/products-data`, {
          signal: controller.signal,
        })
        clearTimeout(timeoutId)
        
        if (response.ok) {
          const allData = await response.json()
          // 提取第一个产品的竞品列表作为品牌级别的竞品
          if (allData[firstProductName] && allData[firstProductName].length > 0) {
            const productData = allData[firstProductName][0][1]
            if (productData.overall && productData.overall.mention_rate) {
              competitorsData[firstProductName] = Object.keys(productData.overall.mention_rate)
            }
          }
        }
      } catch (fetchError) {
        clearTimeout(timeoutId)
        // 如果fetch失败，使用预定义的竞品列表
        competitorsData[firstProductName] = INVENTEC_COMPETITORS
        console.log(`[MSW] Fetch failed, using fallback competitors for ${email}`)
      }
    } catch (error) {
      console.warn(`[MSW] Failed to load competitors data for ${email}, using fallback:`, error)
      // 使用预定义的竞品列表作为后备
      competitorsData[firstProductName] = INVENTEC_COMPETITORS
    }

    // 创建所有英业达产品（如果不存在）
    INVENTEC_PRODUCTS.forEach((productName, index) => {
      const fullProductName = `英业达 (Inventec) ${productName}`
      const existingProduct = mockProducts[email].find(
        (p) => p.brandId === INVENTEC_BRAND_ID && p.name === fullProductName
      )

      if (!existingProduct) {
        const productId = `product_inventec_${index + 1}_${Date.now()}`
        mockProducts[email].push({
          id: productId,
          brandId: INVENTEC_BRAND_ID,
          name: fullProductName,
          category: productName,
          active: true,
        })

        // 为每个产品导入竞品（使用第一个产品的竞品列表，或从JSON中提取）
        if (competitorsData[firstProductName] && index === 0) {
          // 只为第一个产品添加竞品，避免重复
          competitorsData[firstProductName].slice(0, 20).forEach((competitorName) => {
            // 检查是否已存在
            const existingCompetitor = mockCompetitors[email].find(
              (c) => c.brandId === INVENTEC_BRAND_ID && c.name === competitorName
            )

            if (!existingCompetitor) {
              mockCompetitors[email].push({
                id: `competitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                brandId: INVENTEC_BRAND_ID,
                name: competitorName,
                product: fullProductName,
                region: null,
              })
            }
          })
        }
      }
    })

    console.log(`[MSW] Initialized Inventec brand for ${email}:`, {
      brand: mockBrands[email],
      productsCount: mockProducts[email].length,
      competitorsCount: mockCompetitors[email].length,
    })
  } catch (error) {
    console.error(`[MSW] Error in initializeInventecBrand for ${email}:`, error)
    // 即使出错，也要确保品牌存在
    if (!mockBrands[email]) {
      mockBrands[email] = {
        id: INVENTEC_BRAND_ID,
        name: "英业达 (Inventec)",
      }
    }
  }
}

export const handlers = [
  // POST /api/auth/signup
  http.post("*/api/auth/signup", async ({ request }) => {
    const body = await request.json()
    const { email, password } = body as { email: string; password: string }

    if (!email || !password) {
      return HttpResponse.json(
        { ok: false, error: "Email and password are required" },
        { status: 400 }
      )
    }

    // 检查是否已存在
    const existingUser = mockUsers[email]
    const isNew = !existingUser

    // 创建新用户（mock 模式下不验证密码）
    if (isNew) {
      mockUsers[email] = {
        id: `u_${Date.now()}`,
        email,
        hasBrand: false,
      }
    }

    return HttpResponse.json({
      ok: true,
      token: `mock_signup_token_${email}`,
      isNew,
    })
  }),

  // POST /api/auth/login
  http.post("*/api/auth/login", async ({ request }) => {
    const body = await request.json()
    const { email, password } = body as { email: string; password: string }

    if (!email || !password) {
      return HttpResponse.json(
        { ok: false, error: "Email and password are required" },
        { status: 400 }
      )
    }

    const user = mockUsers[email]
    const isNew = !user

    // 如果用户不存在，创建新用户（mock 模式下不验证密码）
    if (isNew) {
      mockUsers[email] = {
        id: `u_${Date.now()}`,
        email,
        hasBrand: false,
      }
    }

    return HttpResponse.json({
      ok: true,
      token: `mock_login_token_${email}`,
      isNew,
    })
  }),

  // POST /api/auth/magic-link
  http.post("*/api/auth/magic-link", async ({ request }) => {
    const body = await request.json()
    const email = (body as { email: string }).email

    // 模拟发送邮件（实际应用中会发送真实邮件）
    console.log(`[MSW] Magic link sent to: ${email}`)

    return HttpResponse.json({
      ok: true,
    })
  }),

  // GET /api/auth/magic-link/verify
  http.get("*/api/auth/magic-link/verify", async ({ request }) => {
    const url = new URL(request.url)
    const token = url.searchParams.get("token")

    if (!token || token === "invalid") {
      return HttpResponse.json(
        {
          ok: false,
          error: "Invalid token",
        },
        { status: 400 }
      )
    }

    // 从 token 中提取 email（模拟格式：email:xxx@example.com）
    const emailMatch = token.match(/email:(.+)/)
    const email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"

    const user = mockUsers[email]
    const isNew = !user

    if (isNew) {
      mockUsers[email] = {
        id: `u_${Date.now()}`,
        email,
        hasBrand: false,
      }
    }

    return HttpResponse.json({
      ok: true,
      token: `mock_magic_token_${email}`,
      isNew,
    })
  }),

  // GET /api/auth/session
  http.get("*/api/auth/session", async ({ request }) => {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return HttpResponse.json(
        {
          ok: false,
          error: "Unauthorized",
        },
        { status: 401 }
      )
    }

    // 从 token 中提取 email（支持多种 token 格式）
    // mock_login_token_email, mock_signup_token_email, mock_magic_token_email, mock_google_token_email
    const emailMatch = token.match(/mock_(?:login|signup|magic|google)_token_(.+)/)
    const email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"

    // 对于test@example.com或没有品牌的用户，自动初始化英业达品牌和所有产品
    if (email === "test@example.com" || !mockBrands[email]) {
      await initializeInventecBrand(email)
    }

    const user = mockUsers[email]

    if (!user) {
      // 如果用户不存在，创建一个新用户
      mockUsers[email] = {
        id: `u_${Date.now()}`,
        email,
        hasBrand: mockBrands[email] ? true : false,
      }
      const newUser = mockUsers[email]
      return HttpResponse.json({
        ok: true,
        profile: {
          id: newUser.id,
          email: newUser.email,
          hasBrand: newUser.hasBrand,
          role: "Admin" as const, // Default to Admin for new mock users
          subscription: newUser.subscription,
        },
      })
    }

    return HttpResponse.json({
      ok: true,
      profile: {
        id: user.id,
        email: user.email,
        hasBrand: user.hasBrand || (mockBrands[email] ? true : false),
        role: "Admin" as const, // Default to Admin for mock users
        subscription: user.subscription,
      },
    })
  }),

  // POST /api/auth/logout
  http.post("*/api/auth/logout", async () => {
    return HttpResponse.json({
      ok: true,
    })
  }),

  // POST /api/auth/change-password
  http.post("*/api/auth/change-password", async ({ request }) => {
    const { currentPassword, newPassword } = (await request.json()) as {
      currentPassword?: string
      newPassword?: string
    }

    if (!currentPassword || !newPassword) {
      return HttpResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return HttpResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    return HttpResponse.json({
      ok: true,
      message: "Password updated",
    })
  }),

  // POST /api/auth/google/start
  http.post("*/api/auth/google/start", async () => {
    return HttpResponse.json({
      ok: true,
      redirect: "/auth/google",
    })
  }),

  // GET /api/auth/google/callback
  http.get("*/api/auth/google/callback", async ({ request }) => {
    const url = new URL(request.url)
    const code = url.searchParams.get("code")

    if (code !== "mock") {
      return HttpResponse.json(
        {
          ok: false,
          error: "Invalid code",
        },
        { status: 400 }
      )
    }

    // 模拟 Google 登录用户
    const email = "google@example.com"
    const user = mockUsers[email]
    const isNew = !user

    if (isNew) {
      mockUsers[email] = {
        id: `u_${Date.now()}`,
        email,
        hasBrand: false,
      }
    }

    return HttpResponse.json({
      ok: true,
      token: `mock_google_token_${email}`,
      isNew,
    })
  }),

  // POST /api/onboarding/brand/suggest
  // 已移除：Step1 不再支持自动生成功能
  // http.post("*/api/onboarding/brand/suggest", async ({ request }) => {
  //   ...
  // }),

  // POST /api/onboarding/prompt/suggest - 已移除（prompt 页面已删除）
  // GET /api/prompts - 已移除（prompt 页面已删除）
  // POST /api/prompts - 已移除（prompt 页面已删除）
  // PATCH /api/prompts/:id - 已移除（prompt 页面已删除）
  // DELETE /api/prompts/:id - 已移除（prompt 页面已删除）

  // POST /api/analysis/initiate - 已移除（ai-analysis 页面已删除）
  // GET /api/analysis/status - 已移除（ai-analysis 页面已删除）

  // POST /api/onboarding/waitlist
  http.post("*/api/onboarding/waitlist", async ({ request }) => {
    const body = await request.json() as {
      brandName?: string
      productName?: string
    }

    // 验证必填字段
    if (!body.brandName || !body.productName) {
      return HttpResponse.json(
        {
          error: "brandName and productName are required",
        },
        { status: 400 }
      )
    }

    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 500))

    return HttpResponse.json({
      ok: true,
      message: "Successfully joined waitlist",
    })
  }),

  // POST /api/stripe/create-setup-intent
  http.post("*/api/stripe/create-setup-intent", async () => {
    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 300))

    // 返回假的 client_secret
    return HttpResponse.json({
      client_secret: "seti_mock_secret_test_123456789",
    })
  }),

  // POST /api/plan/activate
  http.post("*/api/plan/activate", async ({ request }) => {
    const body = await request.json() as { payment_method_id?: string }

    // 验证 payment_method_id
    if (!body.payment_method_id) {
      return HttpResponse.json(
        {
          error: "payment_method_id is required",
        },
        { status: 400 }
      )
    }

    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 计算试用结束时间（7 天后）
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 7)

    return HttpResponse.json({
      trialEndsAt: trialEndsAt.toISOString(),
      plan: "trial",
    })
  }),

  // Team Management Mock Handlers
  // GET /api/team
  http.get("*/api/team", async ({ request }) => {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return HttpResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 }
      )
    }

    // 从 token 中提取 email
    const emailMatch = token.match(/mock_(?:login|signup|magic|google)_token_(.+)/)
    const currentUserEmail = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"

    // 如果当前用户不在成员列表中，自动添加为 Admin
    if (!mockTeamMembers[currentUserEmail]) {
      const now = new Date().toISOString()
      mockTeamMembers[currentUserEmail] = {
        id: `member_${Date.now()}`,
        email: currentUserEmail,
        role: "Admin",
        updatedAt: now,
      }
    }

    // 如果成员列表只有当前用户（或为空），生成 2-3 个虚拟成员
    const existingCount = Object.keys(mockTeamMembers).length
    if (existingCount <= 1) {
      const mockEmails = [
        "alice@example.com",
        "bob@example.com",
        "charlie@example.com",
      ]
      const roles: ("Admin" | "Viewer")[] = ["Viewer", "Viewer", "Viewer"]
      
      // 生成 2-3 个成员（排除已存在的邮箱）
      const availableEmails = mockEmails.filter((email) => !mockTeamMembers[email])
      const count = Math.min(Math.floor(Math.random() * 2) + 2, availableEmails.length) // 2-3
      
      for (let i = 0; i < count; i++) {
        const email = availableEmails[i]
        if (!mockTeamMembers[email]) {
          mockTeamMembers[email] = {
            id: `member_${Date.now()}_${i}`,
            email,
            role: roles[i] || "Viewer",
            updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // 最近7天内
          }
        }
      }
    }

    // 返回所有成员
    const members = Object.values(mockTeamMembers)

    await new Promise((resolve) => setTimeout(resolve, 300))

    return HttpResponse.json({
      members,
    })
  }),

  // POST /api/team/invite
  http.post("*/api/team/invite", async ({ request }) => {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return HttpResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 }
      )
    }

    const body = await request.json() as { email: string; role: "Admin" | "Viewer" }

    if (!body.email || !body.role) {
      return HttpResponse.json(
        {
          error: "Email and role are required",
        },
        { status: 400 }
      )
    }

    // 检查是否已存在
    if (mockTeamMembers[body.email]) {
      return HttpResponse.json(
        {
          error: "Member already exists",
        },
        { status: 400 }
      )
    }

    // 创建新成员
    const now = new Date().toISOString()
    const newMember = {
      id: `member_${Date.now()}`,
      email: body.email,
      role: body.role,
      updatedAt: now,
    }

    mockTeamMembers[body.email] = newMember

    await new Promise((resolve) => setTimeout(resolve, 500))

    return HttpResponse.json({
      member: newMember,
    })
  }),

  // PATCH /api/team/:id
  http.patch("*/api/team/:id", async ({ request, params }) => {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return HttpResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 }
      )
    }

    const { id } = params as { id: string }
    const body = await request.json() as { role: "Admin" | "Viewer" }

    if (!body.role) {
      return HttpResponse.json(
        {
          error: "role is required",
        },
        { status: 400 }
      )
    }

    // 查找成员
    const member = Object.values(mockTeamMembers).find((m) => m.id === id)

    if (!member) {
      return HttpResponse.json(
        {
          error: "Member not found",
        },
        { status: 404 }
      )
    }

    // 更新角色
    member.role = body.role
    member.updatedAt = new Date().toISOString()

    await new Promise((resolve) => setTimeout(resolve, 300))

    return HttpResponse.json({
      member,
    })
  }),

  // DELETE /api/team/:id
  http.delete("*/api/team/:id", async ({ request, params }) => {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return HttpResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 }
      )
    }

    // 从 token 中提取 email
    const emailMatch = token.match(/mock_(?:login|signup|magic|google)_token_(.+)/)
    const currentUserEmail = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"

    // 查找当前用户
    const currentUser = Object.values(mockTeamMembers).find((m) => m.email === currentUserEmail)

    // 业务校验1: 检查当前用户是否为 Admin
    if (!currentUser || currentUser.role !== "Admin") {
      return HttpResponse.json(
        {
          ok: false,
          message: "forbidden",
        },
        { status: 403 }
      )
    }

    const { id } = params as { id: string }

    // 查找要删除的成员
    const member = Object.values(mockTeamMembers).find((m) => m.id === id)

    if (!member) {
      return HttpResponse.json(
        {
          ok: false,
          error: "Member not found",
        },
        { status: 404 }
      )
    }

    // 业务校验2: 检查是否只有1位成员
    const totalMembers = Object.keys(mockTeamMembers).length
    if (totalMembers <= 1) {
      return HttpResponse.json(
        {
          ok: false,
          message: "only_one_member",
        },
        { status: 409 }
      )
    }

    // 删除成员
    delete mockTeamMembers[member.email]

    await new Promise((resolve) => setTimeout(resolve, 300))

    return HttpResponse.json({
      ok: true,
    })
  }),

  // Stripe Checkout Session Mock Handler
  // POST /api/stripe/create-checkout-session
  http.post("*/api/stripe/create-checkout-session", async ({ request }) => {
    const body = await request.json() as { 
      priceId?: string; 
      planId: string;
      trialPeriodDays?: number;
      isUpgrade?: boolean;
      currentPlanId?: string;
    }

    // Mock mode: 模拟成功创建 checkout session
    await new Promise((resolve) => setTimeout(resolve, 300))

    return HttpResponse.json({
      checkoutUrl: null, // Mock 模式下返回 null，前端会处理为模拟成功
      message: "Mock checkout session created",
      isUpgrade: body.isUpgrade || false,
    })
  }),

  // POST /api/stripe/create-portal-session
  http.post("*/api/stripe/create-portal-session", async ({ request }) => {
    // Mock mode: 模拟成功创建 portal session
    await new Promise((resolve) => setTimeout(resolve, 300))

    return HttpResponse.json({
      portalUrl: null, // Mock 模式下返回 null
      message: "Mock portal session created",
    })
  }),

  // GET /api/stripe/invoices
  http.get("*/api/stripe/invoices", async ({ request }) => {
    // Mock mode: 返回模拟的账单列表
    await new Promise((resolve) => setTimeout(resolve, 300))

    const now = new Date()
    const mockInvoices = [
      {
        id: "inv_mock_1",
        number: "INV-2025-001",
        amount_paid: 29900, // $299.00 in cents
        amount_due: 0,
        currency: "usd",
        status: "paid",
        created: Math.floor((now.getTime() - 7 * 24 * 60 * 60 * 1000) / 1000), // 7天前
        period_start: Math.floor((now.getTime() - 7 * 24 * 60 * 60 * 1000) / 1000),
        period_end: Math.floor((now.getTime() + 23 * 24 * 60 * 60 * 1000) / 1000), // 23天后
        hosted_invoice_url: null,
        invoice_pdf: null,
        description: "Basic Plan - Monthly Subscription",
      },
      {
        id: "inv_mock_2",
        number: "INV-2024-012",
        amount_paid: 29900,
        amount_due: 0,
        currency: "usd",
        status: "paid",
        created: Math.floor((now.getTime() - 37 * 24 * 60 * 60 * 1000) / 1000), // 37天前
        period_start: Math.floor((now.getTime() - 37 * 24 * 60 * 60 * 1000) / 1000),
        period_end: Math.floor((now.getTime() - 7 * 24 * 60 * 60 * 1000) / 1000),
        hosted_invoice_url: null,
        invoice_pdf: null,
        description: "Basic Plan - Monthly Subscription",
      },
      {
        id: "inv_mock_3",
        number: "INV-2024-011",
        amount_paid: 29900,
        amount_due: 0,
        currency: "usd",
        status: "paid",
        created: Math.floor((now.getTime() - 67 * 24 * 60 * 60 * 1000) / 1000), // 67天前
        period_start: Math.floor((now.getTime() - 67 * 24 * 60 * 60 * 1000) / 1000),
        period_end: Math.floor((now.getTime() - 37 * 24 * 60 * 60 * 1000) / 1000),
        hosted_invoice_url: null,
        invoice_pdf: null,
        description: "Basic Plan - Monthly Subscription",
      },
    ]

    return HttpResponse.json({
      invoices: mockInvoices,
      has_more: false,
    })
  }),

  // Products Management Mock Handlers
  // GET /api/products/brand
  http.get("*/api/products/brand", async ({ request }) => {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const emailMatch = token.match(/mock_(?:login|signup|magic|google)_token_(.+)/)
    const email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"

    // Get or create brand for this user
    if (!mockBrands[email]) {
      mockBrands[email] = {
        id: `brand_${Date.now()}`,
        name: "My Brand",
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 300))

    return HttpResponse.json({
      brand: mockBrands[email],
    })
  }),

  // PATCH /api/products/brand
  http.patch("*/api/products/brand", async ({ request }) => {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const emailMatch = token.match(/mock_(?:login|signup|magic|google)_token_(.+)/)
    const email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"

    const body = await request.json() as any

    if (!mockBrands[email]) {
      mockBrands[email] = {
        id: `brand_${Date.now()}`,
        name: "",
      }
    }

    mockBrands[email] = {
      ...mockBrands[email],
      ...body,
    }

    await new Promise((resolve) => setTimeout(resolve, 300))

    return HttpResponse.json({
      brand: mockBrands[email],
    })
  }),

  // GET /api/products
  http.get("*/api/products", async ({ request }) => {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const emailMatch = token.match(/mock_(?:login|signup|magic|google)_token_(.+)/)
    const email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"

    // 确保初始化英业达品牌和所有产品
    if (!mockBrands[email] || mockBrands[email].id === INVENTEC_BRAND_ID) {
      await initializeInventecBrand(email)
    }

    if (!mockProducts[email]) {
      mockProducts[email] = []
    }

    await new Promise((resolve) => setTimeout(resolve, 200))

    console.log(`[MSW] GET /api/products for ${email}: ${mockProducts[email].length} products`)
    console.log(`[MSW] Products:`, mockProducts[email].map(p => p.name))

    return HttpResponse.json({
      products: mockProducts[email],
    })
  }),

  // POST /api/products
  http.post("*/api/products", async ({ request }) => {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const emailMatch = token.match(/mock_(?:login|signup|magic|google)_token_(.+)/)
    const email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"

    const body = await request.json() as any

    if (!mockProducts[email]) {
      mockProducts[email] = []
    }

    const brandId = mockBrands[email]?.id || `brand_${Date.now()}`

    const newProduct = {
      id: `product_${Date.now()}`,
      brandId,
      name: body.name,
      category: body.category || null,
      active: true,
    }

    mockProducts[email].push(newProduct)

    await new Promise((resolve) => setTimeout(resolve, 300))

    return HttpResponse.json({
      product: newProduct,
    })
  }),

  // GET /api/products/:id
  http.get("*/api/products/:id", async ({ request, params }) => {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "") || null

    // Default email if no token (for development/testing)
    let email = "test@example.com"
    if (token) {
      const emailMatch = token.match(/mock_(?:login|signup|magic|google)_token_(.+)/)
      email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"
    }

    const { id } = params as { id: string }

    console.log(`[MSW] GET /api/products/:id - email: ${email}, id: ${id}`)

    // 初始化英业达品牌和产品
    await initializeInventecBrand(email)

    if (!mockProducts[email]) {
      mockProducts[email] = []
    }

    const product = mockProducts[email].find((p) => p.id === id)

    if (!product) {
      return HttpResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    await new Promise((resolve) => setTimeout(resolve, 200))

    return HttpResponse.json({
      product,
    })
  }),

  // PATCH /api/products/:id
  http.patch("*/api/products/:id", async ({ request, params }) => {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const emailMatch = token.match(/mock_(?:login|signup|magic|google)_token_(.+)/)
    const email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"

    const { id } = params as { id: string }
    const body = await request.json() as any

    if (!mockProducts[email]) {
      mockProducts[email] = []
    }

    const productIndex = mockProducts[email].findIndex((p) => p.id === id)

    if (productIndex === -1) {
      return HttpResponse.json({ error: "Product not found" }, { status: 404 })
    }

    mockProducts[email][productIndex] = {
      ...mockProducts[email][productIndex],
      ...body,
    }

    await new Promise((resolve) => setTimeout(resolve, 300))

    return HttpResponse.json({
      product: mockProducts[email][productIndex],
    })
  }),

  // DELETE /api/products/:id
  http.delete("*/api/products/:id", async ({ request, params }) => {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const emailMatch = token.match(/mock_(?:login|signup|magic|google)_token_(.+)/)
    const email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"

    const { id } = params as { id: string }

    if (!mockProducts[email]) {
      mockProducts[email] = []
    }

    mockProducts[email] = mockProducts[email].filter((p) => p.id !== id)

    await new Promise((resolve) => setTimeout(resolve, 300))

    return HttpResponse.json({
      ok: true,
    })
  }),

  // GET /api/products/personas
  http.get("*/api/products/personas", async ({ request }) => {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const emailMatch = token.match(/mock_(?:login|signup|magic|google)_token_(.+)/)
    const email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"

    if (!mockPersonas[email]) {
      mockPersonas[email] = []
    }

    await new Promise((resolve) => setTimeout(resolve, 200))

    return HttpResponse.json({
      personas: mockPersonas[email],
    })
  }),

  // POST /api/products/personas
  http.post("*/api/products/personas", async ({ request }) => {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const emailMatch = token.match(/mock_(?:login|signup|magic|google)_token_(.+)/)
    const email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"

    const body = await request.json() as any

    if (!mockPersonas[email]) {
      mockPersonas[email] = []
    }

    const brandId = mockBrands[email]?.id || `brand_${Date.now()}`

    const newPersona = {
      id: `persona_${Date.now()}`,
      brandId,
      name: body.name,
      description: body.description || null,
      region: body.region || null,
    }

    mockPersonas[email].push(newPersona)

    await new Promise((resolve) => setTimeout(resolve, 300))

    return HttpResponse.json({
      persona: newPersona,
    })
  }),

  // PATCH /api/products/personas/:id
  http.patch("*/api/products/personas/:id", async ({ request, params }) => {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const emailMatch = token.match(/mock_(?:login|signup|magic|google)_token_(.+)/)
    const email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"

    const { id } = params as { id: string }
    const body = await request.json() as any

    if (!mockPersonas[email]) {
      mockPersonas[email] = []
    }

    const personaIndex = mockPersonas[email].findIndex((p) => p.id === id)

    if (personaIndex === -1) {
      return HttpResponse.json({ error: "Persona not found" }, { status: 404 })
    }

    mockPersonas[email][personaIndex] = {
      ...mockPersonas[email][personaIndex],
      ...body,
    }

    await new Promise((resolve) => setTimeout(resolve, 300))

    return HttpResponse.json({
      persona: mockPersonas[email][personaIndex],
    })
  }),

  // DELETE /api/products/personas/:id
  http.delete("*/api/products/personas/:id", async ({ request, params }) => {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const emailMatch = token.match(/mock_(?:login|signup|magic|google)_token_(.+)/)
    const email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"

    const { id } = params as { id: string }

    if (!mockPersonas[email]) {
      mockPersonas[email] = []
    }

    mockPersonas[email] = mockPersonas[email].filter((p) => p.id !== id)

    await new Promise((resolve) => setTimeout(resolve, 300))

    return HttpResponse.json({
      ok: true,
    })
  }),

  // GET /api/products/competitors
  http.get("*/api/products/competitors", async ({ request }) => {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const emailMatch = token.match(/mock_(?:login|signup|magic|google)_token_(.+)/)
    const email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"

    if (!mockCompetitors[email]) {
      mockCompetitors[email] = []
    }

    await new Promise((resolve) => setTimeout(resolve, 200))

    return HttpResponse.json({
      competitors: mockCompetitors[email],
    })
  }),

  // POST /api/products/competitors
  http.post("*/api/products/competitors", async ({ request }) => {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const emailMatch = token.match(/mock_(?:login|signup|magic|google)_token_(.+)/)
    const email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"

    const body = await request.json() as any

    if (!mockCompetitors[email]) {
      mockCompetitors[email] = []
    }

    const brandId = mockBrands[email]?.id || `brand_${Date.now()}`

    const newCompetitor = {
      id: `competitor_${Date.now()}`,
      brandId,
      name: body.name,
      product: body.product || null,
      region: body.region || null,
    }

    mockCompetitors[email].push(newCompetitor)

    await new Promise((resolve) => setTimeout(resolve, 300))

    return HttpResponse.json({
      competitor: newCompetitor,
    })
  }),

  // PATCH /api/products/competitors/:id
  http.patch("*/api/products/competitors/:id", async ({ request, params }) => {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const emailMatch = token.match(/mock_(?:login|signup|magic|google)_token_(.+)/)
    const email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"

    const { id } = params as { id: string }
    const body = await request.json() as any

    if (!mockCompetitors[email]) {
      mockCompetitors[email] = []
    }

    const competitorIndex = mockCompetitors[email].findIndex((c) => c.id === id)

    if (competitorIndex === -1) {
      return HttpResponse.json({ error: "Competitor not found" }, { status: 404 })
    }

    mockCompetitors[email][competitorIndex] = {
      ...mockCompetitors[email][competitorIndex],
      ...body,
    }

    await new Promise((resolve) => setTimeout(resolve, 300))

    return HttpResponse.json({
      competitor: mockCompetitors[email][competitorIndex],
    })
  }),

  // DELETE /api/products/competitors/:id
  http.delete("*/api/products/competitors/:id", async ({ request, params }) => {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const emailMatch = token.match(/mock_(?:login|signup|magic|google)_token_(.+)/)
    const email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"

    const { id } = params as { id: string }

    if (!mockCompetitors[email]) {
      mockCompetitors[email] = []
    }

    mockCompetitors[email] = mockCompetitors[email].filter((c) => c.id !== id)

    await new Promise((resolve) => setTimeout(resolve, 300))

    return HttpResponse.json({
      ok: true,
    })
  }),

  // New Brands API Endpoints
  // GET /api/brands
  http.get("*/api/brands", async ({ request }) => {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    // Default email if no token (for development/testing)
    let email = "test@example.com"
    if (token) {
      const emailMatch = token.match(/mock_(?:login|signup|magic|google)_token_(.+)/)
      email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"
    }

    // 初始化英业达品牌和产品
    await initializeInventecBrand(email)

    // Get all brands for this user (including Inventec)
    const brands = []
    
    // 对于test@example.com，总是返回英业达品牌
    if (email === "test@example.com") {
      if (mockBrands[email] && mockBrands[email].id === INVENTEC_BRAND_ID) {
        brands.push(mockBrands[email])
      } else {
        // 如果品牌ID不对，重新初始化
        await initializeInventecBrand(email)
        if (mockBrands[email]) {
          brands.push(mockBrands[email])
        }
      }
    } else {
      // 对于其他用户，返回他们所有的品牌
      if (mockBrands[email]) {
        brands.push(mockBrands[email])
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 200))

    return HttpResponse.json({
      brands: brands,
    })
  }),

  // GET /api/brands/:id
  http.get("*/api/brands/:id", async ({ request, params }) => {
    console.log("[MSW] Handler matched: GET /api/brands/:id")
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "") || null

    // Default email if no token (for development/testing)
    let email = "test@example.com"
    if (token) {
      const emailMatch = token.match(/mock_(?:login|signup|magic|google)_token_(.+)/)
      email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"
    }

    const { id } = params as { id: string }

    console.log(`[MSW] GET /api/brands/:id - email: ${email}, id: ${id}, token: ${token ? "present" : "missing"}`)

    // 如果是英业达品牌ID，确保初始化
    if (id === INVENTEC_BRAND_ID) {
      console.log(`[MSW] Initializing Inventec brand for ${email}`)
      await initializeInventecBrand(email)
      
      // 确保返回英业达品牌
      if (mockBrands[email]) {
        console.log(`[MSW] Returning Inventec brand:`, mockBrands[email])
        await new Promise((resolve) => setTimeout(resolve, 200))
        return HttpResponse.json({
          brand: mockBrands[email],
        })
      }
    }

    // 对于test@example.com，总是使用英业达品牌
    if (email === "test@example.com") {
      await initializeInventecBrand(email)
      // 确保返回英业达品牌，不管请求的ID是什么
      if (mockBrands[email]) {
        console.log(`[MSW] Returning Inventec brand for test@example.com:`, mockBrands[email])
        await new Promise((resolve) => setTimeout(resolve, 200))
        return HttpResponse.json({
          brand: mockBrands[email],
        })
      }
    }

    // Get brand
    if (!mockBrands[email]) {
      console.log(`[MSW] No brand found for ${email}, creating default`)
      // Create brand with the requested ID
      mockBrands[email] = {
        id: id,
        name: "My Brand",
      }
    } else {
      console.log(`[MSW] Found brand for ${email}:`, mockBrands[email])
      // If requesting Inventec brand but we have a different brand, return Inventec
      if (id === INVENTEC_BRAND_ID && mockBrands[email].id !== INVENTEC_BRAND_ID) {
        console.log(`[MSW] Requesting Inventec brand but have different brand, initializing Inventec`)
        await initializeInventecBrand(email)
      }
    }

    // Ensure brand exists
    if (!mockBrands[email]) {
      console.error(`[MSW] Brand still not found for ${email} after initialization`)
      return HttpResponse.json(
        { error: "Brand not found" },
        { status: 404 }
      )
    }

    await new Promise((resolve) => setTimeout(resolve, 200))

    console.log(`[MSW] Returning brand:`, mockBrands[email])
    return HttpResponse.json({
      brand: mockBrands[email],
    })
  }),

  // POST /api/brands
  http.post("*/api/brands", async ({ request }) => {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    // Default email if no token (for development/testing)
    let email = "test@example.com"
    if (token) {
      const emailMatch = token.match(/mock_(?:login|signup|magic|google)_token_(.+)/)
      email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"
    }

    const body = await request.json() as any

    // 对于test@example.com，不允许创建新品牌，总是返回英业达品牌
    if (email === "test@example.com") {
      await initializeInventecBrand(email)
      if (mockBrands[email]) {
        await new Promise((resolve) => setTimeout(resolve, 300))
        return HttpResponse.json({
          brand: mockBrands[email],
        })
      }
    }

    const newBrand = {
      id: `brand_${Date.now()}`,
      name: body.name,
    }

    mockBrands[email] = newBrand

    await new Promise((resolve) => setTimeout(resolve, 300))

    return HttpResponse.json({
      brand: newBrand,
    })
  }),

  // PATCH /api/brands/:id
  http.patch("*/api/brands/:id", async ({ request, params }) => {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const emailMatch = token.match(/mock_(?:login|signup|magic|google)_token_(.+)/)
    const email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"

    const { id } = params as { id: string }
    const body = await request.json() as any

    if (!mockBrands[email] || mockBrands[email].id !== id) {
      return HttpResponse.json({ error: "Brand not found" }, { status: 404 })
    }

    mockBrands[email] = {
      ...mockBrands[email],
      ...body,
    }

    await new Promise((resolve) => setTimeout(resolve, 300))

    return HttpResponse.json({
      brand: mockBrands[email],
    })
  }),

  // DELETE /api/brands/:id
  http.delete("*/api/brands/:id", async ({ request, params }) => {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const emailMatch = token.match(/mock_(?:login|signup|magic|google)_token_(.+)/)
    const email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"

    const { id } = params as { id: string }

    if (mockBrands[email] && mockBrands[email].id === id) {
      delete mockBrands[email]
    }

    await new Promise((resolve) => setTimeout(resolve, 300))

    return HttpResponse.json({
      ok: true,
    })
  }),

  // GET /api/brands/:brandId/products
  http.get("*/api/brands/:brandId/products", async ({ request, params }) => {
    console.log("[MSW] Handler matched: GET /api/brands/:brandId/products")
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "") || null

    // Default email if no token (for development/testing)
    let email = "test@example.com"
    if (token) {
      const emailMatch = token.match(/mock_(?:login|signup|magic|google)_token_(.+)/)
      email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"
    }

    const { brandId } = params as { brandId: string }

    console.log(`[MSW] GET /api/brands/:brandId/products - email: ${email}, brandId: ${brandId}`)

    // 对于test@example.com，总是使用英业达品牌
    const actualBrandId = email === "test@example.com" ? INVENTEC_BRAND_ID : brandId

    // 初始化英业达品牌和产品
    if (actualBrandId === INVENTEC_BRAND_ID || brandId === INVENTEC_BRAND_ID) {
      console.log(`[MSW] Initializing Inventec brand and products for ${email}`)
      await initializeInventecBrand(email)
    }

    if (!mockProducts[email]) {
      mockProducts[email] = []
    }

    const brandProducts = mockProducts[email].filter((p) => p.brandId === actualBrandId || p.brandId === brandId)

    console.log(`[MSW] Returning ${brandProducts.length} products for brand ${actualBrandId}`)

    await new Promise((resolve) => setTimeout(resolve, 200))

    return HttpResponse.json({
      products: brandProducts,
    })
  }),

  // POST /api/brands/:brandId/products
  http.post("*/api/brands/:brandId/products", async ({ request, params }) => {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const emailMatch = token.match(/mock_(?:login|signup|magic|google)_token_(.+)/)
    const email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"

    const { brandId } = params as { brandId: string }
    const body = await request.json() as any

    if (!mockProducts[email]) {
      mockProducts[email] = []
    }

    // Check for duplicate name within the same brand
    const existingProduct = mockProducts[email].find(
      (p) => p.brandId === brandId && p.name === body.name
    )
    if (existingProduct) {
      return HttpResponse.json(
        { error: "Product with this name already exists" },
        { status: 400 }
      )
    }

    const newProduct = {
      id: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      brandId,
      name: body.name,
      category: body.category || null,
      active: true,
    }

    mockProducts[email].push(newProduct)

    await new Promise((resolve) => setTimeout(resolve, 300))

    return HttpResponse.json({
      product: newProduct,
    })
  }),

  // GET /api/brands/:brandId/personas
  http.get("*/api/brands/:brandId/personas", async ({ request, params }) => {
    console.log("[MSW] Handler matched: GET /api/brands/:brandId/personas")
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "") || null

    // Default email if no token (for development/testing)
    let email = "test@example.com"
    if (token) {
      const emailMatch = token.match(/mock_(?:login|signup|magic|google)_token_(.+)/)
      email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"
    }

    const { brandId } = params as { brandId: string }

    // 对于test@example.com，总是使用英业达品牌
    const actualBrandId = email === "test@example.com" ? INVENTEC_BRAND_ID : brandId

    // 初始化英业达品牌
    if (actualBrandId === INVENTEC_BRAND_ID) {
      await initializeInventecBrand(email)
    }

    if (!mockPersonas[email]) {
      mockPersonas[email] = []
    }

    const brandPersonas = mockPersonas[email].filter((p) => p.brandId === actualBrandId)

    await new Promise((resolve) => setTimeout(resolve, 200))

    return HttpResponse.json({
      personas: brandPersonas,
    })
  }),

  // POST /api/brands/:brandId/personas
  http.post("*/api/brands/:brandId/personas", async ({ request, params }) => {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const emailMatch = token.match(/mock_(?:login|signup|magic|google)_token_(.+)/)
    const email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"

    const { brandId } = params as { brandId: string }
    const body = await request.json() as any

    if (!mockPersonas[email]) {
      mockPersonas[email] = []
    }

    // Check for duplicate name within the same brand
    const existingPersona = mockPersonas[email].find(
      (p) => p.brandId === brandId && p.name === body.name
    )
    if (existingPersona) {
      return HttpResponse.json(
        { error: "Persona with this name already exists" },
        { status: 400 }
      )
    }

    const newPersona = {
      id: `persona_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      brandId,
      name: body.name,
      description: body.description || null,
      region: body.region || null,
    }

    mockPersonas[email].push(newPersona)

    await new Promise((resolve) => setTimeout(resolve, 300))

    return HttpResponse.json({
      persona: newPersona,
    })
  }),

  // GET /api/brands/:brandId/competitors
  http.get("*/api/brands/:brandId/competitors", async ({ request, params }) => {
    console.log("[MSW] Handler matched: GET /api/brands/:brandId/competitors")
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "") || null

    // Default email if no token (for development/testing)
    let email = "test@example.com"
    if (token) {
      const emailMatch = token.match(/mock_(?:login|signup|magic|google)_token_(.+)/)
      email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"
    }

    const { brandId } = params as { brandId: string }

    // 对于test@example.com，总是使用英业达品牌
    const actualBrandId = email === "test@example.com" ? INVENTEC_BRAND_ID : brandId

    // 初始化英业达品牌
    if (actualBrandId === INVENTEC_BRAND_ID) {
      await initializeInventecBrand(email)
    }

    if (!mockCompetitors[email]) {
      mockCompetitors[email] = []
    }

    const brandCompetitors = mockCompetitors[email].filter((c) => c.brandId === actualBrandId)

    await new Promise((resolve) => setTimeout(resolve, 200))

    return HttpResponse.json({
      competitors: brandCompetitors,
    })
  }),

  // POST /api/brands/:brandId/competitors
  http.post("*/api/brands/:brandId/competitors", async ({ request, params }) => {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const emailMatch = token.match(/mock_(?:login|signup|magic|google)_token_(.+)/)
    const email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"

    const { brandId } = params as { brandId: string }
    const body = await request.json() as any

    if (!mockCompetitors[email]) {
      mockCompetitors[email] = []
    }

    // Check for duplicate name within the same brand
    const existingCompetitor = mockCompetitors[email].find(
      (c) => c.brandId === brandId && c.name === body.name
    )
    if (existingCompetitor) {
      return HttpResponse.json(
        { error: "Competitor with this name already exists" },
        { status: 400 }
      )
    }

    const newCompetitor = {
      id: `competitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      brandId,
      name: body.name,
      product: body.product || null,
      region: body.region || null,
    }

    mockCompetitors[email].push(newCompetitor)

    await new Promise((resolve) => setTimeout(resolve, 300))

    return HttpResponse.json({
      competitor: newCompetitor,
    })
  }),

  // PATCH /api/products/:id (for products)
  // Already exists above, keeping for compatibility

  // PATCH /api/personas/:id
  http.patch("*/api/personas/:id", async ({ request, params }) => {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const emailMatch = token.match(/mock_(?:login|signup|magic|google)_token_(.+)/)
    const email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"

    const { id } = params as { id: string }
    const body = await request.json() as any

    if (!mockPersonas[email]) {
      mockPersonas[email] = []
    }

    const personaIndex = mockPersonas[email].findIndex((p) => p.id === id)

    if (personaIndex === -1) {
      return HttpResponse.json({ error: "Persona not found" }, { status: 404 })
    }

    mockPersonas[email][personaIndex] = {
      ...mockPersonas[email][personaIndex],
      ...body,
    }

    await new Promise((resolve) => setTimeout(resolve, 300))

    return HttpResponse.json({
      persona: mockPersonas[email][personaIndex],
    })
  }),

  // DELETE /api/personas/:id
  http.delete("*/api/personas/:id", async ({ request, params }) => {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const emailMatch = token.match(/mock_(?:login|signup|magic|google)_token_(.+)/)
    const email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"

    const { id } = params as { id: string }

    if (!mockPersonas[email]) {
      mockPersonas[email] = []
    }

    mockPersonas[email] = mockPersonas[email].filter((p) => p.id !== id)

    await new Promise((resolve) => setTimeout(resolve, 300))

    return HttpResponse.json({
      ok: true,
    })
  }),

  // PATCH /api/competitors/:id
  http.patch("*/api/competitors/:id", async ({ request, params }) => {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const emailMatch = token.match(/mock_(?:login|signup|magic|google)_token_(.+)/)
    const email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"

    const { id } = params as { id: string }
    const body = await request.json() as any

    if (!mockCompetitors[email]) {
      mockCompetitors[email] = []
    }

    const competitorIndex = mockCompetitors[email].findIndex((c) => c.id === id)

    if (competitorIndex === -1) {
      return HttpResponse.json({ error: "Competitor not found" }, { status: 404 })
    }

    mockCompetitors[email][competitorIndex] = {
      ...mockCompetitors[email][competitorIndex],
      ...body,
    }

    await new Promise((resolve) => setTimeout(resolve, 300))

    return HttpResponse.json({
      competitor: mockCompetitors[email][competitorIndex],
    })
  }),

  // DELETE /api/competitors/:id
  http.delete("*/api/competitors/:id", async ({ request, params }) => {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const emailMatch = token.match(/mock_(?:login|signup|magic|google)_token_(.+)/)
    const email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"

    const { id } = params as { id: string }

    if (!mockCompetitors[email]) {
      mockCompetitors[email] = []
    }

    await new Promise((resolve) => setTimeout(resolve, 300))

    return HttpResponse.json({
      ok: true,
    })
  }),


  // GET /api/products/:id/analytics
  // 获取产品分析数据（从JSON文件读取）
  http.get("*/api/products/:id/analytics", async ({ request, params }) => {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params as { id: string }
    const url = new URL(request.url)
    const startDate = url.searchParams.get("startDate")
    const endDate = url.searchParams.get("endDate")

    // 解码产品名称（URL编码）
    const productName = decodeURIComponent(id)

    try {
      // 在MSW中，我们需要通过实际的API route获取数据
      // 但由于MSW可能会拦截这个请求，我们使用外部fetch
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
      
      // 使用fetch获取数据，但需要确保不被MSW拦截
      // 方法：使用一个特殊的header或者直接调用
      const response = await fetch(`${baseUrl}/api/products-data`)

      if (!response.ok) {
        return HttpResponse.json(
          { error: "Failed to load product data" },
          { status: 500 }
        )
      }

      const allData = await response.json()

      if (!allData[productName]) {
        return HttpResponse.json(
          { error: "Product not found" },
          { status: 404 }
        )
      }

      let productData = allData[productName]

      // 如果指定了日期范围，过滤数据
      if (startDate && endDate) {
        productData = productData.filter(([date]: [string, any]) => {
          return date >= startDate && date <= endDate
        })
      }

      await new Promise((resolve) => setTimeout(resolve, 300))

      return HttpResponse.json({
        productName,
        data: productData,
      })
    } catch (error) {
      console.error("Error fetching product analytics:", error)
      return HttpResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }
  }),

  http.get("*/api/visibility/metrics", async ({ request }) => {
    const url = new URL(request.url)
    const start = url.searchParams.get("start") || "2024-01-01"
    const end = url.searchParams.get("end") || "2024-01-07"
    const tz = url.searchParams.get("tz") || "Asia/Shanghai"
    const productId = url.searchParams.get("productId") || "all"

    // Calculate days
    const startDate = new Date(start)
    const endDate = new Date(end)
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

    // Mock metrics data
    await new Promise((resolve) => setTimeout(resolve, 300))

    return HttpResponse.json({
      period: { start, end, days },
      reach: { value: 74.3, growth: days === 1 ? 2.1 : 1.5 },
      rank: { value: 2.0, growth: days === 1 ? -0.3 : -0.5 },
      focus: { value: 33.5, growth: days === 1 ? 3.8 : 2.8 },
      generatedAt: new Date().toISOString(),
    })
  }),

  // GET /api/visibility/trend
  http.get("*/api/visibility/trend", async ({ request }) => {
    const url = new URL(request.url)
    const start = url.searchParams.get("start") || "2024-01-01"
    const end = url.searchParams.get("end") || "2024-01-07"
    const tz = url.searchParams.get("tz") || "Asia/Shanghai"
    const productId = url.searchParams.get("productId") || "all"
    const metric = url.searchParams.get("metric") || "reach"

    // Generate dates array (Shanghai timezone)
    const startDate = new Date(start)
    const endDate = new Date(end)
    const dates: string[] = []
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      dates.push(currentDate.toISOString().split("T")[0])
      currentDate.setDate(currentDate.getDate() + 1)
    }

    const days = dates.length

    // Generate trend data based on metric
    const baseValues: Record<string, number[]> = {
      reach: [74.3, 72.5, 73.1, 74.8, 75.2, 74.9, 74.3],
      rank: [2.1, 2.2, 2.0, 2.1, 2.0, 2.1, 2.0],
      focus: [33.5, 32.8, 34.2, 33.9, 34.5, 34.1, 33.5],
    }

    const baseValue = baseValues[metric] || baseValues.reach
    const series = dates.map((date, i) => ({
      date,
      value: baseValue[i % baseValue.length] + (Math.random() - 0.5) * 2,
    }))

    // Calculate change rate (mock: compare with previous period)
    const changeRate = days === 1 ? 1.5 : 2.3

    await new Promise((resolve) => setTimeout(resolve, 400))

    return HttpResponse.json({
      period: { start, end, days },
      metric: metric as "reach" | "rank" | "focus",
      series,
      changeRate,
      generatedAt: new Date().toISOString(),
    })
  }),

  // GET /api/visibility/ranking
  http.get("*/api/visibility/ranking", async ({ request }) => {
    const url = new URL(request.url)
    const start = url.searchParams.get("start") || "2024-01-01"
    const end = url.searchParams.get("end") || "2024-01-07"
    const tz = url.searchParams.get("tz") || "Asia/Shanghai"
    const productId = url.searchParams.get("productId") || "all"
    const metric = url.searchParams.get("metric") || "reach"
    const page = parseInt(url.searchParams.get("page") || "1")
    const pageSize = parseInt(url.searchParams.get("pageSize") || "50")

    // Calculate days
    const startDate = new Date(start)
    const endDate = new Date(end)
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

    // Mock ranking data
    const mockRanking = [
      { brandId: "brand_2", brandName: "Chase", score: 92.5, order: 1 },
      { brandId: "brand_1", brandName: "Your Brand", score: 89.8, order: 2 },
      { brandId: "brand_3", brandName: "American Express", score: 85.2, order: 3 },
      { brandId: "brand_4", brandName: "Brex", score: 82.5, order: 4 },
      { brandId: "brand_5", brandName: "Ramp", score: 78.3, order: 5 },
      { brandId: "brand_6", brandName: "Nav", score: 75.1, order: 6 },
      { brandId: "brand_7", brandName: "Capital One", score: 72.3, order: 7 },
      { brandId: "brand_8", brandName: "Wells Fargo", score: 70.8, order: 8 },
      { brandId: "brand_9", brandName: "Citi", score: 68.2, order: 9 },
      { brandId: "brand_10", brandName: "Bank of America", score: 65.5, order: 10 },
      { brandId: "brand_11", brandName: "Discover", score: 63.8, order: 11 },
      { brandId: "brand_12", brandName: "TD Bank", score: 61.2, order: 12 },
      { brandId: "brand_13", brandName: "HSBC", score: 58.5, order: 13 },
      { brandId: "brand_14", brandName: "Barclays", score: 56.3, order: 14 },
      { brandId: "brand_15", brandName: "Santander", score: 54.1, order: 15 },
      { brandId: "brand_16", brandName: "UBS", score: 51.8, order: 16 },
      { brandId: "brand_17", brandName: "Credit Suisse", score: 49.5, order: 17 },
      { brandId: "brand_18", brandName: "Deutsche Bank", score: 47.2, order: 18 },
      { brandId: "brand_19", brandName: "BNP Paribas", score: 45.0, order: 19 },
      { brandId: "brand_20", brandName: "Société Générale", score: 42.8, order: 20 },
      { brandId: "brand_21", brandName: "ING", score: 40.5, order: 21 },
    ]

    // Adjust scores based on metric
    let adjustedRanking = mockRanking.map((item) => {
      if (metric === "rank") {
        // For rank, lower is better
        return { ...item, score: item.order, growth: days === 1 ? -0.3 : -0.5 }
      } else if (metric === "focus") {
        // For focus, adjust score slightly
        return { ...item, score: item.score * 0.45, growth: days === 1 ? 2.1 : 1.8 }
      }
      // For reach/visibility, use score as is
      return { ...item, growth: days === 1 ? 1.5 : 1.2 }
    })

    // Sort based on metric
    if (metric === "rank") {
      adjustedRanking.sort((a, b) => a.score - b.score)
    } else {
      adjustedRanking.sort((a, b) => b.score - a.score)
    }

    // Reassign order
    adjustedRanking = adjustedRanking.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }))

    // Pagination
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const items = adjustedRanking.slice(startIndex, endIndex)

    await new Promise((resolve) => setTimeout(resolve, 300))

    return HttpResponse.json({
      period: { start, end, days },
      metric: metric as "reach" | "rank" | "focus",
      total: adjustedRanking.length,
      items: items.map((item) => ({
        order: item.order,
        brandId: item.brandId,
        brandName: item.brandName,
        score: item.score,
        growth: item.growth,
      })),
      generatedAt: new Date().toISOString(),
    })
  }),

  // GET /api/plan/current
  http.get("*/api/plan/current", async ({ request }) => {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return HttpResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 }
      )
    }

    // 从 token 中提取 email
    const emailMatch = token.match(/mock_(?:login|signup|magic|google)_token_(.+)/)
    const email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"

    // 获取用户订阅信息
    const user = mockUsers[email]
    
    // 如果用户有订阅信息，返回对应的计划
    if (user?.subscription?.planId) {
      const now = new Date()
      const startDate = new Date(now)
      startDate.setDate(startDate.getDate() - 7) // 7天前开始
      
      const endDate = new Date(now)
      endDate.setDate(endDate.getDate() + 23) // 23天后结束（30天周期）
      
      const remainingDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      // 映射 planId 到 plan name
      const planNames: Record<string, string> = {
        basic: "Basic",
        advanced: "Pro",
        enterprise: "Enterprise",
      }
      
      return HttpResponse.json({
        plan: {
          id: user.subscription.planId,
          name: planNames[user.subscription.planId] || user.subscription.planId,
          status: user.subscription.status || "active",
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          remainingDays: remainingDays,
          isTrial: user.subscription.status === "trial",
        },
      })
    }

    // 对于 test1@example.com，返回 Basic 计划（模拟已有订阅）
    if (email === "test1@example.com") {
      const user = mockUsers[email]
      const subscriptionStatus = user?.subscription?.status || "active"
      
      const now = new Date()
      const startDate = new Date(now)
      startDate.setDate(startDate.getDate() - 7) // 7天前开始
      
      // 如果已取消，计算取消后的7天试用期结束时间
      let endDate = new Date(now)
      if (subscriptionStatus === "canceled" || subscriptionStatus === "expired") {
        // 取消后可以继续使用7天
        endDate.setDate(endDate.getDate() + 7)
      } else {
        // 正常订阅，30天周期
        endDate.setDate(endDate.getDate() + 23)
      }
      
      const remainingDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      return HttpResponse.json({
        plan: {
          id: "basic",
          name: "Basic",
          status: subscriptionStatus,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          remainingDays: remainingDays,
          isTrial: subscriptionStatus === "canceled" || subscriptionStatus === "expired", // 取消后视为试用期
        },
      })
    }

    // 默认返回 null（没有订阅）
    return HttpResponse.json({
      plan: null,
    })
  }),
]


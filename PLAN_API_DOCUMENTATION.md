# Plan / Subscription 页面 API 接口文档

## 一、接口总览

| 序号 | UI 元素位置 | 对应 API 字段 | API 路径 / 契约 | 说明 |
|------|------------|--------------|-----------------|------|
| 1 | 当前订阅卡片 | `plan` | `GET /api/plan/current`<br>响应: `{ plan: { id: string, name: string, status: "trial" \| "active" \| "canceled" \| "expired", startDate: string, endDate: string, remainingDays: number, isTrial: boolean } }` | 返回当前订阅详情；若无订阅则 `plan: null`。 |
| 2 | 选择套餐（Basic/Pro/Enterprise） | `planId`, `priceId` | `POST /api/plan/activate`<br>请求: `{ planId: "basic" \| "advanced" \| "enterprise", billingCycle: "monthly", paymentMethodId?: string }`<br>响应: `{ plan: { ... } }` | 激活/切换套餐，Mock 模式下直接返回成功。 |
| 3 | 取消订阅按钮 | `plan.status` | `POST /api/plan/cancel`<br>请求: `{ planId: string }`<br>响应: `{ plan: { status: "canceled", endDate: string } }` | 进入取消流程或标记到期。 |
| 4 | 管理订阅（Stripe Portal） | `portalUrl` | `POST /api/stripe/create-portal-session`<br>响应: `{ portalUrl?: string }` | 真实环境跳转 Stripe Portal；Mock 模式返回 `null` 供前端展示提示。 |
| 5 | 升级卡片 / 立即试用按钮 | `checkoutUrl` | `POST /api/stripe/create-checkout-session`<br>请求: `{ planId, priceId, mode: "subscription" }`<br>响应: `{ checkoutUrl?: string }` | Stripe Checkout Session，Mock 模式直接返回 `{ ok: true }`。 |
| 6 | 发票列表对话框 | `invoices[]` | `GET /api/stripe/invoices`<br>响应: `{ invoices: Array<{ id, amountDue, currency, hostedInvoiceUrl, status, createdAt }> }` | 获取账单历史。 |
| 7 | 试用结束逻辑 / Payment Setup | `clientSecret` | `POST /api/stripe/create-setup-intent`<br>响应: `{ clientSecret: string }` | （可选）若需提前绑定支付方式。 |

## 二、请求与响应示例

```http
GET /api/plan/current
Authorization: Bearer {token}
```

```json
{
  "plan": {
    "id": "advanced",
    "name": "Pro",
    "status": "active",
    "startDate": "2025-11-08T00:00:00.000Z",
    "endDate": "2025-12-08T00:00:00.000Z",
    "remainingDays": 24,
    "isTrial": false
  }
}
```

```http
POST /api/plan/activate
Authorization: Bearer {token}
Content-Type: application/json

{
  "planId": "advanced",
  "billingCycle": "monthly"
}
```

```json
{
  "plan": {
    "id": "advanced",
    "name": "Pro",
    "status": "active",
    "startDate": "2025-11-14T02:45:00.000Z",
    "endDate": "2025-12-14T02:45:00.000Z",
    "remainingDays": 30,
    "isTrial": true
  }
}
```

```http
POST /api/stripe/create-checkout-session
Authorization: Bearer {token}
Content-Type: application/json

{
  "planId": "advanced",
  "priceId": "price_advanced_monthly"
}
```

```json
{
  "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_123"
}
```

## 三、额外说明

1. **订阅状态流转**  
   - `status` 需覆盖 `trial`, `active`, `canceled`, `expired`。  
   - `canceled` 表示已排程取消，保留 `endDate`；`expired` 表示试用结束且未续费。  
   - `remainingDays` 为前端展示当前周期剩余天数。  

2. **计划配额联动**  
   - `/api/plan/current` 的结果用于 `usePlanStore` 中的产品数/成员数限制（Basic=3 产品，Pro=9，Enterprise=20；成员限额参见 Team 文档）。  

3. **Stripe 集成**  
   - Checkout Session：选择 Basic/Pro 时调用，返回 `checkoutUrl`；Enterprise 计划通常跳转“联系销售”。  
   - Portal Session：用于“管理订阅”按钮。  
   - Invoices：Plan 页“查看账单”对话框使用 `/api/stripe/invoices`。  

4. **错误与状态码**  
   - 200/201：成功；202：激活处理中。  
   - 400：参数错误（例如 planId 无效）；401：未授权；402：支付失败；409：已有活跃订单；500：服务异常。  
   - 错误响应统一 `{ error: string, message?: string }`。  



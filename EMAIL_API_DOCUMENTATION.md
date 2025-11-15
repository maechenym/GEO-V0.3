# Email / Notification API 文档

> 本文汇总当前产品中与邮件相关的 API，包括登录魔术链接、等待名单通知、团队邀请等。全部接口均为 JSON 响应，需携带有效的 Bearer Token（除登录魔术链接外）。

## 一、接口列表

| 序号 | 功能 | API 路径 / 方法 | 请求示例 | 说明 |
|------|------|-----------------|----------|------|
| 1 | 发送登录魔术链接 | `POST /api/auth/magic-link` | `{ "email": "user@example.com" }` | 发送邮件到用户邮箱；Mock 模式直接返回 `ok: true`。 |
| 2 | 验证魔术链接 | `GET /api/auth/magic-link/verify?token=xxx` |  | 校验 token 并返回会话信息（当前实现返回 mock）。 |
| 3 | 等候名单完成通知 | `POST /api/onboarding/waitlist` | `{ "brandName": "英業達", "productName": "筆記本代工" }` | 在真实环境中应创建品牌/产品并发送等待完成邮件。 |
| 4 | 团队邀请邮件 | `POST /api/team/invite` | `{ "email": "guest@inventec.com", "role": "Viewer" }` | 发送邀请链接；成功后返回 `member` 对象。 |
| 5 | 订阅管理通知（Stripe Webhook 占位） | `POST /api/plan/activate` / `POST /api/plan/cancel`（触发邮件） | `{ "planId": "advanced" }` | 当前返回 mock 数据；实际可在成功后发送“订阅成功/取消”邮件。 |

## 二、请求与响应示例

### 1. 登录魔术链接

```http
POST /api/auth/magic-link
Content-Type: application/json

{ "email": "test1@example.com" }
```

```json
{ "ok": true }
```

### 2. 团队邀请

```http
POST /api/team/invite
Authorization: Bearer {token}
Content-Type: application/json

{ "email": "analyst@inventec.com", "role": "Viewer" }
```

```json
{
  "member": {
    "id": "member_1731561023456",
    "email": "analyst@inventec.com",
    "role": "Viewer",
    "updatedAt": "2025-11-14T02:37:03.000Z"
  }
}
```

### 3. Waitlist 通知

```http
POST /api/onboarding/waitlist
Authorization: Bearer {token}
Content-Type: application/json

{ "brandName": "英業達", "productName": "筆記本代工" }
```

```json
{ "ok": true, "message": "Successfully joined waitlist" }
```

## 三、实现建议

1. **邮件发送服务**  
   - 可接入 SES、SendGrid 或自建 SMTP。  
   - 建议统一封装 `EmailService.send(templateId, to, data)`，由各 API 调用。  

2. **模板与本地化**  
   - 魔术链接、邀请、等待名单、订阅通知应支持中/英语言模板。  
   - 可在请求中加入 `language` 字段或根据用户设置自动匹配。  

3. **安全与频控**  
   - 魔术链接：对单邮箱设置最小间隔（如 60s），防止滥用。  
   - 邀请邮件：限制管理员权限，并在响应中返回剩余可邀请次数。  

4. **Webhook / 回调**  
   - 未来 Stripe Webhook 可在订阅状态变化时触发邮件（已付款、取消、发票失败等）。  

5. **错误响应**  
   - `{ error: "EMAIL_RATE_LIMIT", message: "Please wait before requesting another link." }`  
   - `{ error: "DELIVERY_FAILED", message: "Failed to send invitation email." }`  
   - 状态码：`429`（频控）、`400`（参数错误）、`401`（未授权）、`500`（服务错误）。  



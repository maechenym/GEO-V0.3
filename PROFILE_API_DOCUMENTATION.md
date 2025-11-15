# Profile 页面 API 接口文档

概述：Profile 页面用于展示和编辑用户的基本信息、品牌/产品绑定状态，以及当前订阅与团队配额的摘要。核心依赖 `GET /api/auth/session` 返回的 `profile` 对象，辅以若干设置类 API。

## 1. 会话 / Profile 核心数据

| 序号 | 字段 | 来源 | 说明 |
|------|------|------|------|
| 1 | `profile.id` | `GET /api/auth/session` | 用户唯一 ID。 |
| 2 | `profile.email` | 同上 | 登录邮箱。 |
| 3 | `profile.role` | 同上 | `Admin` / `Viewer` 等，影响权限。 |
| 4 | `profile.hasBrand` / `hasProduct` | 同上 | 是否已完成品牌、产品绑定，用于显示 Onboarding 状态。 |
| 5 | `profile.waitlistStatus` | 同上 | `pending` / `ready` / `converted`，决定是否显示 Waitlist/Analysis 提示。 |
| 6 | `profile.subscription` | 同上 | `{ planId, status, trialEndsAt }`，用于显示订阅摘要。 |
| 7 | `profile.teamStats`（如有） | 同上 / `GET /api/team` | 可选：返回当前成员数量、上限、剩余配额。 |

> Profile 页渲染时，通常只需一次 `GET /api/auth/session` 即可拿到上述数据；当用户执行某些操作（如更新品牌信息）后，可重新调用或刷新页面。

## 2. 可编辑字段与对应 API

| UI 元素 | 行为 | API | 请求 / 响应 | 说明 |
|---------|------|-----|-------------|------|
| 基础信息（如名称、头像） | Save 按钮 | `PATCH /api/profile`（建议实现） | `{ displayName?, avatarUrl? }` → `{ profile }` | 当前代码暂未提供接口，可按需新增。 |
| 品牌信息卡片 | Save 按钮 | `PATCH /api/brands/:id` | `{ name?, ... }` → `{ brand }` | Profile 页通常展示只读信息；若允许编辑，可沿用 Product 设置页的 API。 |
| 产品信息卡片 | Save 按钮 | `PATCH /api/products/:id` | `{ name?, category? }` → `{ product }` | 同上。 |
| 订阅状态视图（只读） | 查看详情 | `GET /api/plan/current` | `{ plan }` | Profile 页可直接复用 Plan 页的 API；若只需摘要，可从 `profile.subscription` 取值。 |
| 邀请团队 / 查看团队成员 | CTA 跳转 | `/settings/team` 使用 `/api/team` | `{ members: [...] }` | Profile 页仅展示统计信息即可。 |

## 3. Profile 页面数据结构（示例）

```json
GET /api/auth/session

{
  "profile": {
    "id": "user_123",
    "email": "ops@inventec.com",
    "role": "Admin",
    "hasBrand": true,
    "hasProduct": true,
    "waitlistStatus": "converted",
    "subscription": {
      "planId": "advanced",
      "status": "active",
      "trialEndsAt": "2025-11-21T00:00:00.000Z"
    },
    "teamStats": {
      "members": 5,
      "limit": 7
    }
  }
}
```

## 4. 相关 API 参考

| 功能 | API | 说明 |
|------|-----|------|
| 订阅详情 | `GET /api/plan/current` | Profile 中 “当前订阅” 卡片可直接使用。 |
| 团队成员 | `GET /api/team` | 若需在 Profile 显示成员列表，可调用此接口。 |
| Waitlist 状态 | `GET /api/waitlist/status`（建议） | 若 `profile` 中不含详细信息，可另建接口。 |
| 登出 | `POST /api/auth/logout` | Profile 页 “退出登录” 按钮。 |

## 5. 状态刷新与缓存

- Profile 页面通常在登录后首次加载，需要确保 `GET /api/auth/session` 不被静态缓存（`no-store` 或短期 `staleTime`）。  
- 当用户更改品牌/产品/订阅时，建议调用 `GET /api/auth/session` 以获取最新 `profile` 值，或在响应中直接返回更新后的 profile。  

## 6. 错误与权限

- 401：未登录或 token 过期 → 重定向到 `/login`。  
- 403：当前用户非管理员但尝试访问敏感字段（如团队信息）。  
- 500：服务错误，Profile 页需给出“请稍后再试”的提示。  

## 7. 建议与扩展

- 若后续需要编辑更多个人信息（如手机号、通知偏好等），建议统一新增 `GET /api/profile` / `PATCH /api/profile`。  
- Profile 页可展示最近登录记录、API Key、导出历史等，这些都可以独立接口后注入 `profile` 面板。 |


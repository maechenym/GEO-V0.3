# Team 页面 API 接口文档

## 一、接口总览

| 序号 | UI 元素位置 | 对应 API 字段 | API 路径 / 契约 | 说明 |
|------|------------|--------------|-----------------|------|
| 1 | 成员列表 | `members[]` | `GET /api/team`<br>响应: `{ members: Array<{ id: string, email: string, role: "Admin" \| "Viewer", updatedAt: string }> }` | 加载当前工作区所有成员，列表按 `updatedAt` 降序。 |
| 2 | 邀请成员弹窗 | `member.email`<br>`member.role` | `POST /api/team/invite`<br>请求: `{ email: string, role: "Admin" \| "Viewer" }`<br>响应: `{ member: { ... } }` | 发送邀请邮件并将成员加入列表（初始状态视后端实现而定）。 |
| 3 | 角色切换（表格内下拉） | `member.role` | `PATCH /api/team/:memberId`<br>请求: `{ role: "Admin" \| "Viewer" }`<br>响应: `{ member: { ... } }` | 更新成员角色；需遵守订阅计划的配额限制。 |
| 4 | 删除成员（More 菜单） | - | `DELETE /api/team/:memberId`<br>响应: `{ ok: boolean }` | 移除成员；若计划仅允许单人，后端可拒绝。 |
| 5 | 计划配额显示 | `limits.total`<br>`limits.maxAdmins`<br>`limits.maxMembers` | （由 `/api/plan/current` 或 Profile 返回） | 前端根据当前订阅推算限制：Trial=1，总数=1；Basic=3；Pro=7；Enterprise=13。 |

## 二、请求与响应示例

```http
GET /api/team
Authorization: Bearer {token}
```

```json
{
  "members": [
    {
      "id": "member_1",
      "email": "founder@inventec.com",
      "role": "Admin",
      "updatedAt": "2025-11-14T02:30:00.000Z"
    },
    {
      "id": "member_2",
      "email": "analyst@inventec.com",
      "role": "Viewer",
      "updatedAt": "2025-11-13T11:05:00.000Z"
    }
  ]
}
```

```http
POST /api/team/invite
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "guest@inventec.com",
  "role": "Viewer"
}
```

```json
{
  "member": {
    "id": "member_1731561023456",
    "email": "guest@inventec.com",
    "role": "Viewer",
    "updatedAt": "2025-11-14T02:37:03.000Z"
  }
}
```

## 三、额外说明

1. **认证与授权**  
   - 所有 Team API 需要有效的 Bearer Token，并在服务端验证当前用户是否为 Admin。  
   - 建议在响应头返回剩余可邀请人数等元数据，前端可用于禁用按钮。  

2. **计划配额**  
   - 当前逻辑由前端 `getMemberLimits(planType)` 控制，后端可根据 `profile.subscription.planId` 强制限制。  
   - 当达到上限时，应返回 `409 Conflict` 或 `400` 并附带错误码（例如 `TEAM_LIMIT_REACHED`）。  

3. **邮件发送**  
   - `POST /api/team/invite` 需要触发邀请邮件；Mock 模式下仅返回 member 数据。  
   - 若后端需要多步骤（创建邀请记录、发送邮件、处理接受状态），可在响应中加入 `status: "pending"` 字段。  

4. **错误与状态码**  
   - 200/201：操作成功；204：删除成功无内容。  
   - 400：参数错误；401：未登录；403：无权限；404：成员不存在；409：达到配额；500：服务器错误。  
   - 错误响应统一 `{ error: string, message?: string }`。  



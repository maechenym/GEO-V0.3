# 如何查看 MSW 日志

## 🖥️ 在浏览器中查看控制台日志

### 方法1：使用快捷键打开开发者工具

**Windows/Linux:**
- 按 `F12` 键
- 或按 `Ctrl + Shift + I`
- 或按 `Ctrl + Shift + J`（直接打开Console）

**Mac:**
- 按 `Cmd + Option + I`
- 或按 `Cmd + Option + J`（直接打开Console）

### 方法2：右键菜单

1. 在页面上右键点击
2. 选择"检查"或"Inspect"
3. 点击"Console"标签

### 方法3：浏览器菜单

**Chrome/Edge:**
1. 点击右上角三个点（⋮）
2. 选择"更多工具" → "开发者工具"

**Firefox:**
1. 点击右上角三条横线（☰）
2. 选择"更多工具" → "Web开发者工具"

**Safari:**
1. 需要先在"偏好设置" → "高级"中启用"在菜单栏中显示开发菜单"
2. 然后选择"开发" → "显示错误控制台"

## 📋 查看 MSW 日志

### 1. 查看 MSW 初始化日志
打开Console后，你应该能看到类似这样的日志：
```
[MSW] Mocking enabled.
[MSW] Pre-initialized Inventec data for test@example.com
[MSW] - Brand: 英业达 (Inventec)
[MSW] - Products: 8
[MSW] - Competitors: 20
```

### 2. 查看 API 请求日志
当页面加载或API请求时，会看到：
```
[MSW] GET /api/brands/:id - email: test@example.com, id: brand_inventec, token: present/missing
[MSW] Initializing Inventec brand for test@example.com
[MSW] Returning brand: {id: "brand_inventec", name: "英业达 (Inventec)", ...}
```

### 3. 过滤日志
在Console的搜索框中输入 `[MSW]` 可以只显示MSW相关的日志。

## 🔍 查看网络请求

### Network 标签
1. 打开开发者工具
2. 点击"Network"标签
3. 刷新页面或执行操作
4. 查看请求列表：
   - 正常请求：状态码200（绿色）
   - 错误请求：状态码404/401等（红色）
   - MSW拦截的请求会显示 `(MSW)` 标记

### 查看请求详情
1. 点击任意请求
2. 查看：
   - **Headers**: 请求头信息（包括Authorization）
   - **Preview**: 响应数据预览
   - **Response**: 原始响应数据

## 🐛 常见问题排查

### 问题1：看不到MSW日志
**可能原因：**
- MSW未正确初始化
- 日志级别被过滤

**解决方法：**
```javascript
// 在Console中检查MSW是否启用
console.log('[MSW] Worker:', window.msw)
```

### 问题2：看到错误信息
**常见的错误：**
- `Failed to load resource: 404` - 请求未找到
- `Failed to load resource: 401` - 未授权
- `MSW: Request not handled` - MSW未拦截请求

**解决方法：**
1. 检查Network标签，确认请求是否被MSW拦截
2. 查看Console中的错误详情
3. 检查 `src/mocks/handlers.ts` 中的handler是否正确

### 问题3：请求被拦截但返回错误
**检查步骤：**
1. 在Network标签中找到请求
2. 点击查看Response
3. 检查返回的错误信息
4. 查看Console中的 `[MSW]` 日志，了解handler的执行情况

## 📸 截图示例

在Console中应该看到：
```
✅ [MSW] Mocking enabled.
[MSW] Pre-initialized Inventec data for test@example.com
[MSW] GET /api/brands/:id - email: test@example.com, id: brand_inventec
[MSW] Returning brand: {id: "brand_inventec", name: "英业达 (Inventec)"}
```

## 💡 调试技巧

### 1. 启用详细日志
如果日志不够详细，可以修改 `src/mocks/handlers.ts`，添加更多 `console.log`。

### 2. 使用断点
在开发者工具的Sources标签中，可以在MSW handler代码中添加断点进行调试。

### 3. 检查响应数据
在Network标签中，点击请求后查看Response，确认返回的数据格式是否正确。

## 🎯 快速检查清单

- [ ] 打开开发者工具（F12）
- [ ] 切换到Console标签
- [ ] 看到 `[MSW] Mocking enabled`
- [ ] 看到 `[MSW] Pre-initialized Inventec data`
- [ ] 刷新页面后看到API请求日志
- [ ] Network标签中请求状态为200（绿色）

如果以上都正常，说明MSW工作正常！


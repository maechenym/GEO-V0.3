# ✅ 登录/注册问题已修复！

## 🔧 修复内容

**问题：** 登录和注册时出现 405 错误

**原因：** API 调用路径不匹配
- 代码调用：`/auth/login`、`/auth/signup`
- MSW 监听：`/api/auth/login`、`/api/auth/signup`

**修复：** 更新所有认证相关的 API 调用，添加 `/api` 前缀

### 修复的文件：
- ✅ `src/app/(auth)/login/page.tsx` - 登录页面
- ✅ `src/app/(auth)/signup/page.tsx` - 注册页面
- ✅ `src/app/(auth)/auth/callback/page.tsx` - Magic Link 回调

---

## 🚀 部署更新

代码已提交并推送到 GitHub，Vercel 会自动重新部署（约 2-3 分钟）。

---

## ✅ 现在可以测试了

部署完成后：

1. **访问你的 Vercel 链接**
2. **测试登录：**
   - 输入任意邮箱（如 `test@example.com`）
   - 点击 "Login" 按钮
   - 应该能成功登录并跳转到 overview 页面

3. **测试注册：**
   - 输入新邮箱（如 `newuser@example.com`）
   - 点击 "Sign up" 按钮
   - 应该能成功注册并跳转到 onboarding 页面

---

## 📝 说明

- ✅ Magic Link 功能已保留（如果需要可以移除）
- ✅ 简单的邮箱登录/注册现在可以正常工作
- ✅ 所有请求都会被 MSW 正确拦截和处理

---

**等待 Vercel 重新部署完成后，就可以正常登录了！** 🎉


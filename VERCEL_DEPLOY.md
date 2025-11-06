# GEO V0.3 - Vercel 部署快速指南

## ✅ 是的！只需要一个链接

部署到 Vercel 后，你会获得一个链接，**任何人都可以打开，无需安装任何软件！**

---

## 🚀 3 步完成部署

### 步骤 1: 准备代码

确保以下文件存在：
- ✅ `public/mockServiceWorker.js` - MSW Service Worker
- ✅ `.gitignore` - 已配置，不提交 node_modules
- ✅ `package.json` - 包含所有依赖

### 步骤 2: 推送到 GitHub

```bash
# 初始化 Git（如果还没有）
git init

# 添加文件
git add .

# 提交
git commit -m "GEO V0.3 - Ready for deployment"

# 在 GitHub 创建新仓库（例如：GEOV0.3）
# 然后添加远程仓库
git remote add origin https://github.com/your-username/GEOV0.3.git
git branch -M main
git push -u origin main
```

### 步骤 3: 部署到 Vercel

1. **访问 Vercel**
   - 打开 https://vercel.com
   - 点击 **"Sign Up"** 或 **"Login"**

2. **使用 GitHub 登录**
   - 选择 **"Continue with GitHub"**
   - 授权 Vercel 访问你的 GitHub 账号

3. **导入项目**
   - 点击 **"Add New Project"** 或 **"Import Project"**
   - 在项目列表中找到 **GEOV0.3**（或你的仓库名）
   - 点击 **"Import"**

4. **配置环境变量**
   - 在 **Environment Variables** 部分
   - 添加：`NEXT_PUBLIC_USE_MOCK` = `true`
   - 点击 **"Add"**

5. **部署**
   - 点击 **"Deploy"** 按钮
   - 等待 2-3 分钟构建完成

6. **获得链接**
   - 部署完成后，你会看到一个链接
   - 格式：`https://your-app.vercel.app`
   - **这个链接可以分享给任何人！**

---

## 📱 分享链接

将链接发送给任何人：
```
https://your-app.vercel.app
```

**他们只需要：**
- ✅ 点击链接
- ✅ 在浏览器中打开
- ✅ **无需安装任何软件**
- ✅ **无需配置任何东西**

---

## ⚠️ 重要提示

### 数据文件问题

当前 API routes（overview, visibility, sentiment）读取本地 JSON 文件。在 Vercel 部署时：

**选项 1：使用 MSW Mock（推荐）**
- 确保 `NEXT_PUBLIC_USE_MOCK=true`
- MSW 会拦截所有 API 请求
- 不需要真实的数据文件

**选项 2：将数据文件添加到项目**
- 将 JSON 文件复制到项目目录（如 `data/`）
- 更新 API routes 使用相对路径
- 提交到 GitHub

---

## 🔧 部署前检查

运行以下命令检查：

```bash
# 1. 检查 MSW Service Worker
ls public/mockServiceWorker.js

# 2. 测试构建
NEXT_PUBLIC_USE_MOCK=true npm run build

# 3. 检查是否有错误
```

---

## 📋 Vercel 环境变量配置

在 Vercel 项目设置中添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NEXT_PUBLIC_USE_MOCK` | `true` | 启用 MSW Mock |

---

## 🎉 完成！

部署完成后：
1. ✅ 获得链接：`https://your-app.vercel.app`
2. ✅ 分享给任何人
3. ✅ 他们点击即可打开
4. ✅ **无需安装任何软件！**

---

## 🔄 更新部署

每次推送代码到 GitHub，Vercel 会自动重新部署：

```bash
git add .
git commit -m "Update features"
git push
```

Vercel 会自动检测并部署更新！

---

需要帮助？查看 `GITHUB_DEPLOY.md` 获取详细说明。


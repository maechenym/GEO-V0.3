# GEO V0.3 - GitHub 部署快速指南

## 🚀 3 步完成部署

### 步骤 1: 推送到 GitHub

```bash
git init
git add .
git commit -m "GEO V0.3 - Ready for deployment"
git branch -M main
git remote add origin https://github.com/your-username/GEOV0.3.git
git push -u origin main
```

### 步骤 2: 连接 Vercel

1. 访问 https://vercel.com
2. 使用 GitHub 登录
3. 点击 "Import Project"
4. 选择 GEOV0.3 仓库
5. 添加环境变量：`NEXT_PUBLIC_USE_MOCK=true`
6. 点击 "Deploy"

### 步骤 3: 分享链接

获得链接：`https://your-app.vercel.app`

**任何人都可以打开这个链接！**

---

## ✅ 优势

- ✅ 完全免费
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 自动部署（每次推送自动更新）
- ✅ 无需安装任何软件
- ✅ 点击链接即可使用

---

## 📝 注意事项

1. **环境变量**：确保在 Vercel 中设置 `NEXT_PUBLIC_USE_MOCK=true`
2. **MSW Service Worker**：确保 `public/mockServiceWorker.js` 存在
3. **数据文件**：如果使用 JSON 数据文件，需要确保路径正确

---

需要帮助？查看 `GITHUB_DEPLOY.md` 获取详细说明。


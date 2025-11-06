# GEO V0.3 部署检查清单

## ✅ 部署前检查

### 必须完成：

- [ ] **MSW Service Worker**
  ```bash
  ls public/mockServiceWorker.js
  ```
  - 如果不存在，运行：`npx msw init public/`

- [ ] **环境变量配置**
  - Vercel 中设置：`NEXT_PUBLIC_USE_MOCK=true`

- [ ] **测试构建**
  ```bash
  NEXT_PUBLIC_USE_MOCK=true npm run build
  ```
  - 确保构建成功，无错误

- [ ] **Git 配置**
  ```bash
  git init
  git add .
  git commit -m "GEO V0.3"
  ```

### 推荐完成：

- [ ] **README.md** - 项目说明
- [ ] **.env.example** - 环境变量示例
- [ ] **.gitignore** - 确保不提交敏感文件

---

## 🚀 快速部署命令

```bash
# 1. 运行准备脚本
./prepare-deploy.sh

# 2. 推送到 GitHub
git remote add origin https://github.com/your-username/GEOV0.3.git
git push -u origin main

# 3. 访问 vercel.com，导入仓库，部署！
```

---

## 📱 部署后

获得链接：`https://your-app.vercel.app`

**分享这个链接给任何人，他们点击即可打开！**


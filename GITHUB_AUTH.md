# 🔐 GitHub 认证设置

## 推送需要认证

GitHub 现在要求使用 **Personal Access Token**（不是密码）。

---

## 📋 方法 1: 使用 Personal Access Token（推荐）

### 步骤 1: 创建 Token

1. 访问 https://github.com/settings/tokens
2. 点击 **"Generate new token"** -> **"Generate new token (classic)"**
3. 填写信息：
   - Note: `GEO-V0.3 Deployment`
   - Expiration: 选择合适的时间（如 90 天）
   - 勾选权限：**`repo`**（完整仓库访问权限）
4. 点击 **"Generate token"**
5. **重要**：立即复制 token（只显示一次！）

### 步骤 2: 使用 Token 推送

运行以下命令，当提示输入密码时，**粘贴你的 token**（不是 GitHub 密码）：

```bash
git push -u origin main
```

**提示：**
- Username: `maechenym`（你的 GitHub 用户名）
- Password: **粘贴你的 token**（不是密码）

---

## 📋 方法 2: 使用 SSH（可选）

如果你想使用 SSH，需要先配置 SSH key：

1. 生成 SSH key（如果还没有）：
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. 添加 SSH key 到 GitHub：
   - 复制公钥：`cat ~/.ssh/id_ed25519.pub`
   - 访问 https://github.com/settings/keys
   - 点击 "New SSH key"
   - 粘贴公钥并保存

3. 更改远程 URL：
   ```bash
   git remote set-url origin git@github.com:maechenym/GEO-V0.3.git
   git push -u origin main
   ```

---

## 🚀 推荐使用方法 1（Token）

最简单快速的方式是使用 Personal Access Token。

准备好 token 后，运行：
```bash
git push -u origin main
```

当提示输入密码时，粘贴你的 token。

---

## ✅ 推送成功后

推送成功后，访问 https://github.com/maechenym/GEO-V0.3 就能看到你的代码了！

然后就可以在 Vercel 部署了。


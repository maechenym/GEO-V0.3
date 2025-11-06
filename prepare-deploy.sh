#!/bin/bash

# GEO V0.3 - 部署准备脚本
# 检查并准备所有部署所需的文件

set -e

echo "🔍 检查部署准备情况..."
echo ""

# 1. 检查 MSW Service Worker
if [ ! -f "public/mockServiceWorker.js" ]; then
  echo "❌ 错误：找不到 public/mockServiceWorker.js"
  echo "   正在生成..."
  npx msw init public/ --save
fi

# 2. 检查 package.json
if [ ! -f "package.json" ]; then
  echo "❌ 错误：找不到 package.json"
  exit 1
fi

# 3. 检查 .gitignore
if [ ! -f ".gitignore" ]; then
  echo "⚠️  警告：找不到 .gitignore，正在创建..."
  cat > .gitignore << 'EOF'
node_modules/
.next/
out/
.env*.local
.env
.DS_Store
*.log
EOF
fi

# 4. 检查环境变量示例文件
if [ ! -f ".env.example" ]; then
  echo "📝 创建 .env.example..."
  cat > .env.example << 'EOF'
# Vercel 部署时设置此变量
NEXT_PUBLIC_USE_MOCK=true

# 开发环境（本地）
# NEXT_PUBLIC_USE_MOCK=true
EOF
fi

# 5. 测试构建
echo "🔨 测试构建..."
export NEXT_PUBLIC_USE_MOCK=true

# 检查是否有构建错误（忽略 lint 警告）
if npm run build 2>&1 | grep -q "Failed to compile"; then
  echo "❌ 构建失败，请检查错误信息"
  echo "   注意：lint 警告不会阻止部署，但类型错误会"
  exit 1
else
  echo "✅ 构建成功！"
fi

# 6. 清理构建文件
echo "🧹 清理构建文件..."
rm -rf .next out

echo ""
echo "✅ 部署准备完成！"
echo ""
echo "📋 下一步："
echo "   1. git init（如果还没有）"
echo "   2. git add ."
echo "   3. git commit -m 'GEO V0.3'"
echo "   4. 在 GitHub 创建仓库"
echo "   5. git remote add origin https://github.com/your-username/GEOV0.3.git"
echo "   6. git push -u origin main"
echo "   7. 访问 vercel.com，导入仓库，部署！"
echo ""


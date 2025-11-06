/**
 * GitHub Pages 静态导出配置
 * 
 * 用于部署到 GitHub Pages
 * basePath 设置为仓库名称（如果不在根目录）
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
  // 静态导出配置
  output: 'export',
  // 禁用图片优化
  images: {
    unoptimized: true,
  },
  // 确保所有路由都生成静态文件
  trailingSlash: true,
  // GitHub Pages 配置（如果仓库名不是根目录，需要设置 basePath）
  // basePath: '/GEOV0.3',  // 如果仓库名是 GEOV0.3，取消注释这行
  // assetPrefix: '/GEOV0.3',  // 同上
  // 环境变量在构建时注入
  env: {
    NEXT_PUBLIC_USE_MOCK: 'true',
  },
}

module.exports = nextConfig


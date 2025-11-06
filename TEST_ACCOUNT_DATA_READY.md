# 英业达数据已直接导入到测试账号

## ✅ 已完成

### 测试账号数据预加载
- **账号**: `test@example.com`
- **品牌**: 英业达 (Inventec)
- **产品**: 8个产品已全部创建
- **竞品**: 20个主要竞品已导入

### 预加载的产品列表
1. 英业达 (Inventec) 机架解决方案
2. 英业达 (Inventec) AI服务器
3. 英业达 (Inventec) 通用服务器
4. 英业达 (Inventec) 存储服务器
5. 英业达 (Inventec) 网络交换机
6. 英业达 (Inventec) 笔记本电脑
7. 英业达 (Inventec) 台式机
8. 英业达 (Inventec) 精简型电脑

### 预加载的竞品列表（20个）
- HPE, 超微, 华硕, 浪潮, 戴尔, Lenovo, Cisco, Huawei
- 惠普, 联想, 华为, 新华三, AMD, NVIDIA, 英特尔
- 威盛電子（VIA Technologies）, Dell PowerEdge R770
- Nfina 4408T, 戴尔（Dell）, 惠普（HPE）

## 🚀 如何使用

### 1. 登录测试账号
使用 `test@example.com` 登录，数据已经预加载完成。

### 2. 查看数据
- **品牌和产品**: 访问 `/settings/products` 页面
- **竞品数据**: 在Products设置页面的Competitors部分查看
- **分析数据**: 通过 `/api/products/:productId/analytics` API获取

### 3. API访问示例
```typescript
// 获取产品分析数据
const productName = encodeURIComponent('英业达 (Inventec) 机架解决方案')
const response = await fetch(`/api/products/${productName}/analytics`, {
  headers: {
    'Authorization': `Bearer mock_login_token_test@example.com`
  }
})
```

## 📊 数据说明

- **品牌数据**: 模块加载时自动创建
- **产品数据**: 8个产品已全部创建
- **竞品数据**: 从JSON文件的第一个产品提取
- **分析数据**: 通过API route访问JSON文件获取

## 🔄 数据同步

数据在应用启动时自动预加载到 `test@example.com` 账号，无需手动操作。

## 📝 注意事项

1. 测试账号数据在MSW启动时自动创建
2. 产品名称与JSON文件中的键名完全匹配
3. 分析数据通过API动态获取，支持日期范围过滤
4. 竞品数据已关联到第一个产品（机架解决方案）

## 🎯 下一步

现在可以：
1. 使用 `test@example.com` 登录
2. 直接查看所有产品数据
3. 在Overview页面查看分析数据
4. 在Products设置页面管理产品和竞品


# 英业达数据导入完成

## ✅ 已完成的工作

### 1. 产品数据自动初始化
- 8个英业达产品已自动创建在系统中
- 产品名称与JSON文件完全匹配

### 2. 竞品数据自动导入
- 初始化函数会自动从JSON文件加载竞品数据
- 从第一个产品（机架解决方案）的mention_rate中提取竞品列表
- 自动添加前20个主要竞品到品牌中

### 3. API端点

#### `/api/products/:productId/import-competitors`
- **POST** 方法
- **功能**: 手动导入指定产品的竞品数据
- **返回**: 包含竞品名称和各项指标的列表

### 4. 数据关联

**产品名称格式**: `英业达 (Inventec) ${产品类别}`

**产品列表**:
1. 英业达 (Inventec) 机架解决方案
2. 英业达 (Inventec) AI服务器
3. 英业达 (Inventec) 通用服务器
4. 英业达 (Inventec) 存储服务器
5. 英业达 (Inventec) 网络交换机
6. 英业达 (Inventec) 笔记本电脑
7. 英业达 (Inventec) 台式机
8. 英业达 (Inventec) 精简型电脑

**竞品数据来源**: 从JSON文件中每个产品的`overall.mention_rate`字段提取

## 📊 数据流程

1. **用户访问品牌列表** → 自动初始化英业达品牌和产品
2. **用户访问产品列表** → 自动导入竞品数据（如果尚未导入）
3. **产品数据访问** → 通过 `/api/products/:productId/analytics` 获取时间序列数据

## 🔧 使用方式

### 自动导入（已实现）
当用户首次访问英业达品牌时，系统会自动：
1. 创建品牌
2. 创建8个产品
3. 从JSON文件导入竞品数据

### 手动导入（可选）
如果需要为特定产品导入竞品数据：
```typescript
const productName = encodeURIComponent('英业达 (Inventec) 机架解决方案')
const response = await fetch(`/api/products/${productName}/import-competitors`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
const data = await response.json()
// data.competitors 包含竞品列表和各项指标
```

## 📝 注意事项

1. 竞品数据会在首次访问品牌时自动导入
2. 如果API route无法访问，会使用预定义的竞品列表作为后备
3. 每个产品的数据分析数据可通过 `/api/products/:productId/analytics` 获取
4. 产品名称必须与JSON文件中的键名完全匹配

## 🎯 下一步

数据已完全导入并关联到产品系统。现在可以：
1. 在Overview页面查看产品数据
2. 在Products设置页面管理产品和竞品
3. 在各个Insights页面使用实际的产品数据


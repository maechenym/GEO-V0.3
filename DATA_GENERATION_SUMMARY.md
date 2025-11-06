# 数据生成和导入总结

## 完成的任务

### 1. 时间序列数据生成 ✅

已成功为所有品牌和产品生成 2025年10月31日至11月6日（共7天）的时间序列数据。

**生成的数据特点：**
- **mention_rate**: 在0-1范围内，波动范围为±10%
- **content_share**: 波动范围为±5%
- **brand_domains**: 保持不变
- **combined_score**: 根据mention_rate和content_share计算，波动范围≤±5%
- **sentiment_score**: 波动范围为±0.05
- **total_score**: 结合多个指标，波动范围为±10%
- **absolute_rank**: 保持品牌排名不变
- **aggregated_sentiment_detail**: 情感细节保持不变

### 2. 英业达产品导入 ✅

已在 mock handlers 中预配置英业达品牌和所有8个产品：

**品牌：**
- 英业达 (Inventec)
- ID: `brand_inventec`

**产品列表：**
1. 英业达 (Inventec) 机架解决方案
2. 英业达 (Inventec) AI服务器
3. 英业达 (Inventec) 通用服务器
4. 英业达 (Inventec) 存储服务器
5. 英业达 (Inventec) 网络交换机
6. 英业达 (Inventec) 笔记本电脑
7. 英业达 (Inventec) 台式机
8. 英业达 (Inventec) 精简型电脑

## 实现细节

### 数据生成脚本
- 位置: `scripts/generate_time_series_data.py`
- 功能: 读取JSON文件，为每个产品生成7天的数据，应用随机波动同时保持排名

### Mock Handlers 更新
- 位置: `src/mocks/handlers.ts`
- 添加了 `initializeInventecBrand()` 函数
- 在 `GET /api/brands` 和 `GET /api/brands/:brandId/products` 端点中自动初始化英业达数据

## 使用方法

1. **查看数据**: JSON文件已更新，包含所有7天的数据
2. **访问产品**: 在应用的产品设置页面，选择"英业达 (Inventec)"品牌即可看到所有8个产品
3. **数据验证**: 所有数据都在指定范围内波动，排名保持一致

## 注意事项

- 数据生成使用了随机种子（seed=42），确保可重复性
- Mock数据只在开发环境中使用
- 实际生产环境需要连接真实的后端API


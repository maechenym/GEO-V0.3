# 前端数据计算问题清单

本文档列出了所有前端进行计算或使用mock数据的地方，需要改为从后端API获取数据。

## 1. Overview页面 (`src/app/(app)/overview/page.tsx`)

### 问题1.1: 前端重新计算rank
- **位置**: 第567-574行
- **问题**: 前端在过滤隐藏品牌后，使用 `rank: index + 1` 重新计算rank
- **应该**: 使用后端API返回的rank值，后端应该已经考虑了过滤后的排名
- **代码**:
```typescript
.map((brand, index) => {
  return {
    ...brand,
    rank: index + 1, // ❌ 前端计算
    delta: 0, // ❌ 前端硬编码
  }
})
```

### 问题1.2: 前端硬编码delta为0
- **位置**: 第573行
- **问题**: 前端硬编码 `delta: 0`
- **应该**: 使用后端API返回的delta值

### 问题1.3: 未使用的getRandomRankDelta函数
- **位置**: 第536-547行
- **问题**: 定义了生成随机delta的函数，但似乎未被使用
- **建议**: 如果不需要，应该删除

---

## 2. Sentiment页面 (`src/app/(app)/insights/sentiment/page.tsx`)

### 问题2.1: 前端计算KPI（computeSeriesKpis）
- **位置**: 第445-465行
- **问题**: `computeSeriesKpis`函数在前端计算平均值
- **应该**: 所有KPI应该从后端API获取
- **代码**:
```typescript
const computeSeriesKpis = (series: SeriesPoint[]) => {
  const avgSentiment = series.reduce((sum, p) => sum + p.sentimentScore, 0) / len
  const avgPos = series.reduce((sum, p) => sum + p.pos, 0) / len
  // ❌ 前端计算平均值
}
```

### 问题2.2: 前端计算时间窗口（windowedSeries）
- **位置**: 第467-482行
- **问题**: 前端计算当前和之前的时间窗口
- **应该**: 后端应该返回当前和之前周期的数据

### 问题2.3: 前端fallback计算KPI
- **位置**: 第486-500行
- **问题**: 如果API数据不可用，前端会计算KPI
- **应该**: 确保API始终返回KPI数据，不要fallback到计算

### 问题2.4: 前端计算previousKpis
- **位置**: 第502-512行
- **问题**: 前端计算或使用硬编码值生成previousKpis
- **应该**: 后端应该返回previous周期的KPI数据
- **代码**:
```typescript
return {
  avgSentiment: Math.max(-1, Math.min(1, kpis.avgSentiment - 0.05)), // ❌ 前端计算
  positive: Math.max(0, kpis.positive - 3), // ❌ 前端计算
  // ...
}
```

### 问题2.5: 前端转换百分比
- **位置**: 第288-290行
- **问题**: 前端将百分比除以100转换为小数
- **应该**: 后端应该直接返回正确格式的数据
- **代码**:
```typescript
const avgPos = Math.max(0, Math.min(1, (kpis.positive || 0) / 100)) // ❌ 前端转换
```

### 问题2.6: 前端计算topic score
- **位置**: 第310-318行
- **问题**: 前端计算topic的score值
- **应该**: 后端应该返回计算好的score
- **代码**:
```typescript
score: Math.max(0, Math.min(1, topic.score ?? Math.max(0, topic.sentiment))), // ❌ 前端计算
score: Math.max(0, Math.min(1, topic.score ?? Math.abs(topic.sentiment))), // ❌ 前端计算
```

### 问题2.7: 前端计算fallback topic score
- **位置**: 第325行、第333行
- **问题**: 前端从sentiment计算score
- **应该**: 后端应该返回计算好的score
- **代码**:
```typescript
score: Math.min(1, Math.max(0, (t.sentiment + 1) / 2)), // ❌ 前端计算
score: Math.min(1, Math.max(0, Math.abs(t.sentiment))), // ❌ 前端计算
```

### 问题2.8: 使用mock数据作为fallback
- **位置**: 第278-432行
- **问题**: 如果API数据不可用，使用mock数据
- **应该**: 确保API始终返回有效数据，或者显示错误信息而不是mock数据

### 问题2.9: 使用MOCK_SOURCES填充缺失数据
- **位置**: 第364-377行
- **问题**: 如果API数据中某些source type缺失，使用MOCK_SOURCES填充
- **应该**: 后端应该返回所有source type的完整数据

### 问题2.10: 前端硬编码delta为0
- **位置**: 第514-522行
- **问题**: 前端硬编码所有delta为0
- **应该**: 使用后端API返回的delta值

---

## 3. Intent页面 (`src/app/(app)/insights/intent/page.tsx`)

### 问题3.1: API失败时fallback到mock数据
- **位置**: 第142-146行
- **问题**: API失败时返回mock数据
- **应该**: 显示错误信息，不要使用mock数据
- **代码**:
```typescript
catch (error: any) {
  console.error("[Intent] API error:", error)
  // ❌ Fallback to mock data
  return {
    kpis: mockIntentKpis,
    topics: mockTopicRows,
  }
}
```

### 问题3.2: 使用mock数据作为fallback
- **位置**: 第154-155行
- **问题**: 如果API数据为空，使用mock数据
- **应该**: 确保API返回有效数据，或显示空状态
- **代码**:
```typescript
const kpis = apiData?.kpis || mockIntentKpis // ❌ 使用mock数据
const rows = apiData?.topics && apiData.topics.length > 0 ? apiData.topics : mockTopicRows // ❌ 使用mock数据
```

### 问题3.3: 前端计算scopedKpis
- **位置**: 第229-243行
- **问题**: 前端计算topicCount, promptCount, totalQueries, compositeRank
- **应该**: 后端应该返回这些计算好的值
- **代码**:
```typescript
const scopedKpis = useMemo(() => {
  const topicCount = 15 // ❌ 前端硬编码
  const promptCount = filteredRows.reduce((sum, t) => sum + t.prompts.length, 0) // ❌ 前端计算
  const totalQueries = Math.max(topicCount * 16, promptCount + 1000) // ❌ 前端计算
  const topicAvgRanks = filteredRows.map((t) => {
    const ranks = t.prompts.map((p) => p.rank || 6)
    return ranks.length ? ranks.reduce((a, b) => a + b, 0) / ranks.length : 6 // ❌ 前端计算
  })
  const compositeRank = topicAvgRanks.length
    ? Math.max(1, Math.round(topicAvgRanks.reduce((a, b) => a + b, 0) / topicAvgRanks.length)) // ❌ 前端计算
    : kpis.compositeRank
  return { ...kpis, topicCount, promptCount, totalQueries, compositeRank }
}, [kpis, filteredRows])
```

---

## 4. Visibility页面 (`src/app/(app)/insights/visibility/page.tsx`)

### 问题4.1: 前端重新计算rank
- **位置**: 第284行
- **问题**: 前端在过滤隐藏品牌后，使用 `rank: index + 1` 重新计算rank
- **应该**: 使用后端API返回的rank值，后端应该已经考虑了过滤后的排名
- **代码**:
```typescript
return filtered.map((item, index) => {
  return {
    ...item,
    rank: index + 1, // ❌ 前端计算
    delta: 0, // ❌ 前端硬编码
  }
})
```

### 问题4.2: 前端硬编码delta为0
- **位置**: 第285行
- **问题**: 前端硬编码 `delta: 0`
- **应该**: 使用后端API返回的delta值

---

## 5. Sources页面 (`src/app/(app)/insights/sources/page.tsx`)

### 问题5.1: 完全使用mock数据
- **位置**: 第174行
- **问题**: 使用 `simulateLoad(mockSourceRows, 600)` 加载mock数据
- **应该**: 从后端API获取数据
- **代码**:
```typescript
useEffect(() => {
  setLoading(true)
  setError(null)
  simulateLoad(mockSourceRows, 600) // ❌ 使用mock数据
    .then((rows) => {
      setSourceRows(rows)
    })
    .catch((e) => setError(e))
    .finally(() => setLoading(false))
}, [])
```

---

## 总结

### 主要问题类型：
1. **前端计算rank**: Overview和Visibility页面在过滤后重新计算rank
2. **前端硬编码delta**: 多个页面硬编码delta为0
3. **前端计算KPI**: Sentiment页面计算平均值等KPI
4. **使用mock数据**: Sentiment、Intent、Sources页面使用mock数据作为fallback
5. **前端计算聚合值**: Intent页面计算totalQueries、compositeRank等
6. **前端数据转换**: Sentiment页面转换百分比格式

### 修复建议：
1. 所有计算应该在后端完成
2. 后端API应该返回完整、计算好的数据
3. 前端只负责显示数据，不进行计算
4. 移除所有mock数据fallback，改为显示错误或空状态
5. 后端应该考虑隐藏品牌的过滤，返回正确的rank值


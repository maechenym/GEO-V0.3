# 日期选择器使用指南

## 概述

项目中已经安装并配置了一个简单易用的日期选择器组件，基于 `react-datepicker`。该组件可以：

- ✅ 正确打开日历弹窗
- ✅ 选择单个日期
- ✅ 选择日期和时间
- ✅ 返回日期给后端
- ✅ 支持日期范围限制

## 安装状态

以下依赖已经安装：
- `react-datepicker`: ^8.8.0
- `@types/react-datepicker`: ^6.2.0
- `date-fns`: ^4.1.0 (用于日期格式化)

## 基本使用

### 1. 导入组件

```tsx
import { DatePicker } from "@/components/ui/date-picker"
```

### 2. 基本用法

```tsx
import { useState } from "react"
import { DatePicker } from "@/components/ui/date-picker"

function MyComponent() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  return (
    <DatePicker
      value={selectedDate}
      onChange={setSelectedDate}
      placeholder="选择日期"
    />
  )
}
```

### 3. 发送日期到后端

```tsx
import { useState } from "react"
import { DatePicker } from "@/components/ui/date-picker"
import { Button } from "@/components/ui/button"

function MyComponent() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!selectedDate) {
      alert("请先选择日期")
      return
    }

    setLoading(true)
    try {
      // 发送到后端
      const response = await fetch("/api/your-endpoint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: selectedDate.toISOString(), // 或其他格式
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("后端返回:", result)
      }
    } catch (error) {
      console.error("发送失败:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <DatePicker
        value={selectedDate}
        onChange={setSelectedDate}
        placeholder="选择日期"
      />
      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "发送中..." : "提交"}
      </Button>
    </div>
  )
}
```

## 高级用法

### 选择日期和时间

```tsx
<DatePicker
  value={selectedDateTime}
  onChange={setSelectedDateTime}
  placeholder="选择日期和时间"
  showTimeSelect
  timeFormat="HH:mm"
  dateFormat="yyyy-MM-dd HH:mm"
/>
```

### 设置日期范围限制

```tsx
const today = new Date()
const nextWeek = new Date()
nextWeek.setDate(today.getDate() + 7)

<DatePicker
  value={selectedDate}
  onChange={setSelectedDate}
  minDate={today}
  maxDate={nextWeek}
  placeholder="选择日期（限制在接下来7天）"
/>
```

### 禁用日期选择器

```tsx
<DatePicker
  value={selectedDate}
  onChange={setSelectedDate}
  disabled={true}
  placeholder="禁用状态"
/>
```

## 组件属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `Date \| null` | `undefined` | 当前选中的日期 |
| `onChange` | `(date: Date \| null) => void` | **必需** | 日期改变时的回调函数 |
| `placeholder` | `string` | `"选择日期"` | 占位符文本 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `minDate` | `Date` | `undefined` | 最小可选日期 |
| `maxDate` | `Date` | `undefined` | 最大可选日期 |
| `showTimeSelect` | `boolean` | `false` | 是否显示时间选择 |
| `timeFormat` | `string` | `"HH:mm"` | 时间格式（仅在 showTimeSelect 为 true 时生效） |
| `dateFormat` | `string` | `"yyyy-MM-dd"` | 日期格式 |
| `className` | `string` | `undefined` | 自定义样式类名 |

## 示例文件

查看 `src/components/ui/date-picker-example.tsx` 获取更多使用示例。

## 样式定制

日期选择器的样式已经在 `src/app/globals.css` 中配置，使用了项目的设计系统颜色。如果需要进一步定制，可以修改：

1. `src/app/globals.css` 中的 `.react-datepicker` 相关样式
2. `src/components/ui/date-picker.tsx` 组件中的样式类名

## 常见问题

### Q: 如何格式化日期发送给后端？

A: 可以使用以下几种方式：

```tsx
// ISO 格式（推荐）
const dateToSend = selectedDate.toISOString()

// 自定义格式
import { format } from "date-fns"
const dateToSend = format(selectedDate, "yyyy-MM-dd")

// 时间戳
const dateToSend = selectedDate.getTime()
```

### Q: 如何设置默认日期？

A: 在 useState 中设置初始值：

```tsx
const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
```

### Q: 选择日期后如何自动关闭日历？

A: 组件已经自动实现了这个功能。选择日期后，日历会自动关闭。

## 技术细节

- 组件基于 `react-datepicker` v8.8.0
- 使用 `Popover` 组件包装，提供更好的用户体验
- 日期格式化使用 `date-fns` 库
- 样式已集成到项目的设计系统中


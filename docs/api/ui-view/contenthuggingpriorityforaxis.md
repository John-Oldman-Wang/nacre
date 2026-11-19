---
type: reference
native: "-[UIView contentHuggingPriorityForAxis:]"
---

# `UIView`：`contentHuggingPriorityForAxis()` 方法

**`contentHuggingPriorityForAxis()`** 方法返回视图在一个方向上「不愿被拉得比固有大小大」的优先级（内容抱紧优先级）。

## 语法

```
contentHuggingPriorityForAxis(axis)
```

### 参数

**`axis`**

`'horizontal'`（水平方向，影响宽度）或 `'vertical'`（垂直方向，影响高度）。

### 返回值

数，1 到 1000，没有单位。默认 `250`：`UILabel` 和普通 `UIView` 都是 250（实测，水平和垂直都是）。

### 异常

**`TypeError`**

方向写错：`axis has no value "diagonal"; expected one of: horizontal / vertical`。

## 示例

```js
const label = new UILabel();
console.log(label.contentHuggingPriorityForAxis('horizontal'));
```

**结果**：输出 `250`。

## 对应的 iOS API

`-[UIView contentHuggingPriorityForAxis:]`。`UILayoutConstraintAxisHorizontal` 写成 `'horizontal'`。

## 参见

- [`setContentHuggingPriority()`](setcontenthuggingpriority.md)
- [内容抱紧和抗压缩](../auto-layout.md#内容抱紧和抗压缩)

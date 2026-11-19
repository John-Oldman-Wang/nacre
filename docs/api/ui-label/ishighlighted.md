---
type: reference
native: UILabel.highlighted
---

# `UILabel`：`isHighlighted` 属性

**`isHighlighted`** 属性决定标签是否处于高亮状态。高亮时文字用 [`highlightedTextColor`](highlightedtextcolor.md) 的颜色显示。

## 值

布尔。

- 可读，可写。
- 默认值是 `false`。
- `true`：文字用 `highlightedTextColor` 显示。`highlightedTextColor` 是 `null` 时颜色不变。**未在模拟器验证。**
- `false`：文字用 [`textColor`](textcolor.md) 显示。
- 系统不会自动修改它，只有 App 的代码会改，所以没有变化通知。

## 示例

```js
const label = new UILabel();
label.text = '临时提示';
label.highlightedTextColor = 'systemYellow';
label.isHighlighted = true;
```

**效果**：文字变成黄色。把 `isHighlighted` 设回 `false`，文字恢复成 `textColor` 的颜色。**未在模拟器验证。**

## 对应的 iOS API

`UILabel.highlighted`（getter 是 `isHighlighted`）。

## 参见

- [`highlightedTextColor`](highlightedtextcolor.md)

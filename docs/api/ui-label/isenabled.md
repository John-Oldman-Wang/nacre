---
type: reference
native: UILabel.enabled
---

# `UILabel`：`isEnabled` 属性

**`isEnabled`** 属性决定标签是否显示成可用的样子。

## 值

布尔。

- 可读，可写。
- 默认值是 `true`。
- `true`：文字正常显示。
- `false`：文字变淡，表示这项内容当前不可用。**未在模拟器验证。**
- 它只改变外观，不影响触摸。

## 示例

```js
const label = new UILabel();
label.text = '暂不可用';
label.isEnabled = false;
```

**效果**：文字变淡。设回 `true` 恢复。**未在模拟器验证。**

## 对应的 iOS API

`UILabel.enabled`（getter 是 `isEnabled`）。

## 参见

- [`isHighlighted`](ishighlighted.md)

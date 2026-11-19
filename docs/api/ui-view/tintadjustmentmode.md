---
type: reference
native: UIView.tintAdjustmentMode
---

# `UIView`：`tintAdjustmentMode` 属性

**`tintAdjustmentMode`** 属性决定 [`tintColor`](tintcolor.md) 是正常显示还是变暗。系统在弹出提示框时把后面的界面变暗，用的就是它。

## 值

字符串，下面三个之一：

| 取值 | 效果 |
| --- | --- |
| `'automatic'` | 跟随父视图 |
| `'normal'` | 强调色正常显示 |
| `'dimmed'` | 强调色变暗成灰色 |

- 可读，可写。写入 `'dimmed'` 读回 `'dimmed'`（实测）。
- 默认值**未在模拟器验证**，按 Apple 的文档是 `'automatic'`。
- 各取值在屏幕上的效果**未在模拟器验证**。

### 写错时

写入表里没有的值：不抛异常，控制台输出一条警告 `[Nacre] tintAdjustmentMode has no value "x"; expected one of: automatic / normal / dimmed, ignored`，属性保持原值。

## 示例

```js
const view = new UIView();
view.tintAdjustmentMode = 'dimmed';
console.log(view.tintAdjustmentMode);
```

**效果**：这个视图和它的子视图的强调色变暗（**未在模拟器验证**）。控制台输出 `dimmed`。

## 对应的 iOS API

`UIView.tintAdjustmentMode`。`UIViewTintAdjustmentModeDimmed` 写成 `'dimmed'`。

## 参见

- [`tintColor`](tintcolor.md)

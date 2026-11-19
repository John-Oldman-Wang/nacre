---
type: reference
native: "-[UIStackView setCustomSpacing:afterView:]"
---

# `UIStackView`：`setCustomSpacing()` 方法

**`setCustomSpacing()`** 方法单独指定某一个排列项后面的间距。这个值优先于 [`spacing`](spacing.md) 属性。

## 语法

```
setCustomSpacing(spacing, { afterView })
```

### 参数

**`spacing`**

间距，下面三种之一：

| 值 | 效果 |
| --- | --- |
| 数 | 这一项后面的间距是这么多 [pt](../units.md) |
| `'system'` | 这一项后面用系统推荐的间距 |
| `'default'` | 撤回单独的设置，这一项后面重新使用 `spacing` 属性的值 |

**`options.afterView`**

`UIView`，必填。间距加在这个排列项的后面。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- 没传 `afterView`，或者写成 `{ afterView: undefined }`：`setCustomSpacing needs { afterView }`。
- `afterView` 不是视图：`setCustomSpacing needs a UIView`。
- `spacing` 不是数、`'system'` 或 `'default'`：`setCustomSpacing has no value "wide"; expected one of: a number / "system" / "default"`。

抛错时间距不变。

## 说明

视图被移出排列之后，给它设的间距失效。排列项在排列里换位置时，间距跟着它移动。**这两条未在模拟器验证。**

## 示例

```js
const red = new UIView();
const orange = new UIView();
const teal = new UIView();
const row = new UIStackView([red, orange, teal]);
row.spacing = 12;

row.setCustomSpacing(40, { afterView: red });
console.log(row.customSpacingAfterView(red));

row.setCustomSpacing('default', { afterView: red });
console.log(row.customSpacingAfterView(red));
```

**效果**

- 第一次设置后，红色块和橙色块之间的空隙是 40 pt，橙色块和青色块之间仍然是 12 pt。控制台输出 `40`。
- 撤回之后，红色块后面重新使用 `spacing` 的值。控制台输出 `default`。

## 对应的 iOS API

`-[UIStackView setCustomSpacing:afterView:]`。`UIStackViewSpacingUseSystem` 写成 `'system'`，`UIStackViewSpacingUseDefault` 写成 `'default'`。

## 参见

- [`customSpacingAfterView()`](customspacingafterview.md)：读回来
- [`spacing`](spacing.md)

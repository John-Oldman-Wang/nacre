---
type: reference
native: UIActivityIndicatorView.activityIndicatorViewStyle
---

# `UIActivityIndicatorView`：`activityIndicatorViewStyle` 属性

**`activityIndicatorViewStyle`** 属性表示转圈的样式。样式决定转圈想要的大小。

## 值

字符串，下面两个之一：

| 取值 | 效果 |
| --- | --- |
| `'medium'` | 想要的大小是 20 × 20 [pt](../units.md) |
| `'large'` | 想要的大小是 37 × 37 pt |

- 可读，可写。
- 默认值是 `'medium'`。
- 换样式只改转圈想要的大小（继承的 `intrinsicContentSize`）。`frame` 不跟着变，颜色也不变。用 Auto Layout 定位的转圈在下一次布局时变成新的大小；用 `frame` 定位的转圈要再调一次 `sizeToFit()`。
- 没有变化事件。只有 App 自己的代码会改它。

### 写错时

写入表里没有的值：不抛异常，控制台输出一条警告，样式保持原来的值。

```
[Nacre] activityIndicatorViewStyle has no value "small"; expected one of: …, ignored
```

ObjC 里已经废弃的 `'gray'`、`'white'`、`'whiteLarge'` 也按写错处理。

## 示例

```js
const spinner = new UIActivityIndicatorView();
spinner.activityIndicatorViewStyle = 'large';
console.log(spinner.frame.width);
spinner.sizeToFit();
console.log(spinner.frame.width, spinner.frame.height);
```

**结果**：先输出 `0`，换样式没有改 `frame`。`sizeToFit()` 之后输出 `37 37`。

## 对应的 iOS API

`UIActivityIndicatorView.activityIndicatorViewStyle`。`UIActivityIndicatorViewStyleMedium` 写成 `'medium'`，`UIActivityIndicatorViewStyleLarge` 写成 `'large'`。

## 参见

- [枚举](../enums.md)：属性写错时为什么是警告而不是抛异常
- [大小跟着样式走](../ui-activity-indicator-view.md#大小跟着样式走)

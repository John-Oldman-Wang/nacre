---
type: reference
native: UIProgressView.progressViewStyle
---

# `UIProgressView`：`progressViewStyle` 属性

**`progressViewStyle`** 属性表示进度条的样式。样式决定进度条的高度。

## 值

字符串，下面两个之一：

| 取值 | 效果 |
| --- | --- |
| `'default'` | 高 4 [pt](../units.md) |
| `'bar'` | 更细，高度小于 4 pt，用在工具栏里。3 倍屏上量到的是 2.67 pt |

- 可读，可写。
- 默认值是 `'default'`。
- 换样式时 `frame` 的高度当场变成新样式的高度。从 `'bar'` 换回 `'default'`，高度回到 4 pt。
- 两种样式在屏幕上的颜色差别**未在模拟器验证**。
- 没有变化事件。只有 App 自己的代码会改它。

### 写错时

写入表里没有的值：不抛异常，控制台输出一条警告，样式保持原来的值。

```
[Nacre] progressViewStyle has no value "thick"; expected one of: default / bar, ignored
```

## 示例

```js
const bar = new UIProgressView();
bar.progressViewStyle = 'bar';
console.log(bar.frame.height < 4);
```

**结果**：输出 `true`，进度条变细。

## 对应的 iOS API

`UIProgressView.progressViewStyle`。`UIProgressViewStyleDefault` 写成 `'default'`，`UIProgressViewStyleBar` 写成 `'bar'`。

## 参见

- [高度由样式决定](../ui-progress-view.md#高度由样式决定)：要更粗的进度条用高度约束
- [枚举](../enums.md)：属性写错时为什么是警告而不是抛异常

---
type: reference
native: UIActivityIndicatorView.hidesWhenStopped
---

# `UIActivityIndicatorView`：`hidesWhenStopped` 属性

**`hidesWhenStopped`** 属性决定转圈没在转的时候是否隐藏。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 没在转的时候隐藏。转圈在开始和停下时自己写 `isHidden` |
| `false` | 停下之后仍然显示，是一圈不动的短线 |

- 可读，可写。
- 默认值是 `true`。
- 改了当场生效，不用等下一次开始或停下：一个没在转的转圈，写 `false` 立刻显示出来，写回 `true` 立刻隐藏。
- 写入的值按 JS 的真假值转成布尔，不会抛异常。
- 没有变化事件。只有 App 自己的代码会改它。

## 示例

```js
const spinner = new UIActivityIndicatorView();
spinner.startAnimating();
spinner.hidesWhenStopped = false;
spinner.stopAnimating();
console.log(spinner.isHidden);
```

**结果**：输出 `false`。转圈停止旋转，仍然显示在原处。屏幕上的样子**未在模拟器验证**。

## 对应的 iOS API

`UIActivityIndicatorView.hidesWhenStopped`。

## 参见

- [显示和隐藏由谁管](../ui-activity-indicator-view.md#显示和隐藏由谁管)
- [`stopAnimating()`](stopanimating.md)

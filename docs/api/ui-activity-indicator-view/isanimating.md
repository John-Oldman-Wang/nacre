---
type: reference
native: UIActivityIndicatorView.isAnimating
---

# `UIActivityIndicatorView`：`isAnimating` 属性

**`isAnimating`** 属性表示转圈是否在转。

## 值

布尔。

| 取值 | 含义 |
| --- | --- |
| `true` | 在转。调过 [`startAnimating()`](startanimating.md)，之后还没调 [`stopAnimating()`](stopanimating.md) |
| `false` | 没在转 |

- 只读。给它赋值抛 `TypeError`，值不变。
- 新建的转圈是 `false`。
- 只由 `startAnimating()` 和 `stopAnimating()` 改变，没有变化事件：改变它的是 App 自己的代码。
- 把继承的 `isHidden` 写成 `true` 不影响它：转圈被隐藏，`isAnimating` 仍然是 `true`。

## 示例

```js
const spinner = new UIActivityIndicatorView();
console.log(spinner.isAnimating);
spinner.startAnimating();
console.log(spinner.isAnimating);
spinner.stopAnimating();
console.log(spinner.isAnimating);
```

**结果**：依次输出 `false`、`true`、`false`。

## 对应的 iOS API

`UIActivityIndicatorView.isAnimating`（ObjC 的 getter 是 `isAnimating`）。

## 参见

- [显示和隐藏由谁管](../ui-activity-indicator-view.md#显示和隐藏由谁管)

---
type: reference
native: UIScrollView.canCancelContentTouches
---

# `UIScrollView`：`canCancelContentTouches` 属性

**`canCancelContentTouches`** 属性表示手指按在里面的按钮上再移动时，能不能改成滚动。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 手指按在按钮上再移动，会改成滚动 |
| `false` | 手指按在按钮上就不能滚动了 |

- 可读，可写。
- 默认值是 `true`。
- 两种取值的效果**未在模拟器验证**。
- 写别的类型的值时按 JS 的真假转换。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const scroller = new UIScrollView();
scroller.canCancelContentTouches = false;
```

**效果**：从按钮上开始拖动时，滚动视图不滚。**未在模拟器验证。**

## 对应的 iOS API

`UIScrollView.canCancelContentTouches`。

## 参见

- [`delaysContentTouches`](delayscontenttouches.md)

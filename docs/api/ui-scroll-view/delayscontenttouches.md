---
type: reference
native: UIScrollView.delaysContentTouches
---

# `UIScrollView`：`delaysContentTouches` 属性

**`delaysContentTouches`** 属性表示手指按下后，是否先等片刻判断是不是要滚动，再把触摸交给里面的按钮。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 先等片刻判断是不是滚动，再把触摸交给里面的按钮。按钮的按下反馈略有延迟 |
| `false` | 立刻把触摸交给里面的按钮 |

- 可读，可写。
- 默认值是 `true`。
- 两种取值的效果**未在模拟器验证**。
- 写别的类型的值时按 JS 的真假转换。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const scroller = new UIScrollView();
scroller.delaysContentTouches = false;
```

**效果**：按下里面的按钮时立刻显示按下的样子。**未在模拟器验证。**

## 对应的 iOS API

`UIScrollView.delaysContentTouches`。

## 参见

- [`canCancelContentTouches`](cancancelcontenttouches.md)

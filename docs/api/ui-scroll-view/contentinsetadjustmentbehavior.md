---
type: reference
native: UIScrollView.contentInsetAdjustmentBehavior
---

# `UIScrollView`：`contentInsetAdjustmentBehavior` 属性

**`contentInsetAdjustmentBehavior`** 属性决定系统是否自动为安全区在内容四周留白。

## 值

字符串，下面四个之一：

| 取值 | 效果 |
| --- | --- |
| `'automatic'` | 由系统决定，通常和 `'scrollableAxes'` 相同 |
| `'scrollableAxes'` | 只在能滚动的方向上留白 |
| `'never'` | 不留白。内容从屏幕边缘开始，会被刘海和底部横条挡住 |
| `'always'` | 四边都留白 |

- 可读，可写。
- 默认值是 `'automatic'`。
- 没有变化事件：改它的只有 App 自己的代码。

### 写错时

写了表里没有的值：不抛异常，属性保持原值，控制台输出一条警告，列出全部可选值：

```
[Nacre] contentInsetAdjustmentBehavior has no value "x"; expected one of: automatic / scrollableAxes / never / always, ignored
```

## 示例

```js
const scroller = new UIScrollView();
scroller.contentInsetAdjustmentBehavior = 'never';
```

**效果**：内容的第一行从屏幕最顶端开始，会被刘海挡住。**未在模拟器验证。**

## 对应的 iOS API

`UIScrollView.contentInsetAdjustmentBehavior`。`UIScrollViewContentInsetAdjustmentNever` 写成 `'never'`，其余同理。

## 参见

- [安全区](../ui-scroll-view.md#安全区)
- [`adjustedContentInset`](adjustedcontentinset.md)

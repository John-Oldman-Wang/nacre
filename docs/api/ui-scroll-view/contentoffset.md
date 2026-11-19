---
type: reference
native: UIScrollView.contentOffset
---

# `UIScrollView`：`contentOffset` 属性

**`contentOffset`** 属性是当前滚到的位置：内容区的左上角相对可视区的左上角移出去了多少。向下滚 `y` 变大，向右滚 `x` 变大。

## 值

[`CGPoint`](../structs.md)，单位是 [pt](../units.md)。

- 可读，可写。
- 默认值是 `(0, 0)`。
- 写入会立刻跳过去，没有动画，并且是同步生效的：写完下一行就读得到新值。要动画用 [`setContentOffset()`](setcontentoffset.md)。
- 写入时可以给 `CGPoint`，也可以给普通对象 `{ x, y }`。
- 每次读出来是一个新对象，字段只读。要改就整个重新赋值，见[结构体](../structs.md)。
- 有安全区留白时，最顶部是一个负数，见[安全区](../ui-scroll-view.md#安全区)。回到顶部要写 `-adjustedContentInset.top`。
- 变化时派发 [`scroll`](scroll-event.md)。用户滚动、惯性滑动、代码写入都会派发。窗口显示出来之前写入不派发（实测）。

### 写错时

- 写入的不是对象：`TypeError: contentOffset needs an object with all of: x, y`
- 缺字段，或者字段不是有限的数：`TypeError: contentOffset is missing y, or it is not a finite number`

抛错之后属性保持原值。

## 示例

```js
const scroller = new UIScrollView();
scroller.contentOffset = new CGPoint(0, 500);
console.log(scroller.contentOffset.y);
```

**结果**：立刻跳到向下 500 pt 的位置，没有过渡。控制台输出 `500`。

## 对应的 iOS API

`UIScrollView.contentOffset`。`CGPointMake(0, 30)` 写成 `new CGPoint(0, 30)`。

## 参见

- [`scroll`](scroll-event.md) 事件
- [`setContentOffset()`](setcontentoffset.md)

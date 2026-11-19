---
type: reference
native: "UIScrollViewDelegate scrollViewDidScroll:"
---

# `UIScrollView`：`scroll` 事件

**`scroll`** 事件在滚动位置变了时派发。

## 语法

```
scroller.addEventListener('scroll', (event) => { })
```

## 事件对象

`Event`。只有 `type` 和 `target`（这个滚动视图），不带别的数据。不能取消。 位置从 [`contentOffset`](contentoffset.md) 读。

## 什么时候派发

- 用户拖动、松手后的惯性滑动、代码写 `contentOffset`、`setContentOffset()` 的动画，都会派发。
- **会合并。** 上一个 `scroll` 还没派发时又发生的滚动，不再另外派发。所以 `scroll` 的次数不等于位置变化的次数，不要用它计数（实测：连写三次位置，只收到一个 `scroll`）。
- **窗口显示出来之前写 `contentOffset` 不派发。** 位置写得进去，读出来是对的，但收不到事件（实测）。
- 一次真实的滑动历时 1819 ms，派发了 100 次（模拟器，Debug 构建）。在回调里读位置、改视图是正常用法。
- 在事情发生之后、当前这段 JS 执行完之后派发。回调执行时滚动视图的状态已经是新的。
- 没有监听器时没有开销。

## 示例

### 读当前的位置

```js
const scroller = new UIScrollView();
scroller.addEventListener('scroll', () => {
  console.log(scroller.contentOffset.y);
});
```

**效果**：滚动期间不断输出一个数字。在最顶部时是 `0` 附近（有安全区时是负数），越往下滚数字越大，单位是 pt。

### 事件会合并

```js
const scroller = new UIScrollView();
let count = 0;
scroller.addEventListener('scroll', () => { count += 1; });

scroller.contentOffset = new CGPoint(0, 10);
scroller.contentOffset = new CGPoint(0, 20);
scroller.contentOffset = new CGPoint(0, 30);
console.log(scroller.contentOffset.y);

setTimeout(() => console.log(count), 100);
```

**结果**：第一行立刻输出 `30`，写入是同步生效的。100 毫秒后输出 `1`（实测，滚动视图在已经显示出来的窗口里）。三次赋值执行时回调一次都没有被调用。

## 对应的 iOS API

`UIScrollViewDelegate` 的 `scrollViewDidScroll:`。

## 参见

- [`contentOffset`](contentoffset.md)
- [滚动和 JS 的关系](../ui-scroll-view.md#滚动和-js-的关系)

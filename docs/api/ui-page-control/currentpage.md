---
type: reference
native: UIPageControl.currentPage
---

# `UIPageControl`：`currentPage` 属性

**`currentPage`** 属性是现在第几页，从 0 数。这一页的点显示得比别的点更亮。

## 值

数，页码。

- 可读，可写。
- 默认值是 0。
- 写入时先按数转换，小数向零取整。
- 超出范围的值不报错，被改到 0 和最后一页之间：写 9 得到最后一页，写 -1 得到 0。一页都没有时总是 0。

### 怎么得知它变了

用户点或者拖这排点换了页时，控件先改好 `currentPage`，再派发 [`change`](../ui-control/change-event.md)。代码写入不派发：验收用例里写入之后 300 毫秒内没有收到 `change`。所以在滚动内容的回调里写它，不会反过来触发 `change`。

[`numberOfPages`](numberofpages.md) 改小引起的变化也不派发事件。

### 写错时

转不出有限数时抛 `TypeError`：`currentPage must be a finite number, got "next"`。

## 示例

```js
const pages = new UIPageControl();
pages.numberOfPages = 5;
pages.currentPage = 9;
console.log(pages.currentPage);
pages.addEventListener('change', () => {
  console.log('换到了第', pages.currentPage, '页');
});
```

**效果**：先输出 `4`。之后用户点了别的点，控制台输出换到的页码。**点击的效果未在模拟器验证。**

## 对应的 iOS API

`UIPageControl.currentPage`。

## 参见

- [`change`](../ui-control/change-event.md) 事件
- [`interactionState`](interactionstate.md)：这次换页是点的还是拖的

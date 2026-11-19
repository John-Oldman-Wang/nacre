---
type: reference
native: UIScrollView.contentInset
---

# `UIScrollView`：`contentInset` 属性

**`contentInset`** 属性是在内容四周额外留的空白。这些空白跟着内容一起滚动。

## 值

[`UIEdgeInsets`](../structs.md)，四个字段 `top`、`left`、`bottom`、`right`，单位是 [pt](../units.md)。

- 可读，可写。
- 默认值是四边都是 `0`。
- 四个字段都要写，也可以写成普通对象 `{ top: 20, left: 0, bottom: 80, right: 0 }`。少一个字段抛 `TypeError`。
- 留白不算进 `contentSize`。
- 实际生效的留白是 [`adjustedContentInset`](adjustedcontentinset.md)，它在这个值上再加系统为安全区留的部分。
- 每次读出来是一个新对象，字段只读。要改就整个重新赋值，见[结构体](../structs.md)。
- 没有变化事件：改它的只有 App 自己的代码。

### 写错时

- 写入的不是对象：`TypeError: contentInset needs an object with all of: top, left, bottom, right`
- 缺字段，或者字段不是有限的数：`TypeError: contentInset is missing bottom, or it is not a finite number`

抛错之后属性保持原值。

## 示例

```js
const scroller = new UIScrollView();
scroller.contentInset = new UIEdgeInsets(20, 0, 80, 0);
```

**效果**：内容顶部多出 20 pt 空白，底部多出 80 pt 空白。底部有悬浮按钮时，用它保证最后一行不被挡住。**未在模拟器验证。**

## 对应的 iOS API

`UIScrollView.contentInset`。`UIEdgeInsetsMake(20, 0, 80, 0)` 写成 `new UIEdgeInsets(20, 0, 80, 0)`。

## 参见

- [`adjustedContentInset`](adjustedcontentinset.md)
- [`UIStackView` 的内边距](../ui-stack-view.md)：另一种留白，算进 `contentSize`

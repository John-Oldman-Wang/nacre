---
type: reference
native: UIToolbar.items
---

# `UIToolbar`：`items` 属性

**`items`** 属性是工具条上的项，从左到右排列。每一项是一个 [`UIBarButtonItem`](../ui-bar-button-item.md)。

## 值

`UIBarButtonItem` 的数组。

- 可读，可写。
- 默认值是 `[]`。
- 每次读都得到一个新数组，里面是工具条当时的那几项。往这个数组里 `push`、`pop` 不改变工具条；要增减按钮，整个重新赋值。
- 数组里的每一项仍然是原来的对象：读出来的 `items[0]` 和写进去的那个按钮 `===` 相等，按钮上的监听器和自定义属性都在。
- 写 `null` 等于写空数组，读回来是 `[]`。
- 除了数组，也接受 `Set` 这类可以遍历的对象。
- 工具条持有它的项。按钮放进 `items` 之后，App 不留变量，按钮和它的监听器也不会丢。
- 没有变化事件：改它的只有 App 自己的代码。
- 直接写 `items` 是立刻换掉，没有过渡。要动画用 [`setItems()`](setitems.md)。
- 同一个按钮放进第二个工具条时不报错，两个工具条的 `items` 里都有它。画面上它出现在哪一个里**未在模拟器验证**。

按钮之间的空白用 `UIBarButtonItem.flexibleSpace()`（占满剩下的宽度，几个平分）和 `UIBarButtonItem.fixedSpace(width)`（宽 `width` pt）这两种项来占。

### 写错时

- 写了不是数组的值（数、字符串）：抛 `TypeError: items needs an array of UIBarButtonItem or null`。
- 数组里有不是 `UIBarButtonItem` 的元素（别的对象、`null`、字符串）：抛 `TypeError: items needs an array of UIBarButtonItem`。

两种情况下原来的项都不变。

## 示例

```js
const toolbar = new UIToolbar();
const add = UIBarButtonItem.systemItem('add');
toolbar.items = [add, UIBarButtonItem.flexibleSpace(), UIBarButtonItem.systemItem('trash')];

toolbar.items = [...toolbar.items, UIBarButtonItem.systemItem('done')];
console.log(toolbar.items.length);
console.log(toolbar.items[0] === add);
```

**结果**：依次输出 `4`、`true`。工具条上加号在左端，垃圾桶和「完成」在右端。

## 对应的 iOS API

`UIToolbar.items`。`nil` 写成 `null`，读回来是 `[]`。

## 参见

- [`setItems()`](setitems.md)：带动画地换一组项
- [`UIBarButtonItem`](../ui-bar-button-item.md)：`UIBarButtonItem`、`flexibleSpace()`、`fixedSpace()`

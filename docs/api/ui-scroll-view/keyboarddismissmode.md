---
type: reference
native: UIScrollView.keyboardDismissMode
---

# `UIScrollView`：`keyboardDismissMode` 属性

**`keyboardDismissMode`** 属性决定用户拖动滚动视图时要不要收起键盘。

## 值

字符串，下面五个之一：

| 取值 | 效果 |
| --- | --- |
| `'none'` | 拖动时不收键盘 |
| `'onDrag'` | 一开始拖动就收起键盘 |
| `'interactive'` | 手指拖到键盘上之后，键盘跟着手指往下走，松手时决定收起还是弹回 |
| `'onDragWithAccessory'` | 同 `'onDrag'`，连同键盘上方的工具条一起收 |
| `'interactiveWithAccessory'` | 同 `'interactive'`，连同键盘上方的工具条一起算 |

- 可读，可写。
- 默认值是 `'none'`。
- 各个取值的效果**未在模拟器验证**。验收用例验证的是：五个取值都能写入并读回。
- 它收的是当前弹出的键盘，不管正在输入的输入框是不是滚动视图的子视图。键盘收起时，正在输入的输入框派发 `blur`。
- 滚动视图的子类都有这个属性，包括 [`UITextView`](../ui-text-view.md) 和 [`UICollectionView`](../ui-collection-view.md)。
- 没有变化事件：改它的只有 App 自己的代码。

### 写错时

写了表里没有的值：不抛异常，属性保持原值，控制台输出一条警告，列出全部可选值：

```
[Nacre] keyboardDismissMode has no value "x"; expected one of: none / onDrag / interactive / onDragWithAccessory / interactiveWithAccessory, ignored
```

## 示例

```js
const scroller = new UIScrollView();
scroller.keyboardDismissMode = 'onDrag';
// @ts-expect-error 故意写错
scroller.keyboardDismissMode = 'drag';
console.log(scroller.keyboardDismissMode);
```

**效果**

- 用户一拖动内容，键盘就收起。**未在模拟器验证。**
- 控制台先输出一条警告，接着输出 `onDrag`：写错的赋值没有生效。

## 对应的 iOS API

`UIScrollView.keyboardDismissMode`。`UIScrollViewKeyboardDismissModeOnDrag` 写成 `'onDrag'`，其余同理。

## 参见

- [拖动列表时收起键盘](../../guides/scrolling.md#拖动列表时收起键盘)

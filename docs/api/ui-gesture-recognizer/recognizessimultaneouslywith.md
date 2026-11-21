---
type: reference
native: "UIGestureRecognizerDelegate gestureRecognizer:shouldRecognizeSimultaneouslyWithGestureRecognizer:"
---

# `UIGestureRecognizer`：`recognizesSimultaneouslyWith` 属性

**`recognizesSimultaneouslyWith`** 属性列出可以和这个识别器同时认出手势的其他识别器。

默认情况下，一次触摸里一个识别器认出手势之后，别的识别器就不认了。比如滚动视图里的一个视图上加了拖动识别器，用户拖这个视图时，要么这个识别器生效，要么滚动视图滚动，不会两个一起。把对方写进这个列表，两个识别器就能同时认出手势，各自派发事件。

## 值

[`UIGestureRecognizer`](../ui-gesture-recognizer.md) 的数组。

- 可读，可写。
- 默认值是空数组 `[]`：不和任何识别器同时认。
- 每次读到一个新数组，数组里的识别器和写进去的是同一个对象（`===` 成立）。改读到的数组不影响设置，要改就整体写一个新数组。
- 写空数组，回到默认：不和任何识别器同时认。
- 可以写 UIKit 自带的识别器，比如滚动视图的 [`panGestureRecognizer`](../ui-scroll-view/pangesturerecognizer.md)。
- 系统问这个识别器能不能和另一个识别器同时认时，另一个在列表里就答能，不在就答不能。这个回答不调用 JS，没有事件。
- 两个识别器里只要有一个把对方写进了列表，两个就能同时认（来自 iOS 的定义）。所以只写在自己创建的那一个上就够了。
- 列表不保管里面的识别器。识别器仍然由它所在的视图保管；它被回收之后，从列表里消失。
- 写入后系统的回答在验收用例里验证过：用例照系统的做法去问识别器，断言了列表里的、列表外的、清空之后三种情况。两个手势在真实的触摸下同时被认出、各自派发事件，**未用真实的手指验证**。

### 写错时

数组里有一项不是识别器（包括 `null`），或者写的不是数组，抛 `TypeError`，原来的列表不变：

```
recognizesSimultaneouslyWith needs an array of UIGestureRecognizer
```

### 只能写在自己创建的识别器上

只有 App 用 `new` 创建的识别器能写这个属性。在 UIKit 自带的识别器（比如滚动视图的 `panGestureRecognizer`）上写非空数组，抛 `TypeError`，这个识别器的行为不变：

```
recognizesSimultaneouslyWith is only available on gesture recognizers you create: this one belongs to UIKit (for example a scroll view's built-in pan) and its delegate cannot be replaced
```

要让自己的识别器和 UIKit 的识别器同时认，写在自己的那一个上，把 UIKit 的那一个放进数组。

### 怎么得知它变了

它变了不派发事件。只有 App 的代码会改它，不需要通知。

## 示例

```js
const scroller = new UIScrollView();
const card = new UIView();
scroller.addSubview(card);

const pan = new UIPanGestureRecognizer();
pan.addEventListener('changed', () => {
  console.log('拖卡片');
});
const scrollPan = scroller.panGestureRecognizer;
if (scrollPan !== null) {
  pan.recognizesSimultaneouslyWith = [scrollPan];
}
card.addGestureRecognizer(pan);
```

**效果**：在 `card` 上拖动时，滚动视图照常滚动，同时 `pan` 派发 `changed`，控制台不断输出 `拖卡片`。不写这一行时，只有其中一个生效。**未用真实的手指验证。**

## 对应的 iOS API

`UIGestureRecognizerDelegate` 的 `gestureRecognizer:shouldRecognizeSimultaneouslyWithGestureRecognizer:`。ObjC 里要设识别器的 `delegate`，在这个方法里按对方返回 `YES` 或 `NO`；这里把要答 `YES` 的识别器列进数组。

## 参见

- [让两个手势同时生效](../../guides/gestures.md#让两个手势同时生效)
- [`beforebegin`](beforebegin-event.md)：系统问的另一件事，要不要开始
- [`requireGestureRecognizerToFail()`](requiregesturerecognizertofail.md)：和这个相反，让一个识别器等另一个认不出之后再认
- [所有权](../ui-gesture-recognizer.md#所有权)

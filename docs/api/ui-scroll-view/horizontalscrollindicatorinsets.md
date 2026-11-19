---
type: reference
native: UIScrollView.horizontalScrollIndicatorInsets
---

# `UIScrollView`：`horizontalScrollIndicatorInsets` 属性

**`horizontalScrollIndicatorInsets`** 属性是横向指示条离滚动视图边缘的距离。

## 值

[`UIEdgeInsets`](../structs.md)，单位是 [pt](../units.md)。

- 可读，可写。
- 默认值是四边都是 `0`。
- [`automaticallyAdjustsScrollIndicatorInsets`](automaticallyadjustsscrollindicatorinsets.md) 是 `true` 时，系统在这个值上再按安全区调整。
- 每次读出来是一个新对象，字段只读。要改就整个重新赋值，见[结构体](../structs.md)。
- 没有变化事件：改它的只有 App 自己的代码。

### 写错时

- 写入的不是对象：`TypeError: horizontalScrollIndicatorInsets needs an object with all of: top, left, bottom, right`
- 缺字段，或者字段不是有限的数：`TypeError: horizontalScrollIndicatorInsets is missing bottom, or it is not a finite number`

抛错之后属性保持原值。

## 示例

```js
const scroller = new UIScrollView();
scroller.horizontalScrollIndicatorInsets = new UIEdgeInsets(0, 0, 80, 0);
```

**效果**：横向指示条不进入底部 80 pt 的范围。**未在模拟器验证。**

## 对应的 iOS API

`UIScrollView.horizontalScrollIndicatorInsets`。

## 参见

- [`automaticallyAdjustsScrollIndicatorInsets`](automaticallyadjustsscrollindicatorinsets.md)

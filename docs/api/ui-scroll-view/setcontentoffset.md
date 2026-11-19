---
type: reference
native: "-[UIScrollView setContentOffset:animated:]"
---

# `UIScrollView`：`setContentOffset()` 方法

**`setContentOffset()`** 方法滚到指定位置，可以带动画。

## 语法

```
setContentOffset(offset)
setContentOffset(offset, { animated })
```

### 参数

**`offset`**

目标位置，[`CGPoint`](../structs.md)，单位是 [pt](../units.md)。运行时也接受普通对象 `{ x: 0, y: 500 }`，但类型定义目前只接受 `CGPoint`，用普通对象时类型检查会报错。

**`options.animated`**

布尔，可以不传。`true` 时平滑地滚过去；不传或 `false` 时立刻跳过去，和直接写 [`contentOffset`](contentoffset.md) 相同。

### 返回值

无（`undefined`）。

带动画时，动画结束派发 [`scrollanimationend`](scrollanimationend-event.md)。动画期间 [`isScrollAnimating`](isscrollanimating.md) 是 `true`。

### 异常

**`TypeError`**

- `offset` 不是对象：`setContentOffset needs an object with all of: x, y`
- 缺少 `x` 或 `y`，或者它不是有限的数：`setContentOffset is missing x, or it is not a finite number`

## 示例

```js
const scroller = new UIScrollView();
scroller.setContentOffset(new CGPoint(0, 500), { animated: true });
scroller.addEventListener('scrollanimationend', () => console.log('到了'));
```

**效果**：内容平滑地滚到向下 500 pt 的位置。动画结束时控制台输出 `到了`。

## 对应的 iOS API

`-[UIScrollView setContentOffset:animated:]`。`animated:` 写成 options 对象的 `animated`。

## 参见

- [`contentOffset`](contentoffset.md)
- [`scrollRectToVisible()`](scrollrecttovisible.md)

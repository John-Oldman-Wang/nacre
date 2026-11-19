---
type: reference
native: "-[UIScrollView scrollRectToVisible:animated:]"
---

# `UIScrollView`：`scrollRectToVisible()` 方法

**`scrollRectToVisible()`** 方法滚动最短的距离，让指定的矩形完整地出现在可视区里。矩形已经完全可见时什么都不做。

## 语法

```
scrollRectToVisible(rect)
scrollRectToVisible(rect, { animated })
```

### 参数

**`rect`**

要显示出来的矩形，[`CGRect`](../structs.md)，单位是 [pt](../units.md)。位置相对于内容区的左上角。子视图是滚动视图的直接子视图时可以直接传它的 `frame`；更深的子视图用 `convertRect()` 换算。

**`options.animated`**

布尔，可以不传。默认 `false`。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- `rect` 不是对象：`scrollRectToVisible needs an object with all of: x, y, width, height`
- 缺少字段，或者字段不是有限的数：`scrollRectToVisible is missing width, or it is not a finite number`

## 示例

```js
const scroller = new UIScrollView();
const column = new UIStackView();
column.axis = 'vertical';
scroller.addSubview(column);
const target = new UILabel();
column.addArrangedSubview(target);

const rect = target.convertRect(target.bounds, { toView: scroller });
scroller.scrollRectToVisible(rect, { animated: true });
```

**效果**：滚动最短的距离，使 `target` 完整地出现在可视区里。**未在模拟器验证。**

## 对应的 iOS API

`-[UIScrollView scrollRectToVisible:animated:]`。

## 参见

- [`setContentOffset()`](setcontentoffset.md)

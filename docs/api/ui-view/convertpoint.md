---
type: reference
native: "-[UIView convertPoint:toView:]"
---

# `UIView`：`convertPoint()` 方法

**`convertPoint()`** 方法把一个点从一个视图的坐标系换算到另一个视图的坐标系。

## 语法

```
convertPoint(point, { toView })
convertPoint(point, { fromView })
```

### 参数

**`point`**

[`CGPoint`](../cg-point.md) 或 `{ x, y }`，单位 [pt](../units.md)。

**`options.toView`**

一个 `UIView`，或者 `null`。`point` 在调用者的坐标系里，换算到 `toView` 的坐标系。`null` 表示窗口的坐标系。

**`options.fromView`**

一个 `UIView`，或者 `null`。`point` 在 `fromView` 的坐标系里，换算到调用者的坐标系。`null` 表示窗口的坐标系。

两个键给一个。

### 返回值

换算后的 `CGPoint`。

### 异常

**`TypeError`**

- `options` 里两个键都没有：`convertPoint needs { toView } or { fromView }`。
- 第一个参数不是对象或缺字段：和[结构体](../structs.md#写入时可以给普通对象)的规则相同，报错以 `convertPoint` 开头。

## 示例

```js
const page = new UIView();
const card = new UIView();
card.frame = new CGRect(40, 120, 200, 120);
page.addSubview(card);
const dot = new UIView();
dot.frame = new CGRect(16, 16, 40, 40);
card.addSubview(dot);

const p = dot.convertPoint(new CGPoint(0, 0), { toView: page });
console.log(p.x, p.y);
const back = dot.convertPoint(new CGPoint(56, 136), { fromView: page });
console.log(back.x, back.y);
```

**结果**：依次输出 `56 136`（40 + 16 和 120 + 16）和 `0 0`。

## 对应的 iOS API

`-[UIView convertPoint:toView:]` 和 `-[UIView convertPoint:fromView:]` 在 JS 里是同一个方法，第二段写成 options 的键。

## 参见

- [`convertRect()`](convertrect.md)
- [`frame`、`bounds` 和 `center`](../ui-view.md#framebounds-和-center)

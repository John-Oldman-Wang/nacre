---
type: reference
native: "-[UIView convertRect:toView:]"
---

# `UIView`：`convertRect()` 方法

**`convertRect()`** 方法把一个矩形从一个视图的坐标系换算到另一个视图的坐标系。

## 语法

```
convertRect(rect, { toView })
convertRect(rect, { fromView })
```

### 参数

**`rect`**

[`CGRect`](../cg-rect.md) 或 `{ x, y, width, height }`，单位 [pt](../units.md)。

**`options.toView`**

一个 `UIView`，或者 `null`。`rect` 在调用者的坐标系里，换算到 `toView` 的坐标系。`null` 表示窗口的坐标系。

**`options.fromView`**

一个 `UIView`，或者 `null`。`rect` 在 `fromView` 的坐标系里，换算到调用者的坐标系。`null` 表示窗口的坐标系。

两个键给一个。

### 返回值

换算后的 `CGRect`。

### 异常

**`TypeError`**

- `options` 里两个键都没有：`convertRect needs { toView } or { fromView }`。
- 第一个参数不是对象或缺字段：和[结构体](../structs.md#写入时可以给普通对象)的规则相同，报错以 `convertRect` 开头。

## 示例

```js
const page = new UIView();
const card = new UIView();
card.frame = new CGRect(40, 120, 200, 120);
page.addSubview(card);
const dot = new UIView();
dot.frame = new CGRect(16, 16, 40, 40);
card.addSubview(dot);

const r = dot.convertRect(dot.bounds, { toView: page });
console.log(String(r));
```

**结果**：输出 `CGRect(56, 136, 40, 40)`。**未在模拟器验证。**

## 对应的 iOS API

`-[UIView convertRect:toView:]` 和 `-[UIView convertRect:fromView:]` 在 JS 里是同一个方法，第二段写成 options 的键。

## 参见

- [`convertPoint()`](convertpoint.md)
- [`frame`、`bounds` 和 `center`](../ui-view.md#framebounds-和-center)

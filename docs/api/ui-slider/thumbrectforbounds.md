---
type: reference
native: "-[UISlider thumbRectForBounds:trackRect:value:]"
---

# `UISlider`：`thumbRectForBounds()` 方法

**`thumbRectForBounds()`** 方法返回值是某个数时，圆钮画在滑块里的哪个位置。

用处是把别的视图对到圆钮上，比如拖动时跟着圆钮走的数值气泡。

## 语法

```
thumbRectForBounds(bounds, { trackRect, value })
```

### 参数

**`bounds`**

一个矩形：[`CGRect`](../structs.md)，或者带 `x`、`y`、`width`、`height` 四个数的对象。一般传 `slider.bounds`。单位 [pt](../units.md)。

**`options.trackRect`**

必填。轨道的矩形，传 [`trackRectForBounds()`](trackrectforbounds.md) 的结果。

**`options.value`**

必填。要问的那个值，数，按 `Number()` 转换。一般传 `slider.value`。

### 返回值

一个 [`CGRect`](../structs.md)，在滑块自己的坐标系里，单位 pt。

实测一条 300 × 34 pt、范围 0 到 1、没有两头图标的滑块：值是 0 时圆钮是 `(0, 5, 37, 24)`，值是 1 时是 `(263, 5, 37, 24)`。值越大，圆钮越靠右。

### 异常

**`TypeError`**

- 没有传 `trackRect`：`thumbRectForBounds needs { trackRect }`。
- 没有传 `value`：`thumbRectForBounds needs { value }`。
- `bounds` 不是对象：`thumbRectForBounds needs an object with all of: x, y, width, height`。
- `trackRect` 不是对象：`trackRect needs an object with all of: x, y, width, height`。
- `value` 转不成有限数：`value must be a finite number, got …`。

## 示例

```js
const slider = new UISlider();
const bounds = { x: 0, y: 0, width: 300, height: 34 };
const track = slider.trackRectForBounds(bounds);
const thumb = slider.thumbRectForBounds(bounds, { trackRect: track, value: 1 });
console.log(thumb.x, thumb.width);
```

**结果**：输出 `263 37`。

## 对应的 iOS API

`-[UISlider thumbRectForBounds:trackRect:value:]`。后两段写成 options 的键。

## 参见

- [`trackRectForBounds()`](trackrectforbounds.md)
- [让一个气泡跟着圆钮走](../../guides/switches-sliders-steppers.md#让一个气泡跟着圆钮走)

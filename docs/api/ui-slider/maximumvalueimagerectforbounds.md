---
type: reference
native: "-[UISlider maximumValueImageRectForBounds:]"
---

# `UISlider`：`maximumValueImageRectForBounds()` 方法

**`maximumValueImageRectForBounds()`** 方法返回滑块在给定的范围里，右头那张图（[`maximumValueImage`](maximumvalueimage.md)）画在哪个位置。

用处是把别的视图对齐到滑块的某一部分上。

## 语法

```
maximumValueImageRectForBounds(bounds)
```

### 参数

**`bounds`**

一个矩形：[`CGRect`](../structs.md)，或者带 `x`、`y`、`width`、`height` 四个数的对象。一般传 `slider.bounds`。单位 [pt](../units.md)。

### 返回值

一个 [`CGRect`](../structs.md)，在滑块自己的坐标系里，单位 pt。没设图时宽和高都是 0（实测）。

### 异常

**`TypeError`**

- `bounds` 不是对象：`maximumValueImageRectForBounds needs an object with all of: x, y, width, height`。
- 缺某个字段，或者字段不是有限数：`maximumValueImageRectForBounds is missing width, or it is not a finite number`（字段名按实际缺的那个）。

## 示例

```js
const slider = new UISlider();
const rect = slider.maximumValueImageRectForBounds({ x: 0, y: 0, width: 300, height: 34 });
console.log(rect.x, rect.y, rect.width, rect.height);
```

**结果**：输出这一部分的位置和大小。

## 对应的 iOS API

`-[UISlider maximumValueImageRectForBounds:]`。

## 参见

- [`thumbRectForBounds()`](thumbrectforbounds.md)：圆钮的位置
- [结构体](../structs.md)：`CGRect`

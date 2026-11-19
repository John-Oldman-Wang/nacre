---
type: reference
native: "-[UISlider minimumTrackImageForState:]"
---

# `UISlider`：`minimumTrackImageForState()` 方法

**`minimumTrackImageForState()`** 方法返回滑块在某个状态下圆钮左边那一段轨道使用的图。

## 语法

```
minimumTrackImageForState(state)
```

### 参数

**`state`**

一个状态名，字符串：`'normal'`、`'highlighted'`、`'disabled'`、`'selected'`、`'focused'` 之一。只能传一个，不能传数组。

### 返回值

[`UIImage`](../ui-image.md)，或者 `null`。

- 返回的是用 [`setMinimumTrackImage()`](setminimumtrackimage.md) 设进去的那个对象。
- 这个状态没有单独设过时，返回 `normal` 状态的那一张（实测）。
- `normal` 也没设过时返回 `null`。新建的滑块对所有状态都返回 `null`。

### 异常

**`TypeError`**

`state` 不是上面的状态名之一。

## 示例

```js
const slider = new UISlider();
const star = UIImage.systemImageNamed('star.fill');
const circle = UIImage.systemImageNamed('circle.fill');
slider.setMinimumTrackImage(star, { forState: ['normal'] });
slider.setMinimumTrackImage(circle, { forState: ['highlighted'] });

console.log(slider.minimumTrackImageForState('normal') === star);
console.log(slider.minimumTrackImageForState('highlighted') === circle);
console.log(slider.minimumTrackImageForState('disabled') === star);
```

**结果**：输出三次 `true`。`disabled` 没有单独设过，返回 `normal` 的那张。

## 对应的 iOS API

`-[UISlider minimumTrackImageForState:]`。

## 参见

- [`setMinimumTrackImage()`](setminimumtrackimage.md)
- [`currentMinimumTrackImage`](currentminimumtrackimage.md)

---
type: reference
native: "-[UISlider maximumTrackImageForState:]"
---

# `UISlider`：`maximumTrackImageForState()` 方法

**`maximumTrackImageForState()`** 方法返回滑块在某个状态下圆钮右边那一段轨道使用的图。

## 语法

```
maximumTrackImageForState(state)
```

### 参数

**`state`**

一个状态名，字符串：`'normal'`、`'highlighted'`、`'disabled'`、`'selected'`、`'focused'` 之一。只能传一个，不能传数组。

### 返回值

[`UIImage`](../ui-image.md)，或者 `null`。

- 返回的是用 [`setMaximumTrackImage()`](setmaximumtrackimage.md) 设进去的那个对象。
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
slider.setMaximumTrackImage(star, { forState: ['normal'] });
slider.setMaximumTrackImage(circle, { forState: ['highlighted'] });

console.log(slider.maximumTrackImageForState('normal') === star);
console.log(slider.maximumTrackImageForState('highlighted') === circle);
console.log(slider.maximumTrackImageForState('disabled') === star);
```

**结果**：输出三次 `true`。`disabled` 没有单独设过，返回 `normal` 的那张。

## 对应的 iOS API

`-[UISlider maximumTrackImageForState:]`。

## 参见

- [`setMaximumTrackImage()`](setmaximumtrackimage.md)
- [`currentMaximumTrackImage`](currentmaximumtrackimage.md)

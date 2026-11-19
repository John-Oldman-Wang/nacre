---
type: reference
native: "-[UISlider thumbImageForState:]"
---

# `UISlider`：`thumbImageForState()` 方法

**`thumbImageForState()`** 方法返回滑块在某个状态下圆钮使用的图。

## 语法

```
thumbImageForState(state)
```

### 参数

**`state`**

一个状态名，字符串：`'normal'`、`'highlighted'`、`'disabled'`、`'selected'`、`'focused'` 之一。只能传一个，不能传数组。

### 返回值

[`UIImage`](../ui-image.md)，或者 `null`。

- 返回的是用 [`setThumbImage()`](setthumbimage.md) 设进去的那个对象。
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
slider.setThumbImage(star, { forState: ['normal'] });
slider.setThumbImage(circle, { forState: ['highlighted'] });

console.log(slider.thumbImageForState('normal') === star);
console.log(slider.thumbImageForState('highlighted') === circle);
console.log(slider.thumbImageForState('disabled') === star);
```

**结果**：输出三次 `true`。`disabled` 没有单独设过，返回 `normal` 的那张。

## 对应的 iOS API

`-[UISlider thumbImageForState:]`。

## 参见

- [`setThumbImage()`](setthumbimage.md)
- [`currentThumbImage`](currentthumbimage.md)

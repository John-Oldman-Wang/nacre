---
type: reference
native: "-[UISlider setThumbImage:forState:]"
---

# `UISlider`：`setThumbImage()` 方法

**`setThumbImage()`** 方法给滑块的一个或几个[状态](../ui-control.md#状态)设圆钮的图，替换系统画的样子。

## 语法

```
setThumbImage(image, { forState })
```

### 参数

**`image`**

[`UIImage`](../ui-image.md)，或者 `null`。`null` 去掉这几个状态的图。

**`options.forState`**

状态名的数组，必填。一般写 `['normal']`：没有单独设过的状态使用 `normal` 的那张。状态名是 `'normal'`、`'highlighted'`（手指按着）、`'disabled'`、`'selected'`、`'focused'`，见[状态](../ui-control.md#状态)。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- 没有传 `forState`：`setThumbImage needs { forState }`。
- `forState` 里有不认识的状态名：`forState has no value "pressed"; expected one of: normal / highlighted / disabled / selected / focused`。
- `image` 不是 `UIImage` 也不是 `null`：`setThumbImage needs a UIImage or null`。

## 示例

```js
const slider = new UISlider();
const dot = UIImage.systemImageNamed('circle.fill');
slider.setThumbImage(dot, { forState: ['normal'] });
console.log(slider.thumbImageForState('normal') === dot);
console.log(slider.thumbImageForState('highlighted') === dot);
```

**效果**

- 输出两次 `true`：`highlighted` 没有单独设过，使用 `normal` 的那张。
- 圆钮显示成这张图。**未在模拟器验证。**

## 对应的 iOS API

`-[UISlider setThumbImage:forState:]`。状态在 ObjC 里是位掩码，这里写成数组。

## 参见

- [`thumbImageForState()`](thumbimageforstate.md)：读某个状态的图
- [`currentThumbImage`](currentthumbimage.md)：当前状态用的图
- [`setMinimumTrackImage()`](setminimumtrackimage.md)、[`setMaximumTrackImage()`](setmaximumtrackimage.md)

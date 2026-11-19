---
type: reference
native: UISlider.currentThumbImage
---

# `UISlider`：`currentThumbImage` 属性

**`currentThumbImage`** 属性是滑块按当前[状态](../ui-control.md#状态)使用的圆钮的图。

## 值

[`UIImage`](../ui-image.md)，或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 没有用 [`setThumbImage()`](setthumbimage.md) 换过图时是 `null`，表示使用系统画的样子。
- 设过圆钮的图之后，读到什么**未在模拟器验证**：实测没有放进窗口的滑块读到的仍然是 `null`，也有读到设进去的那张的时候。要知道设的是哪张，用 [`thumbImageForState()`](thumbimageforstate.md)。

它跟着状态变化，没有单独的变化通知。

## 示例

```js
const slider = new UISlider();
console.log(slider.currentThumbImage);
```

**结果**：输出 `null`。没有换过圆钮的图。

## 对应的 iOS API

`UISlider.currentThumbImage`。

## 参见

- [`setThumbImage()`](setthumbimage.md)
- [`thumbImageForState()`](thumbimageforstate.md)

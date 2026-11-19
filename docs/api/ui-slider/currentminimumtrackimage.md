---
type: reference
native: UISlider.currentMinimumTrackImage
---

# `UISlider`：`currentMinimumTrackImage` 属性

**`currentMinimumTrackImage`** 属性是滑块按当前[状态](../ui-control.md#状态)使用的圆钮左边那一段轨道的图。

## 值

[`UIImage`](../ui-image.md)，或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 没有用 [`setMinimumTrackImage()`](setminimumtrackimage.md) 换过图时是 `null`，表示使用系统画的样子。
- 设过图之后，读到的是当前状态对应的那张（实测）。

它跟着状态变化，没有单独的变化通知。

## 示例

```js
const slider = new UISlider();
const bar = UIImage.systemImageNamed('minus');
slider.setMinimumTrackImage(bar, { forState: ['normal'] });
console.log(slider.currentMinimumTrackImage === bar);
```

**结果**：输出 `true`。

## 对应的 iOS API

`UISlider.currentMinimumTrackImage`。

## 参见

- [`setMinimumTrackImage()`](setminimumtrackimage.md)
- [`minimumTrackImageForState()`](minimumtrackimageforstate.md)

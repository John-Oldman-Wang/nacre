---
type: reference
native: UISlider.maximumValueImage
---

# `UISlider`：`maximumValueImage` 属性

**`maximumValueImage`** 属性是画在轨道右头外面的一张图，比如音量滑块右头的喇叭。

## 值

[`UIImage`](../ui-image.md)，或者 `null`。

- 可读，可写。
- 默认值是 `null`，没有图。
- 写进去的对象原样读回来：读到的和写入的是同一个 `UIImage`。
- 写 `null` 去掉图。
- 设了图之后轨道变短，给图让出位置。图的位置用 [`maximumValueImageRectForBounds()`](maximumvalueimagerectforbounds.md) 读。**轨道变短未在模拟器验证。**

这个属性没有变化通知，只有你的代码会改它。

### 写错时

写入的不是 `UIImage` 也不是 `null`（比如图标的名字字符串、一个 `UIColor`）时抛 `TypeError`，属性保持原来的图：

```
TypeError: maximumValueImage needs a UIImage or null
```

## 示例

```js
const slider = new UISlider();
slider.maximumValueImage = UIImage.systemImageNamed('speaker.wave.3.fill');
```

**效果**：轨道右头外面是一个带声波的喇叭，轨道相应变短。**未在模拟器验证。**

`systemImageNamed()` 取的是 SF Symbols，系统自带的一套图标，见 [`UIImage`](../ui-image.md)。

## 对应的 iOS API

`UISlider.maximumValueImage`。

## 参见

- [`minimumValueImage`](minimumvalueimage.md)
- [`maximumValueImageRectForBounds()`](maximumvalueimagerectforbounds.md)

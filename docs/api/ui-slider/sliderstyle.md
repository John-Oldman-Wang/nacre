---
type: reference
native: UISlider.sliderStyle
---

# `UISlider`：`sliderStyle` 属性

**`sliderStyle`** 属性决定滑块上有没有圆钮。

## 值

字符串，下面两个之一：

| 取值 | 效果 |
| --- | --- |
| `'default'` | 有圆钮 |
| `'thumbless'` | 没有圆钮，只剩一条填了一部分的轨道。一般用来显示播放进度 |

两种取值在屏幕上的样子**未在模拟器验证**。

- 可读，可写。
- 默认值是 `'default'`。

这个属性没有变化通知，只有你的代码会改它。

### 写错时

写入表里没有的值：不抛异常，控制台输出一条警告，属性保持原来的值。

```
[Nacre] sliderStyle has no value "round"; expected one of: default / thumbless, ignored
```

## 示例

```js
const slider = new UISlider();
slider.sliderStyle = 'thumbless';
slider.value = 0.3;
```

**效果**：滑块上没有圆钮，轨道左边约三成是填满的。**未在模拟器验证。**

## 对应的 iOS API

`UISlider.sliderStyle`。`UISliderStyleThumbless` 写成 `'thumbless'`。

## 参见

- [枚举](../enums.md)：属性写错时为什么是警告而不是抛异常

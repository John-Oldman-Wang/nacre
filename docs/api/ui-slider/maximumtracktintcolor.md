---
type: reference
native: UISlider.maximumTrackTintColor
---

# `UISlider`：`maximumTrackTintColor` 属性

**`maximumTrackTintColor`** 属性是滑块圆钮右边那一段轨道的颜色。表示还没选中的那一段。

## 值

颜色字符串，或者 `null`。

- 可读，可写。
- 默认值是 `null`，表示使用系统默认的颜色。
- 写入颜色字符串，读回的是原样的字符串，比如写 'systemGray' 读回 'systemGray'。写法见[颜色](../ui-color.md)。
- 写入 `UIColor` 对象也可以，读回的是颜色名。
- 写 `null` 回到系统默认的颜色。

这个属性没有变化通知，只有你的代码会改它。

### 写错时

写入不合法的颜色：不抛异常，控制台输出一条警告，属性保持原来的值。

```
[Nacre] maximumTrackTintColor: "not-a-color" is not a valid color, ignored
```

写的像一个颜色名（只有字母和数字）时，警告后面还列出全部可用的颜色名。

## 示例

```js
const slider = new UISlider();
slider.maximumTrackTintColor = 'systemGray';
```

**效果**：圆钮右边那一段轨道是灰色。**未在模拟器验证。**

## 对应的 iOS API

`UISlider.maximumTrackTintColor`。

## 参见

- [`minimumTrackTintColor`](minimumtracktintcolor.md)：圆钮左边那一段轨道的颜色
- [颜色](../ui-color.md)

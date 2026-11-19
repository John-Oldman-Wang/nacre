---
type: reference
native: UISwitch.thumbTintColor
---

# `UISwitch`：`thumbTintColor` 属性

**`thumbTintColor`** 属性是开关上圆钮的颜色。

## 值

颜色字符串，或者 `null`。

- 可读，可写。
- 默认值是 `null`，表示使用系统默认的颜色。
- 写入颜色字符串，读回的是原样的字符串，比如写 `'rgba(255, 255, 255, 0.5)'` 读回同样的字符串。写法见[颜色](../ui-color.md)。
- 写入 `UIColor` 对象也可以，读回的是颜色名。
- 写 `null` 回到系统默认的颜色。

这个属性没有变化通知，只有你的代码会改它。

### 写错时

写入不合法的颜色：不抛异常，控制台输出一条警告，属性保持原来的值。

```
[Nacre] thumbTintColor: "not-a-color" is not a valid color, ignored
```

## 示例

```js
const sw = new UISwitch();
sw.thumbTintColor = '#FFCC00';
```

**效果**：圆钮是黄色。**未在模拟器验证。**

## 对应的 iOS API

`UISwitch.thumbTintColor`。

## 参见

- [`onTintColor`](ontintcolor.md)：开着时轨道的颜色
- [颜色](../ui-color.md)

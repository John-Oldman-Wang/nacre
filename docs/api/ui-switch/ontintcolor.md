---
type: reference
native: UISwitch.onTintColor
---

# `UISwitch`：`onTintColor` 属性

**`onTintColor`** 属性是开关开着的时候轨道的颜色。

## 值

颜色字符串，或者 `null`。

- 可读，可写。
- 默认值是 `null`，表示使用系统的绿色。
- 写入颜色字符串，读回的是原样的字符串，比如写 `'#34c759'` 读回 `'#34c759'`。写法见[颜色](../ui-color.md)。
- 写入 `UIColor` 对象也可以，读回的是颜色名，比如写 `UIColor.systemRedColor` 读回 `'systemRed'`。
- 写 `null` 回到系统默认的颜色。
- 关着的时候轨道的颜色不受它影响。

这个属性没有变化通知，只有你的代码会改它。

### 写错时

写入不合法的颜色：不抛异常，控制台输出一条警告，属性保持原来的值。

```
[Nacre] onTintColor: "not-a-color" is not a valid color, ignored
```

写的像一个颜色名（只有字母和数字）时，警告后面还列出全部可用的颜色名。

## 示例

```js
const sw = new UISwitch();
sw.isOn = true;
sw.onTintColor = '#5856D6';
```

**效果**：开关的轨道是紫色。**未在模拟器验证。**

## 对应的 iOS API

`UISwitch.onTintColor`。

## 参见

- [`thumbTintColor`](thumbtintcolor.md)：圆钮的颜色
- [颜色](../ui-color.md)

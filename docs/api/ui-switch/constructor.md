---
type: reference
native: "-[UISwitch init]"
---

# `UISwitch()` 构造函数

**`UISwitch()`** 构造函数创建一个开关。新建的开关是关着的。

## 语法

```
new UISwitch()
```

### 参数

无。

### 返回值

新建的 `UISwitch`。

- [`isOn`](ison.md) 是 `false`。
- [`onTintColor`](ontintcolor.md) 和 [`thumbTintColor`](thumbtintcolor.md) 是 `null`，使用系统的颜色。
- 继承的 `isEnabled` 是 `true`，`state` 是 `['normal']`。

开关的大小由系统决定，写 `frame` 时宽和高不起作用（实测），位置起作用。实测 iOS 27.2 上是 63 × 28 [pt](../units.md)。用 Auto Layout 时只给位置的约束，不要给宽高的约束。

### 异常

无。

不能继承：`class MySwitch extends UISwitch {}` 在 `new MySwitch()` 时抛 `TypeError`，见[原生类](../native-classes.md)。

## 示例

```js
const sw = new UISwitch();
console.log(sw.isOn);
sw.frame = new CGRect(0, 0, 200, 100);
console.log(sw.frame.width);
```

**结果**

- 先输出 `false`。
- 再输出开关原来的宽度，不是 200。

## 对应的 iOS API

`[[UISwitch alloc] init]`。

## 参见

- [`isOn`](ison.md)

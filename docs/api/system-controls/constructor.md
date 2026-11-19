---
type: reference
native: "-[UIColorWell init]"
---

# `UIColorWell()` 构造函数

**`UIColorWell()`** 构造函数创建一个取色控件。

## 语法

```
new UIColorWell()
```

### 参数

无。

### 返回值

新建的 `UIColorWell`，各属性是下面的值（在模拟器上量的）：

| 属性 | 值 |
| --- | --- |
| [`title`](title.md) | `null` |
| [`selectedColor`](selectedcolor.md) | `null` |
| [`supportsAlpha`](supportsalpha.md) | `true` |
| [`supportsEyedropper`](supportseyedropper.md) | `true` |
| [`maximumLinearExposure`](maximumlinearexposure.md) | `0` |

它是 [`UIControl`](../ui-control.md) 和 [`UIView`](../ui-view.md) 的实例。加到页面上之前要给它位置和大小。

### 异常

**`TypeError`**

继承这个类再 `new`：`class X extends UIColorWell {}` 在 `new X()` 时抛，见[原生类](../native-classes.md)。

## 示例

```js
const well = new UIColorWell();
console.log(well instanceof UIControl, well.selectedColor);
```

**结果**：输出 `true null`。

## 对应的 iOS API

`-[UIColorWell init]`。

## 参见

- [`selectedColor`](selectedcolor.md)

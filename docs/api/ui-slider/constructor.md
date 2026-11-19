---
type: reference
native: "-[UISlider init]"
---

# `UISlider()` 构造函数

**`UISlider()`** 构造函数创建一个滑块。

## 语法

```
new UISlider()
```

### 参数

无。

### 返回值

新建的 `UISlider`。它的属性是默认值：

| 属性 | 默认值 |
| --- | --- |
| [`value`](value.md) | 0 |
| [`minimumValue`](minimumvalue.md) | 0 |
| [`maximumValue`](maximumvalue.md) | 1 |
| [`isContinuous`](iscontinuous.md) | `true` |
| [`sliderStyle`](sliderstyle.md) | `'default'` |
| 三个颜色属性 | `null` |
| 两头的图、三张按状态设的图 | `null` |

新滑块的宽是 0，屏幕上看不到。高度由系统决定，实测 iOS 27.2 上是 34 [pt](../units.md)。加到页面上时要给宽度：写 `frame`，或者给宽度的约束，或者放进会拉伸它的纵向 [`UIStackView`](../ui-stack-view.md)。

### 异常

无。

不能继承：`class MySlider extends UISlider {}` 在 `new MySlider()` 时抛 `TypeError`，见[原生类](../native-classes.md)。

## 示例

```js
const slider = new UISlider();
slider.frame = new CGRect(16, 100, 300, 34);
console.log(slider.value, slider.minimumValue, slider.maximumValue);
```

**结果**

- 输出 `0 0 1`。
- 得到一条宽 300 pt 的滑块，圆钮在最左边。**屏幕上的样子未在模拟器验证。**

## 对应的 iOS API

`[[UISlider alloc] init]`。

## 参见

- [`value`](value.md)

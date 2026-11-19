---
type: reference
native: CALayer.cornerCurve
---

# `CALayer`：`cornerCurve` 属性

**`cornerCurve`** 属性是圆角的曲线。

## 值

字符串：

| 取值 | 效果 |
| --- | --- |
| `'circular'` | 圆角是一段正圆弧，和直边相接处曲率突变 |
| `'continuous'` | 圆角的曲率从直边开始逐渐变化，过渡更平滑。iOS 的 App 图标是这种圆角 |

- 可读，可写。
- 默认值是 `'continuous'`（实测）。
- 两种取值画出来的差别**未在模拟器验证**。

### 写错时

写别的值时不抛异常：属性保持原来的值，控制台输出一条警告：

```
[Nacre] cornerCurve has no value "squircle"; expected one of: circular / continuous, ignored
```

## 示例

```js
const layer = new CALayer();
console.log(layer.cornerCurve);
layer.cornerCurve = 'circular';
```

**结果**：控制台输出 `continuous`，之后圆角变成正圆弧。

## 对应的 iOS API

`CALayer.cornerCurve`。`kCACornerCurveContinuous` 写成 `'continuous'`。Apple 的头文件写默认值是 `kCACornerCurveCircular`，实测是 `continuous`。

## 参见

- [`cornerRadius`](cornerradius.md)

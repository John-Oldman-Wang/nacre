---
type: reference
native: "+[CAMediaTimingFunction functionWithName:]"
---

# `CAMediaTimingFunction.functionWithName()` 静态方法

**`CAMediaTimingFunction.functionWithName()`** 静态方法按名字取得一条内置的时间曲线。

## 语法

```
CAMediaTimingFunction.functionWithName(name)
```

### 参数

**`name`**

下面五个字符串之一：

| 名字 | 效果 |
| --- | --- |
| `'linear'` | 匀速 |
| `'easeIn'` | 开始慢，之后加快 |
| `'easeOut'` | 开始快，结束前减慢 |
| `'easeInEaseOut'` | 开始和结束慢，中间快。控制点是 (0.42, 0) 和 (0.58, 1) |
| `'default'` | 开始较快，结束前明显减慢。控制点是 (0.25, 0.1) 和 (0.25, 1) |

`'default'` 和 `'easeInEaseOut'` 是两条不同的曲线。五条曲线画面上的差别**未在模拟器验证**；两组控制点的数值是实测的。

### 返回值

`CAMediaTimingFunction`。

### 异常

**`TypeError`**

名字不认识，报错信息列出全部名字：`functionWithName has no value "bounce"; expected one of: …`。

## 示例

```js
const move = CABasicAnimation.animationWithKeyPath('position');
move.fromValue = new CGPoint(30, 80);
move.toValue = new CGPoint(270, 80);
move.duration = 0.6;
move.timingFunction = CAMediaTimingFunction.functionWithName('easeOut');
```

**效果**：加到图层上之后，图层开始时移动得快，接近终点时慢下来。**未在模拟器验证。**

## 对应的 iOS API

`+[CAMediaTimingFunction functionWithName:]`。`kCAMediaTimingFunctionEaseIn` 写成 `'easeIn'`，`kCAMediaTimingFunctionDefault` 写成 `'default'`，其余同理。

## 参见

- [`functionWithControlPoints()`](functionwithcontrolpoints.md)：自定义曲线

---
type: reference
native: "+[UIBezierPath bezierPathWithRect:]"
---

# `UIBezierPath.bezierPathWithRect()` 静态方法

**`UIBezierPath.bezierPathWithRect()`** 静态方法创建一条矩形路径。

## 语法

```
UIBezierPath.bezierPathWithRect(rect)
```

### 参数

**`rect`**

矩形的位置和大小，`CGRect`，单位是 [pt](../units.md)。也可以写成字段相同的普通对象 `{ x, y, width, height }`，见[结构体](../structs.md)。

### 返回值

新建的 `UIBezierPath`。它的 [`bounds`](bounds.md) 就是 `rect`。

### 异常

**`TypeError`**

- `rect` 不是对象：`bezierPathWithRect needs an object with all of: x, y, width, height`。
- 某个字段缺失或转不成有限数：`bezierPathWithRect is missing width, or it is not a finite number`（`width` 换成实际缺的那个字段）。

## 示例

```js
const rect = UIBezierPath.bezierPathWithRect(new CGRect(10, 20, 30, 40));
console.log(String(rect.bounds));
```

**结果**：控制台输出 `CGRect(10, 20, 30, 40)`。路径是左上角在 (10, 20)、30 × 40 pt 的矩形。

## 对应的 iOS API

`+[UIBezierPath bezierPathWithRect:]`。

## 参见

- [`bezierPathWithRoundedRect()`](bezierpathwithroundedrect.md)：圆角矩形
- [`bezierPathWithOvalInRect()`](bezierpathwithovalinrect.md)：矩形的内切椭圆

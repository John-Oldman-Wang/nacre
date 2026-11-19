---
type: reference
native: CGAffineTransformMakeRotation
---

# `CGAffineTransform.rotation()` 静态方法

**`CGAffineTransform.rotation()`** 静态方法创建一个旋转变换。

## 语法

```
CGAffineTransform.rotation(radians)
```

### 参数

**`radians`**

旋转的角度，单位是[弧度](../units.md)，不是度。正值在屏幕上是顺时针。角度换算成弧度：`角度 * Math.PI / 180`。

### 返回值

新的 `CGAffineTransform`：`a` 和 `d` 是 `cos(radians)`，`b` 是 `sin(radians)`，`c` 是 `-sin(radians)`，`tx`、`ty` 是 0。

### 异常

**`TypeError`**

参数转不成有限的数：`a struct field must be a finite number, got …`。

## 示例

```js
const box = new UIView();
box.frame = new CGRect(40, 100, 100, 100);
box.transform = CGAffineTransform.rotation(Math.PI / 6);
```

**效果**：视图绕自己的中心顺时针转 30°。

## 对应的 iOS API

`CGAffineTransformMakeRotation(radians)`。

## 参见

- [`concat()`](concat.md)：旋转和缩放一起用
- [结构体](../structs.md)：所有结构体共同的规则

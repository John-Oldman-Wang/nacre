---
type: reference
native: CATransform3DConcat
---

# `CATransform3D`：`concat()` 方法

**`concat()`** 方法把两个变换组合成一个：先做调用者，再做 `other`。

## 语法

```
concat(other)
```

### 参数

**`other`**

另一个 `CATransform3D`，或者带 `m11` 到 `m44` 全部 16 个字段的普通对象，比如 `{ ...CATransform3D.identity, m34: -1 / 500 }`。

### 返回值

新的 `CATransform3D`。调用者和 `other` 都不变。

### 异常

**`TypeError`**

- `other` 不是对象：`concat needs an object with all of: m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44`。
- `other` 少字段，或者字段转不成有限的数：`concat is missing m12, or it is not a finite number`，中间是缺的字段名。

## 说明

两种顺序得到的结果不同。先平移再缩放时，平移量也被缩放；先缩放再平移时，平移量不受缩放影响。

## 示例

```js
const move = CATransform3D.translation(10, 0, 0);
const grow = CATransform3D.scale(2);

console.log(move.concat(grow).m41);
console.log(grow.concat(move).m41);
```

**结果**

- 第一行输出 `20`：先平移再缩放，平移量也放大了 2 倍。
- 第二行输出 `10`：先缩放再平移。

```js
const card = new CALayer();
card.transform = CATransform3D.rotation(Math.PI / 4, 0, 1, 0)
  .concat({ ...CATransform3D.identity, m34: -1 / 500 });
```

**效果**：图层先绕竖直的中线转 45°，再加上透视，一侧近一侧远。**屏幕上的样子未在模拟器验证。**

## 对应的 iOS API

`CATransform3DConcat(a, b)` 写成 `a.concat(b)`。

## 参见

- [组合的顺序](../ca-transform-3d.md#组合的顺序)
- [`translate()`](translate.md)、[`scale()`](scale.md)、[`rotate()`](rotate.md)：把新的一步加在前面
- [`invert()`](invert.md)
- [结构体](../structs.md)：所有结构体共同的规则

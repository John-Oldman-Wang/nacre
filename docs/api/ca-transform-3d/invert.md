---
type: reference
native: CATransform3DInvert
---

# `CATransform3D`：`invert()` 方法

**`invert()`** 方法返回逆变换：把调用者的效果抵消掉的那个变换。

## 语法

```
invert()
```

### 参数

无。

### 返回值

新的 `CATransform3D`；调用者不可逆时返回 `null`。

不可逆指矩阵的行列式为 0，比如 `CATransform3D.scale(0)`：x、y 方向的倍数是 0。数值上非常接近不可逆的矩阵也可能返回 `null`。返回值可能是 `null`，使用之前先判空。

### 异常

无。

## 示例

```js
const back = CATransform3D.scale(2).invert();
if (back !== null) {
  console.log(back.m11);
}

console.log(CATransform3D.scale(0).invert());
```

**结果**：依次输出 `0.5`、`null`。

```js
const turn = CATransform3D.rotation(0.7, 1, 2, 3);
const undo = turn.invert();
if (undo !== null) {
  const result = turn.concat(undo);
  console.log(Math.abs(result.m11 - 1) < 1e-9);
}
```

**结果**：输出 `true`。一个变换和它的逆变换组合，得到单位矩阵；带小数的结果在末尾几位上可能有误差，比较时留出容差。

## 对应的 iOS API

`CATransform3DInvert(t)`。不可逆时 ObjC 返回 `t` 本身，这里返回 `null`。

## 参见

- [`concat()`](concat.md)
- [结构体](../structs.md)：所有结构体共同的规则

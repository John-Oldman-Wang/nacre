---
type: reference
native: CGAffineTransformInvert
---

# `CGAffineTransform`：`invert()` 方法

**`invert()`** 方法返回逆变换：把调用者的效果抵消掉的那个变换。

## 语法

```
invert()
```

### 参数

无。

### 返回值

新的 `CGAffineTransform`；调用者不可逆时返回 `null`。

不可逆指行列式（`a * d - b * c`）为 0，比如 `CGAffineTransform.scale(0)`。返回值可能是 `null`，使用之前先判空。

### 异常

无。

## 示例

```js
const back = CGAffineTransform.scale(2).invert();
if (back !== null) {
  console.log(back.a);
}

console.log(CGAffineTransform.scale(0).invert());
```

**结果**：依次输出 `0.5`、`null`。

## 对应的 iOS API

`CGAffineTransformInvert(t)`。不可逆时 ObjC 返回 `t` 本身，这里返回 `null`。

## 参见

- [`concat()`](concat.md)
- [结构体](../structs.md)：所有结构体共同的规则

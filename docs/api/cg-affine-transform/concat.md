---
type: reference
native: CGAffineTransformConcat
---

# `CGAffineTransform`：`concat()` 方法

**`concat()`** 方法把两个变换组合成一个：先做调用者，再做 `other`。

## 语法

```
concat(other)
```

### 参数

**`other`**

另一个 `CGAffineTransform`，或者带 `a`、`b`、`c`、`d`、`tx`、`ty` 六个字段的普通对象。

### 返回值

新的 `CGAffineTransform`。调用者和 `other` 都不变。

### 异常

**`TypeError`**

- `other` 不是对象：`concat needs an object with all of: a, b, c, d, tx, ty`。
- `other` 少字段，或者字段转不成有限的数：`concat is missing tx, or it is not a finite number`，中间是缺的字段名。

## 说明

两种顺序得到的结果不同。先缩放再平移时，平移量不受缩放影响；先平移再缩放时，平移量也被缩放。

## 示例

```js
const scale = CGAffineTransform.scale(2);
const move = CGAffineTransform.translation(10, 20);

console.log(scale.concat(move).tx, scale.concat(move).ty);
console.log(move.concat(scale).tx, move.concat(scale).ty);
```

**结果**

- 第一行输出 `10 20`：先缩放再平移。
- 第二行输出 `20 40`：先平移再缩放，平移量也放大了 2 倍。

```js
const box = new UIView();
box.frame = new CGRect(40, 100, 100, 100);
box.transform = CGAffineTransform.scale(1.2)
  .concat(CGAffineTransform.rotation(Math.PI / 6));
```

**效果**：视图放大到 1.2 倍并顺时针旋转 30°。

## 对应的 iOS API

`CGAffineTransformConcat(t1, t2)` 写成 `t1.concat(t2)`。

## 参见

- [`invert()`](invert.md)
- [结构体](../structs.md)：所有结构体共同的规则

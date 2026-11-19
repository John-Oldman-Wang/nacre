---
type: reference
native: CGAffineTransformMakeScale
---

# `CGAffineTransform.scale()` 静态方法

**`CGAffineTransform.scale()`** 静态方法创建一个缩放变换。

## 语法

```
CGAffineTransform.scale(sx[, sy])
```

### 参数

**`sx`**

横向的倍数，比例，`1` 表示不变。

**`sy`**

纵向的倍数。不给时和 `sx` 相同。

### 返回值

新的 `CGAffineTransform`：`a` 是 `sx`，`d` 是 `sy`，其余是 0。

### 异常

**`TypeError`**

参数转不成有限的数：`a struct field must be a finite number, got …`，末尾是收到的值。

## 示例

```js
const box = new UIView();
box.frame = new CGRect(40, 100, 100, 100);
box.transform = CGAffineTransform.scale(1.2);
```

**效果**：视图以中心为基准放大到 1.2 倍。每次给 `transform` 赋值替换之前的变换，不累加。

## 对应的 iOS API

`CGAffineTransformMakeScale(sx, sy)`。ObjC 里两个参数都要给，这里只给一个时两个方向相同。

## 参见

- [`concat()`](concat.md)：和别的变换组合
- [结构体](../structs.md)：所有结构体共同的规则

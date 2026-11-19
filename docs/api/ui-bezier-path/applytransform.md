---
type: reference
native: "-[UIBezierPath applyTransform:]"
---

# `UIBezierPath`：`applyTransform()` 方法

**`applyTransform()`** 方法对路径的所有点做一次仿射变换：移动、缩放或旋转。它直接修改这条路径，不返回新路径。

## 语法

```
applyTransform(transform)
```

### 参数

**`transform`**

`CGAffineTransform`，用 `CGAffineTransform.translation()`、`CGAffineTransform.scale()`、`CGAffineTransform.rotation()` 创建，见[结构体](../structs.md)。也可以写成字段相同的普通对象 `{ a, b, c, d, tx, ty }`。

缩放和旋转都以坐标原点 (0, 0) 为中心，不是以路径的中心。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- `transform` 不是对象：`applyTransform needs an object with all of: a, b, c, d, tx, ty`。
- 某个字段缺失或转不成有限数：`applyTransform is missing tx, or it is not a finite number`（`tx` 换成实际缺的那个字段）。

## 示例

```js
const box = UIBezierPath.bezierPathWithRect(new CGRect(0, 0, 100, 100));
box.applyTransform(CGAffineTransform.translation(10, 0));
console.log(box.bounds.x);
```

**结果**：控制台输出 `10`。矩形整体向右移了 10 pt。

## 对应的 iOS API

`-[UIBezierPath applyTransform:]`。

## 参见

- [结构体](../structs.md)：`CGAffineTransform`

---
type: reference
native: +[CATransaction flush]
---

# `CATransaction.flush()` 静态方法

**`CATransaction.flush()`** 静态方法把已经做的图层修改立刻交给系统，不等当前这段代码执行完。

平时不需要调：当前这段代码执行完之后，修改会自动交给系统。

## 语法

```
CATransaction.flush()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

无。

## 示例

```js
const dot = new CALayer();
dot.opacity = 0.5;
CATransaction.flush();
```

**效果**：对 `opacity` 的修改立刻交给系统。**效果未在模拟器验证。**

## 对应的 iOS API

`+[CATransaction flush]`。

## 参见

- [`commit()`](commit.md)

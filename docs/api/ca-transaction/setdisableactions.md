---
type: reference
native: "+[CATransaction setDisableActions:]"
---

# `CATransaction.setDisableActions()` 静态方法

**`CATransaction.setDisableActions()`** 静态方法关闭或打开当前事务的隐式动画。

## 语法

```
CATransaction.setDisableActions(value)
```

### 参数

**`value`**

布尔，按 `Boolean()` 转换。`true` 关闭当前事务的隐式动画，修改立刻生效；`false` 打开。

### 返回值

无（`undefined`）。

### 异常

无。

## 说明

- 只对当前事务里的修改有效，`commit()` 之后恢复。
- 只影响隐式动画。用 `addAnimation()` 加的动画照常播放。

## 示例

```js
const shape = new CAShapeLayer();

CATransaction.begin();
CATransaction.setDisableActions(true);
shape.strokeEnd = 1;
CATransaction.commit();
```

**效果**：`strokeEnd` 立刻变成 1，图层上没有新增动画。

## 对应的 iOS API

`+[CATransaction setDisableActions:]`。

## 参见

- [`disableActions()`](disableactions.md)
- [关掉隐式动画](../../guides/animation.md#关掉隐式动画)

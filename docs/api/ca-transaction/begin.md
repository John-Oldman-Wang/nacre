---
type: reference
native: +[CATransaction begin]
---

# `CATransaction.begin()` 静态方法

**`CATransaction.begin()`** 静态方法开始一个事务。之后对事务的设置只对这个事务里的修改有效，直到对应的 [`commit()`](commit.md)。

## 语法

```
CATransaction.begin()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

无。

## 说明

- `begin()` 和 `commit()` 成对出现。
- 事务可以嵌套。里层没有设置的项，沿用外层的。**嵌套未在模拟器验证。**

## 示例

```js
const dot = new CALayer();

CATransaction.begin();
CATransaction.setDisableActions(true);
dot.position = new CGPoint(150, 80);
dot.opacity = 0.5;
CATransaction.commit();
```

**效果**：图层立刻出现在新位置，变成半透明，没有过渡过程。

## 对应的 iOS API

`+[CATransaction begin]`。

## 参见

- [`commit()`](commit.md)

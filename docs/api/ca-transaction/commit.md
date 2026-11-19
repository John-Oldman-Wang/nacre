---
type: reference
native: +[CATransaction commit]
---

# `CATransaction.commit()` 静态方法

**`CATransaction.commit()`** 静态方法结束最近一次 [`begin()`](begin.md) 开始的那个事务。

## 语法

```
CATransaction.commit()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

没有调 `begin()` 就调 `commit()` 的结果**未在模拟器验证**。

## 说明

- `commit()` 之后，这个事务里的设置失效，恢复原状：[`disableActions()`](disableactions.md) 回到 `false`。

## 示例

```js
CATransaction.begin();
CATransaction.setDisableActions(true);
console.log(CATransaction.disableActions());
CATransaction.commit();
console.log(CATransaction.disableActions());
```

**结果**：先输出 `true`，再输出 `false`。

## 对应的 iOS API

`+[CATransaction commit]`。

## 参见

- [`begin()`](begin.md)

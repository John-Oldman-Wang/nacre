---
type: reference
native: +[CATransaction disableActions]
---

# `CATransaction.disableActions()` 静态方法

**`CATransaction.disableActions()`** 静态方法返回当前事务是否关闭了隐式动画。

## 语法

```
CATransaction.disableActions()
```

### 参数

无。

### 返回值

布尔。`true` 表示当前事务关闭了隐式动画，`false` 表示没有。不在任何事务里、或者 `commit()` 之后是 `false`。

### 异常

无。

## 示例

```js
CATransaction.begin();
CATransaction.setDisableActions(true);
console.log(CATransaction.disableActions());
CATransaction.commit();
```

**结果**：控制台输出 `true`。

## 对应的 iOS API

`+[CATransaction disableActions]`。

## 参见

- [`setDisableActions()`](setdisableactions.md)

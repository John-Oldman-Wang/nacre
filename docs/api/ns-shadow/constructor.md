---
type: reference
native: "-[NSShadow init]"
---

# `NSShadow()` 构造函数

**`NSShadow()`** 构造函数创建一个文字阴影。

## 语法

```
new NSShadow()
```

### 参数

无。

### 返回值

新建的 `NSShadow`：[`shadowOffset`](shadowoffset.md) 是 `(0, 0)`，[`shadowBlurRadius`](shadowblurradius.md) 是 `0`，[`shadowColor`](shadowcolor.md) 是三分之一不透明的黑色。

### 异常

不能继承，`class X extends NSShadow {}` 在 `new X()` 时抛 `TypeError`，见[原生类](../native-classes.md)。

## 示例

```js
const shadow = new NSShadow();
console.log(shadow.shadowOffset.width, shadow.shadowOffset.height, shadow.shadowBlurRadius);
```

**结果**：控制台输出 `0 0 0`。

## 对应的 iOS API

`[[NSShadow alloc] init]`。

## 参见

- [`NSShadow`](../ns-shadow.md)

---
type: reference
native: "-[CAShapeLayer init]"
---

# `CAShapeLayer()` 构造函数

**`CAShapeLayer()`** 构造函数创建一个形状图层。

## 语法

```
new CAShapeLayer()
```

### 参数

无。

### 返回值

新建的 `CAShapeLayer`：`frame` 是 `(0, 0, 0, 0)`，[`path`](path.md) 是 `null`，[`fillColor`](fillcolor.md) 是不透明的黑色，[`strokeColor`](strokecolor.md) 是 `null`。

### 异常

**`TypeError`**

不能被继承，见[原生类](../native-classes.md)。

## 示例

```js
const shape = new CAShapeLayer();
console.log(shape.path, shape.fillColor, shape.strokeColor);
```

**结果**：控制台输出 `null #000000 null`。

## 对应的 iOS API

`[CAShapeLayer layer]`。

## 参见

- [`path`](path.md)

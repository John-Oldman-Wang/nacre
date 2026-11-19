---
type: reference
native: "-[CALayer insertSublayer:atIndex:]"
---

# `CALayer`：`insertSublayer()` 方法

**`insertSublayer()`** 方法把一个图层插到子图层里的指定位置。

## 语法

```
insertSublayer(layer, { atIndex })
insertSublayer(layer, { above })
insertSublayer(layer, { below })
```

### 参数

**`layer`**

要插入的图层。

**`options.atIndex`**

插到 [`sublayers`](sublayers.md) 的第几位，整数。0 是最下面。

**`options.above`**

一个已有的子图层。插到它的上面，紧挨着它。

**`options.below`**

一个已有的子图层。插到它的下面，紧挨着它。

三个选项给一个。

### 返回值

无（`undefined`）。

对一个已经在 `sublayers` 里的图层再调 `insertSublayer()`，是把它移到新位置，不会多出一份。

### 异常

**`TypeError`**

- 三种都没给：`insertSublayer needs one of { atIndex } / { above } / { below }`。
- `layer` 不是图层：`insertSublayer: expects a CALayer`。
- `above` 或 `below` 给的不是图层：`insertSublayer: expects two CALayers`。
- `atIndex` 是负数：`insertSublayer:atIndex: index must not be negative`。
- `atIndex` 转换不出有限数：`atIndex must be a finite number, got …`。

## 示例

```js
const host = new CALayer();
const a = new CALayer();
const b = new CALayer();
const c = new CALayer();

host.addSublayer(a);                    // [a]
host.addSublayer(b);                    // [a, b]，b 在 a 上面
host.insertSublayer(c, { atIndex: 0 }); // [c, a, b]，c 在最下面
host.insertSublayer(c, { above: b });   // [a, b, c]，c 移到 b 上面
host.insertSublayer(c, { below: a });   // [c, a, b]，c 移到 a 下面
```

**结果**：每行注释里是这一行执行之后 `host.sublayers` 的内容。数组里靠后的图层画在上面。

## 对应的 iOS API

`-[CALayer insertSublayer:atIndex:]`、`-insertSublayer:above:`、`-insertSublayer:below:`。第二段放进 options 对象。

## 参见

- [`addSublayer()`](addsublayer.md)
- [`zPosition`](zposition.md)：不改数组顺序也能改上下顺序

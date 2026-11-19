---
type: reference
native: "-[CALayer init]"
---

# `CALayer()` 构造函数

**`CALayer()`** 构造函数创建一个图层。

每个视图都有一个由系统创建的图层，用 `view.layer` 读，不用 `new`。渐变、形状这类视图没有对应属性的内容，才用 `new` 创建图层，再加到某个视图的图层下面。

## 语法

```
new CALayer()
```

### 参数

无。

### 返回值

新建的 `CALayer`：[`frame`](frame.md) 是 `(0, 0, 0, 0)`，没有父图层，没有子图层。

要设了 `frame` 并加到一个已经在屏幕上的图层下面才看得见。加到父图层下面之后由父图层保管，代码里不需要另外保存它。

### 异常

**`TypeError`**

不能被继承，`class X extends CALayer {}` 在 `new X()` 时抛，见[原生类](../native-classes.md)。

## 示例

```js
const card = new UIView();
const badge = new CALayer();
badge.frame = new CGRect(20, 20, 40, 40);
badge.backgroundColor = 'systemRed';
card.layer.addSublayer(badge);
console.log(badge.superlayer === card.layer);
```

**结果**：控制台输出 `true`。卡片左上方有一个 40 × 40 pt 的红色方块。

## 对应的 iOS API

`[CALayer layer]`、`[[CALayer alloc] init]`。

## 参见

- [图层从哪里来](../ca-layer.md#图层从哪里来)
- [`addSublayer()`](addsublayer.md)

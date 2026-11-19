---
type: reference
native: "-[UIToolbar init]"
---

# `UIToolbar()` 构造函数

**`UIToolbar()`** 构造函数创建一条空的工具条。

## 语法

```
new UIToolbar()
```

### 参数

无。

### 返回值

新建的 `UIToolbar`。`frame` 是 0 × 0，[`items`](items.md) 是空数组。它自己想要的高度是 48 pt，见[大小](../ui-toolbar.md#大小)。

### 异常

**`TypeError`**

`UIToolbar` 不能被继承，`class X extends UIToolbar` 在 `new X()` 时抛，见[原生类](../native-classes.md#不能继承)。

## 示例

```js
const toolbar = new UIToolbar();
console.log(toolbar.items.length);
console.log(toolbar.intrinsicContentSize.height);
```

**结果**：依次输出 `0`、`48`。

## 对应的 iOS API

`[[UIToolbar alloc] init]`。

## 参见

- [`items`](items.md)：往工具条里放按钮

---
type: reference
native: "-[UISearchBar init]"
---

# `UISearchBar()` 构造函数

**`UISearchBar()`** 构造函数创建一个搜索框。

## 语法

```
new UISearchBar()
```

### 参数

无。

### 返回值

新建的 `UISearchBar`。`frame` 是 0 × 0，[`text`](text.md) 是空串。它自己想要的高度是 64 pt，见[大小](../ui-search-bar.md#大小)。

### 异常

**`TypeError`**

`UISearchBar` 不能被继承，`class X extends UISearchBar` 在 `new X()` 时抛，见[原生类](../native-classes.md#不能继承)。

## 示例

```js
const search = new UISearchBar();
console.log(JSON.stringify(search.text));
console.log(search.intrinsicContentSize.height);
```

**结果**：依次输出 `""`、`64`。

## 对应的 iOS API

`[[UISearchBar alloc] init]`。

## 参见

- [大小](../ui-search-bar.md#大小)：新建的搜索框为什么看不见

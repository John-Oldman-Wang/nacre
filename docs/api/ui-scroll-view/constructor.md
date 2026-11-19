---
type: reference
native: "-[UIScrollView init]"
---

# `UIScrollView()` 构造函数

**`UIScrollView()`** 构造函数创建一个滚动视图。

## 语法

```
new UIScrollView()
```

### 参数

无。

### 返回值

新建的 `UIScrollView`。大小是 0，内容区也是 0，位置和大小要用约束或 `frame` 确定。

### 异常

**`TypeError`**

`UIScrollView` 不能被继承，`class X extends UIScrollView {}` 在 `new X()` 时抛，见[原生类](../native-classes.md#不能继承)。

## 示例

```js
const scroller = new UIScrollView();
console.log(scroller.contentSize.width, scroller.contentSize.height);
```

**结果**：输出 `0 0`。

## 对应的 iOS API

`[[UIScrollView alloc] init]`。

## 参见

- [做一个能滚动的页面](../../guides/scrolling.md)

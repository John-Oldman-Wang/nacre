---
type: reference
native: "-[UIImageView init]"
---

# `UIImageView()` 构造函数

**`UIImageView()`** 构造函数创建一个没有图片的图片视图。

## 语法

```
new UIImageView()
```

### 参数

无。

### 返回值

新建的 `UIImageView`。[`image`](image.md) 是 `null`，位置是 `(0, 0)`，宽高是 0。

用约束定位时不用给宽高，视图和图片一样大；用 `frame` 定位时要给宽高，否则看不到图片，见[图片视图的大小](../ui-image-view.md#图片视图的大小)。

### 异常

**`TypeError`**

`UIImageView` 不能被继承，`class X extends UIImageView {}` 之后 `new X()` 抛异常，见[原生类](../native-classes.md)。

## 示例

```js
const avatar = new UIImageView();
console.log(avatar.image);
```

**结果**：控制台输出 `null`。

## 对应的 iOS API

`[[UIImageView alloc] init]`。

## 参见

- [`image`](image.md)

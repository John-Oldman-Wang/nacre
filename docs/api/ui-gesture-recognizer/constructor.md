---
type: reference
native: "-[UIGestureRecognizer init]"
---

# `UIGestureRecognizer()` 构造函数

**`UIGestureRecognizer()`** 构造函数不能直接调用。`UIGestureRecognizer` 是所有识别器的父类，它自己不识别任何手势；要创建识别器，用它的七个子类之一。

## 语法

```
new UIGestureRecognizer()
```

### 参数

无。

### 返回值

不返回，总是抛异常。

### 异常

**`TypeError`**

直接调用时抛：

```
Illegal constructor: UIGestureRecognizer is abstract; construct one of its subclasses instead: UITapGestureRecognizer, UILongPressGestureRecognizer, UIPanGestureRecognizer, UIPinchGestureRecognizer, UIRotationGestureRecognizer, UISwipeGestureRecognizer, UIScreenEdgePanGestureRecognizer
```

## 示例

```js
try {
  new UIGestureRecognizer();
} catch (err) {
  console.log(err instanceof TypeError);
}
const tap = new UITapGestureRecognizer();
```

**结果**：输出 `true`。`tap` 是一个能用的点按识别器。

## 对应的 iOS API

`-[UIGestureRecognizer initWithTarget:action:]`。原生可以直接创建基类，但基类不识别任何手势，所以这里不提供。

## 参见

- [`UITapGestureRecognizer()`](../ui-tap-gesture-recognizer/constructor.md)、[`UILongPressGestureRecognizer()`](../ui-long-press-gesture-recognizer/constructor.md)、[`UIPanGestureRecognizer()`](../ui-pan-gesture-recognizer/constructor.md)、[`UIPinchGestureRecognizer()`](../ui-pinch-gesture-recognizer/constructor.md)、[`UIRotationGestureRecognizer()`](../ui-rotation-gesture-recognizer/constructor.md)、[`UISwipeGestureRecognizer()`](../ui-swipe-gesture-recognizer/constructor.md)、[`UIScreenEdgePanGestureRecognizer()`](../ui-screen-edge-pan-gesture-recognizer/constructor.md)

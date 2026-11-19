---
type: reference
native: "-[UIScreenEdgePanGestureRecognizer init]"
---

# `UIScreenEdgePanGestureRecognizer()` 构造函数

**`UIScreenEdgePanGestureRecognizer()`** 构造函数创建一个屏幕边缘拖动识别器。新建的识别器 `edges` 是空数组，不设 `edges` 就认不出任何手势。

## 语法

```
new UIScreenEdgePanGestureRecognizer()
```

### 参数

无。

### 返回值

新建的 `UIScreenEdgePanGestureRecognizer`。三个默认值和 [`UIPanGestureRecognizer`](../ui-pan-gesture-recognizer.md) 不同：[`edges`](edges.md) 是 `[]`，`maximumNumberOfTouches` 是 1，`delaysTouchesBegan` 是 `true`。

### 异常

**`TypeError`**

用 `class X extends UIScreenEdgePanGestureRecognizer {}` 继承之后 `new X()`，抛 `TypeError`。原生类都不能继承，见[原生类](../native-classes.md)。

## 示例

```js
const page = new UIView();
const fromRight = new UIScreenEdgePanGestureRecognizer();
fromRight.edges = ['right'];
fromRight.addEventListener('began', () => {
  console.log('从右边缘拖进来了');
});
page.addGestureRecognizer(fromRight);
```

**效果**：`page` 占满屏幕时，手指从屏幕右边缘向左拖，输出 `从右边缘拖进来了`。从屏幕中间开始拖没有输出。**未在模拟器验证。**

## 对应的 iOS API

`[[UIScreenEdgePanGestureRecognizer alloc] init]`。原生用 `initWithTarget:action:` 同时登记回调，这里先创建，再用 [`addEventListener()`](../ui-gesture-recognizer/addeventlistener.md) 监听。

## 参见

- [`edges`](edges.md)

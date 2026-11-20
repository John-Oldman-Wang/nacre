---
type: reference
native: "-[UIViewController setNeedsUpdateOfPrefersInterfaceOrientationLocked]"
---

# `UIViewController`：`setNeedsUpdateOfPrefersInterfaceOrientationLocked()` 方法

**`setNeedsUpdateOfPrefersInterfaceOrientationLocked()`** 方法通知系统，这个页面的是否锁方向变了，请重新来问。

## 语法

```
setNeedsUpdateOfPrefersInterfaceOrientationLocked()
```

## 参数

无。

## 返回值

无（`undefined`）。

## 异常

无。

## 说明

写 [`prefersInterfaceOrientationLocked`](prefersinterfaceorientationlocked.md) 这类属性时运行时已经调过它，一般不用自己调。

## 示例

```js
const page = new UIViewController();
page.setNeedsUpdateOfPrefersInterfaceOrientationLocked();
```

**结果**：不抛异常。

## 对应的 iOS API

`-[UIViewController setNeedsUpdateOfPrefersInterfaceOrientationLocked]`。

## 参见

- [`prefersInterfaceOrientationLocked`](prefersinterfaceorientationlocked.md)

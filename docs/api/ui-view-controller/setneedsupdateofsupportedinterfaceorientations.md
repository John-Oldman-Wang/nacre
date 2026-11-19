---
type: reference
native: "-[UIViewController setNeedsUpdateOfSupportedInterfaceOrientations]"
---

# `UIViewController`：`setNeedsUpdateOfSupportedInterfaceOrientations()` 方法

**`setNeedsUpdateOfSupportedInterfaceOrientations()`** 方法通知系统，这个页面的允许的方向变了，请重新来问。

## 语法

```
setNeedsUpdateOfSupportedInterfaceOrientations()
```

## 参数

无。

## 返回值

无（`undefined`）。

## 异常

无。

## 说明

写 [`supportedInterfaceOrientations`](supportedinterfaceorientations.md) 这类属性时运行时已经调过它，一般不用自己调。

## 示例

```js
const page = new UIViewController();
page.setNeedsUpdateOfSupportedInterfaceOrientations();
```

**结果**：不抛异常。

## 对应的 iOS API

`-[UIViewController setNeedsUpdateOfSupportedInterfaceOrientations]`。

## 参见

- [`supportedInterfaceOrientations`](supportedinterfaceorientations.md)

---
type: reference
native: "-[UIViewController setNeedsStatusBarAppearanceUpdate]"
---

# `UIViewController`：`setNeedsStatusBarAppearanceUpdate()` 方法

**`setNeedsStatusBarAppearanceUpdate()`** 方法通知系统，这个页面的状态栏的样子变了，请重新来问。

## 语法

```
setNeedsStatusBarAppearanceUpdate()
```

## 参数

无。

## 返回值

无（`undefined`）。

## 异常

无。

## 说明

写 [`prefersStatusBarHidden`](prefersstatusbarhidden.md) 这类属性时运行时已经调过它，一般不用自己调。

## 示例

```js
const page = new UIViewController();
page.setNeedsStatusBarAppearanceUpdate();
```

**结果**：不抛异常。

## 对应的 iOS API

`-[UIViewController setNeedsStatusBarAppearanceUpdate]`。

## 参见

- [`prefersStatusBarHidden`](prefersstatusbarhidden.md)

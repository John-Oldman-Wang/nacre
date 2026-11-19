---
type: reference
native: UINavigationController.visibleViewController
---

# `UINavigationController`：`visibleViewController` 属性

**`visibleViewController`** 属性是此刻用户看到的页面。

## 值

`UIViewController`，或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 栈顶的页面模态呈现了另一个页面时，是被呈现的那个；否则和 [`topViewController`](topviewcontroller.md) 相同。前一种情况**未在模拟器验证**。
- 空栈时是 `null`。

## 示例

```js
const home = new UIViewController();
const nav = new UINavigationController(home);
console.log(nav.visibleViewController === home);
```

**结果**：控制台输出 `true`。

## 对应的 iOS API

`UINavigationController.visibleViewController`。

## 参见

- [`topViewController`](topviewcontroller.md)
- [`presentedViewController`](../ui-view-controller/presentedviewcontroller.md)

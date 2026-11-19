---
type: reference
native: UINavigationItem.hidesBackButton
---

# `UINavigationItem`：`hidesBackButton` 属性

**`hidesBackButton`** 属性决定这一页在导航栈顶时显不显示返回按钮。

## 值

布尔值。

| 取值 | 效果 |
| --- | --- |
| `true` | 不显示返回按钮。左滑返回也不能用 |
| `false` | 栈里不止一页时显示返回按钮 |

- 可读，可写。
- 默认值是 `false`。
- 写入非布尔值时按 `Boolean(v)` 转换。
- 在屏幕上的效果和左滑返回失效**未在模拟器验证**。
- 变化时不派发事件：它只会被代码改变。

> **注意**：按 iOS 的规则，藏掉返回按钮之后左滑返回也不能用。这时页面上要有别的返回方式，比如一个调用 `popViewController()` 的按钮，否则用户无法离开这个页面。

## 示例

```js
const page = new UIViewController();
page.navigationItem.hidesBackButton = true;
console.log(page.navigationItem.hidesBackButton);
```

**结果**：控制台输出 `true`。`page` 在栈顶时，导航条左侧没有返回按钮。**未在模拟器验证。**

## 对应的 iOS API

`UINavigationItem.hidesBackButton`。

## 参见

- [左侧按钮和返回](../ui-navigation-item.md#左侧按钮和返回)
- [`leftBarButtonItems`](leftbarbuttonitems.md)

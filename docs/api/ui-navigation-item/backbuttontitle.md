---
type: reference
native: UINavigationItem.backButtonTitle
---

# `UINavigationItem`：`backButtonTitle` 属性

**`backButtonTitle`** 属性是**下一页**的返回按钮上的字。它不改这一页自己导航条上的任何东西。

## 值

字符串，或者 `null`。

- 可读，可写。
- 默认值是 `null`，下一页的返回按钮上用这一页的标题。
- 写入的不是字符串时按 `String()` 转；写 `null` 或 `undefined` 得到 `null`。
- 读写在验收用例里核对过，按钮上的字在屏幕上的效果**未在模拟器验证**。
- 变化时不派发事件：它只会被代码改变。

想改「从详情页返回」那个按钮上的字，要改的是列表页的 `backButtonTitle`。

## 示例

```js
const home = new UIViewController();
home.title = '首页';
home.navigationItem.backButtonTitle = '返回';
console.log(home.navigationItem.backButtonTitle);
```

**结果**：控制台输出 `返回`。从首页进入的下一页，返回按钮上写「返回」，不再是「首页」。首页自己导航条上的标题仍然是「首页」。

## 对应的 iOS API

`UINavigationItem.backButtonTitle`。

## 参见

- [返回按钮是系统加的](../ui-navigation-item.md#返回按钮是系统加的)
- [`hidesBackButton`](hidesbackbutton.md)

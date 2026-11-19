---
type: reference
native: UIViewController.title
---

# `UIViewController`：`title` 属性

**`title`** 属性是页面的标题。页面在导航栈顶时显示在导航条正中；它的下一页在栈顶时，显示在返回按钮上。页面放进标签栏时，系统自动建的标签也用它。

## 值

字符串，或者 `null`。

- 可读，可写。
- 默认值是 `null`。**未在模拟器验证。**
- 写入时按 `String()` 转换，`5` 得到 `'5'`。写 `null` 或 `undefined` 得到 `null`。
- 页面不在导航栈里时没有导航条，标题不显示在任何地方。
- 变化时不派发事件：它只能被 App 的代码修改。

> **注意**：写 `page.title` 会同时改 [`page.navigationItem.title`](../ui-navigation-item/title.md)。反过来不会：写 `page.navigationItem.title` 之后，`page.title` 不变。两个属性只用其中一个，推荐用 `page.title`。见[标题的两个入口](../ui-navigation-item.md#标题的两个入口)。

[`UIAlertController`](../ui-alert-controller.md) 上，这个属性就是弹窗的标题。

## 示例

```js
const page = new UIViewController();
page.title = '设置';
console.log(page.title, page.navigationItem.title);
```

**结果**：控制台输出 `设置 设置`。页面在导航栈里时，导航条正中显示「设置」；从它进入下一页后，下一页的返回按钮上也显示「设置」。

## 对应的 iOS API

`UIViewController.title`。

## 参见

- [`navigationItem`](navigationitem.md)
- [`tabBarItem`](tabbaritem.md)

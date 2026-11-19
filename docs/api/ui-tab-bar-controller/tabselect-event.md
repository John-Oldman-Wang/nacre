---
type: reference
native: "-[UITabBarControllerDelegate tabBarController:didSelectViewController:]"
---

# `UITabBarController`：`tabselect` 事件

**`tabselect`** 事件在用户点了某个标签时派发。

## 语法

```
tabs.addEventListener('tabselect', (event) => { })
```

## 事件对象

`UITabBarControllerEvent`，多一个字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `viewController` | `UIViewController` | 被点中的页面 |

监听回调的参数类型是 `Event`，要读 `viewController` 先转一下类型，写法见示例。

不能取消。派发时切换已经完成，不能用它阻止用户切换。

## 什么时候派发

- 用户点了标签时派发。
- **代码改 [`selectedIndex`](selectedindex.md) 或 [`selectedViewController`](selectedviewcontroller.md) 时不派发**（实测：连写两次，一次都没有收到）。两种情况都要做的事，写成一个函数，代码切换之后自己调一次，见指南的[推荐的做法](../../guides/tabs.md#推荐的做法)。
- 用户点的是已经选中的那个标签时是否派发，**未在模拟器验证**。
- 回调不是在点击的那一刻同步执行，而是稍后执行，见[运行时怎么工作](../how-it-works.md)。

## 示例

```js
const tabs = new UITabBarController();
tabs.addEventListener('tabselect', (e) => {
  const event = /** @type {UITabBarControllerEvent} */ (e);
  console.log(event.type, event.target === tabs, event.viewController === tabs.selectedViewController);
});
```

**效果**：用户点一次标签，输出 `tabselect true true`。

## 对应的 iOS API

`UITabBarControllerDelegate` 的 `tabBarController:didSelectViewController:`。

## 参见

- [选中项变了怎么知道](../ui-tab-bar-controller.md#选中项变了怎么知道)

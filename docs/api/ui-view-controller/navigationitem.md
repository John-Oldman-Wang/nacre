---
type: reference
native: UIViewController.navigationItem
---

# `UIViewController`：`navigationItem` 属性

**`navigationItem`** 属性是这个页面在导航条上的配置：标题、副标题、返回按钮上的字、左右两侧的按钮。

## 值

[`UINavigationItem`](../ui-navigation-item.md)。

- 只读。给它赋值抛 `TypeError`。改配置是改它的属性。
- 永远有值，由系统自动创建。每个页面只有一个，每次读到的是同一个对象。
- 页面不在导航栈里时也可以读写。设置的内容被保存下来，页面进入导航栈、成为栈顶时显示。

## 示例

```js
const page = new UIViewController();
page.title = '编辑';
page.navigationItem.rightBarButtonItems = [new UIBarButtonItem({ title: '保存' })];
console.log(page.navigationItem === page.navigationItem);
```

**结果**：控制台输出 `true`。页面推入导航栈后，导航条右侧有「保存」。

## 对应的 iOS API

`UIViewController.navigationItem`。

## 参见

- [`UINavigationItem`](../ui-navigation-item.md)
- [在导航条上放按钮和标题](../../guides/bar-buttons.md)

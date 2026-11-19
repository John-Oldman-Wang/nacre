---
type: reference
native: UIViewController.tabBarItem
---

# `UIViewController`：`tabBarItem` 属性

**`tabBarItem`** 属性是这个页面在底部标签栏上的那一格：标题、图标、角标。

## 值

[`UITabBarItem`](../ui-tab-bar-item.md)。

- 可读，可写。
- 默认值是系统自动建的一个：标题是页面的 [`title`](title.md)，没有图标。
- 写 `null` 不是清空，而是让系统重新自动建一个。所以读它永远不会得到 `null`。
- 页面不在标签栏里时也可以设，放进 [`UITabBarController`](../ui-tab-bar-controller.md) 之后显示。
- 变化时不派发事件：它只能被 App 的代码修改。

### 写错时

写入的不是 `UITabBarItem`：抛 `TypeError: tabBarItem needs a UITabBarItem or null`。

## 示例

```js
const home = new UIViewController();
home.tabBarItem = new UITabBarItem({
  title: '首页',
  image: UIImage.systemImageNamed('house'),
});
home.tabBarItem.badgeValue = '3';
console.log(home.tabBarItem.title);
```

**结果**：控制台输出 `首页`。页面放进标签栏后，它那一格显示房子图标、「首页」和角标 3。

## 对应的 iOS API

`UIViewController.tabBarItem`。

## 参见

- [`UITabBarItem`](../ui-tab-bar-item.md)
- [`tabBarController`](tabbarcontroller.md)

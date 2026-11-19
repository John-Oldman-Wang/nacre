---
type: reference
native: UITabBarItem
status: partial
---

# `UITabBarItem`

**`UITabBarItem`** 表示底部标签栏上的一个标签：图标、图标下面的文字、右上角的角标。它挂在页面的 [`tabBarItem`](ui-view-controller/tabbaritem.md) 上，页面放进 [`UITabBarController`](ui-tab-bar-controller.md) 之后显示。

标题、图标、能不能点、编号继承自 [`UIBarItem`](ui-bar-item.md)。

**继承关系**：`EventTarget` → `NSObject` → [`UIBarItem`](ui-bar-item.md) → `UITabBarItem`

## 构造函数

[`UITabBarItem()`](ui-tab-bar-item/constructor.md)

创建一个标签，可以同时给出标题、图标、选中时的图标、编号和角标。

## 实例属性

还继承 [`UIBarItem`](ui-bar-item.md) 的属性：[`title`](ui-bar-item/title.md)（图标下面的文字）、[`image`](ui-bar-item/image.md)（图标）、[`isEnabled`](ui-bar-item/isenabled.md)（`false` 时变灰、点不了，样子**未在模拟器验证**）、[`tag`](ui-bar-item/tag.md)。

| 属性 | 说明 |
| --- | --- |
| [`selectedImage`](ui-tab-bar-item/selectedimage.md) | 选中时换成的图标 |
| [`badgeValue`](ui-tab-bar-item/badgevalue.md) | 右上角角标里的文字 |
| [`badgeColor`](ui-tab-bar-item/badgecolor.md) | 角标的底色 |

这些属性变了都没有事件：它们只会被代码改变。

## 示例

```js
const home = new UIViewController();
home.tabBarItem = new UITabBarItem({
  title: '首页',
  image: UIImage.systemImageNamed('house'),
  selectedImage: UIImage.systemImageNamed('house.fill'),
});
home.tabBarItem.badgeValue = '3';
console.log(home.tabBarItem.title, home.tabBarItem.badgeValue);
```

**结果**：控制台输出 `首页 3`。页面放进标签控制器后，它那一格显示房子图标、「首页」，右上角有红色的角标 3。**样子未在模拟器验证。**

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[UITabBarItem alloc] initWithTitle:@"首页" image:img selectedImage:sel]` | `new UITabBarItem({ title: '首页', image: img, selectedImage: sel })` |
| `item.badgeValue = @"3"` | `item.badgeValue = '3'` |
| `item.badgeColor = UIColor.systemIndigoColor` | `item.badgeColor = 'systemIndigo'` |

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 用系统预置的标签（搜索、收藏等） | `initWithTabBarSystemItem:tag:` |

## 参见

- [`UITabBarController`](ui-tab-bar-controller.md)
- [`UIBarItem`](ui-bar-item.md)：父类
- [做一组底部标签](../guides/tabs.md)

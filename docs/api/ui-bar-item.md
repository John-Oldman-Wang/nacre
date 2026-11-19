---
type: reference
native: UIBarItem
status: partial
---

# `UIBarItem`

**`UIBarItem`** 表示导航条或标签栏上一个项的公共部分：文字、图标、能不能点、编号。它是 [`UIBarButtonItem`](ui-bar-button-item.md)（导航条上的按钮）和 [`UITabBarItem`](ui-tab-bar-item.md)（标签栏上的标签）共同的父类，本身不能创建。

**继承关系**：`EventTarget` → `NSObject` → `UIBarItem`

```
EventTarget
  └─ NSObject
       └─ UIBarItem
            ├─ UIBarButtonItem
            └─ UITabBarItem
```

## 构造函数

不能用 `new` 创建。`new UIBarItem()` 抛 `TypeError: Illegal constructor: UIBarItem is abstract; construct UIBarButtonItem instead`。创建它的子类 [`UIBarButtonItem`](ui-bar-button-item.md)；[`UITabBarItem`](ui-tab-bar-item.md) 由页面自带。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`title`](ui-bar-item/title.md) | 文字 |
| [`image`](ui-bar-item/image.md) | 图标 |
| [`isEnabled`](ui-bar-item/isenabled.md) | 能不能点 |
| [`tag`](ui-bar-item/tag.md) | 给自己用的编号，系统不看它 |

这四个属性变了都没有事件：它们只会被代码改变。

## 示例

```js
const item = new UIBarButtonItem({ title: '提交' });
item.isEnabled = false;
item.tag = 7;
console.log(item instanceof UIBarItem, item.title, item.isEnabled, item.tag);
```

**结果**：控制台输出 `true 提交 false 7`。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `item.title = @"提交"` | `item.title = '提交'` |
| `item.image = img` | `item.image = img` |
| `item.enabled = NO` | `item.isEnabled = false` |
| `item.tag = 7` | `item.tag = 7` |

## 参见

- [`UIBarButtonItem`](ui-bar-button-item.md)：导航条上的按钮
- [`UITabBarItem`](ui-tab-bar-item.md)：标签栏上的标签

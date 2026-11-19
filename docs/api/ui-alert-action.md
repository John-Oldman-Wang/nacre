---
type: reference
native: UIAlertAction
status: partial
---

# `UIAlertAction`

**`UIAlertAction`** 表示[系统弹窗](ui-alert-controller.md)上的一个按钮。按钮有标题和样式，用户点了它，弹窗先关掉，然后这个按钮派发 [`click`](ui-alert-action/click-event.md) 事件。

按钮用 [`addAction()`](ui-alert-controller/addaction.md) 加到弹窗上。标题和样式在创建时给，之后不能改。

**继承关系**：`EventTarget` → `NSObject` → `UIAlertAction`

怎么用按钮做出常见的弹窗，见指南[弹出提示框和菜单](../guides/alerts.md)。

## 构造函数

不能用 `new` 创建。`new UIAlertAction()` 抛 `TypeError: Illegal constructor: UIAlertAction has no public initializer; use UIAlertAction.actionWithTitle(title, { style })`。用下面的静态方法创建。

## 静态方法

[`UIAlertAction.actionWithTitle()`](ui-alert-action/actionwithtitle.md)

创建一个按钮，给出标题和样式。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`title`](ui-alert-action/title.md) <small>只读</small> | 按钮上的字 |
| [`style`](ui-alert-action/style.md) <small>只读</small> | 样式：普通、取消、会删东西 |
| [`isEnabled`](ui-alert-action/isenabled.md) | 能不能点 |

## 事件

| 事件 | 什么时候派发 |
| --- | --- |
| [`click`](ui-alert-action/click-event.md) | 用户点了这个按钮。弹窗关掉之后派发 |

系统派发的只有这一个名字。监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

## 按钮的三种样式

| `style` | 效果 |
| --- | --- |
| `'default'` | 普通按钮 |
| `'cancel'` | 取消。位置由系统安排，不按加进来的顺序。一个弹窗最多一个。底部菜单里，点菜单外面等于点它 |
| `'destructive'` | 标题是红色，表示这个操作会删东西或者不能撤销 |

三种样式在屏幕上的样子**未在模拟器验证**。

## 示例

```js
const alert = UIAlertController.alertControllerWithTitle('删除这张照片？', {
  preferredStyle: 'alert',
});
const remove = UIAlertAction.actionWithTitle('删除', { style: 'destructive' });
remove.addEventListener('click', () => {
  console.log('照片删掉了');
});
alert.addAction(UIAlertAction.actionWithTitle('取消', { style: 'cancel' }));
alert.addAction(remove);
```

**效果**（**未在模拟器验证**）：弹出后，提示框底下有「取消」和红色的「删除」。点「删除」，提示框消失，控制台输出 `照片删掉了`。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[UIAlertAction actionWithTitle:@"好" style:UIAlertActionStyleDefault handler:^(UIAlertAction *a) { … }]` | `const a = UIAlertAction.actionWithTitle('好', { style: 'default' });`<br>`a.addEventListener('click', () => { … })` |
| `action.enabled = NO` | `action.isEnabled = false` |

## 参见

- [`UIAlertController`](ui-alert-controller.md)：按钮所在的弹窗
- [弹出提示框和菜单](../guides/alerts.md)

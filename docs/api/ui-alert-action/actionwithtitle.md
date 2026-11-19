---
type: reference
native: "+[UIAlertAction actionWithTitle:style:handler:]"
---

# `UIAlertAction.actionWithTitle()` 静态方法

**`UIAlertAction.actionWithTitle()`** 静态方法创建一个弹窗按钮。按钮只能用这个方法创建，不能用 `new`。

## 语法

```
UIAlertAction.actionWithTitle(title, { style })
```

### 参数

**`title`**

按钮上的字，字符串，必填。不是字符串时转成字符串；`null` 和 `undefined` 得到空串。系统不接受没有标题的按钮，所以读回来不会是 `null`。

**`options.style`**

样式，必填：

| 取值 | 效果 |
| --- | --- |
| `'default'` | 普通按钮 |
| `'cancel'` | 取消。位置由系统安排。一个弹窗最多一个 |
| `'destructive'` | 标题是红色，表示这个操作会删东西或者不能撤销 |

三种样式在屏幕上的样子**未在模拟器验证**。

### 返回值

新建的 `UIAlertAction`。每次调用得到一个新的。[`isEnabled`](isenabled.md) 是 `true`。

### 异常

**`TypeError`**

`style` 没给或者不认识，比如 `style has no value "primary"; expected one of: default / cancel / destructive`。

## 说明

点了按钮要做什么，在按钮上监听 [`click`](click-event.md)。没有回调参数。

## 示例

```js
const remove = UIAlertAction.actionWithTitle('删除', { style: 'destructive' });
console.log(remove.title, remove.style, remove.isEnabled);
```

**结果**：控制台输出 `删除 destructive true`。

## 对应的 iOS API

`+[UIAlertAction actionWithTitle:style:handler:]`。`handler` 换成按钮上的 `click` 事件；`UIAlertActionStyleDestructive` 写成 `'destructive'`，其余同理。

## 参见

- [`click`](click-event.md)
- [`UIAlertController.addAction()`](../ui-alert-controller/addaction.md)

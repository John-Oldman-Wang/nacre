---
type: reference
native: UIControlEventMenuActionTriggered
---

# `UIControl`：`menuaction` 事件

**`menuaction`** 事件在带菜单的控件弹出菜单前派发。

## 语法

```
addEventListener('menuaction', (event) => { })
```

## 事件对象

普通的 `Event`，除了 `type` 和 `target` 不带别的字段。没有触点位置：读 `location` 得到 `undefined`。

不能取消：`cancelable` 是 `false`，`preventDefault()` 没有效果。

## 什么时候派发

- 没有控件会因为用户操作派发它。
- 可以监听，不报错。用 `sendActionsForControlEvents(['menuaction'])` 能让它派发。
- 派发的时机**未在模拟器验证**。

## 示例

```js
const card = new UIControl();
card.addEventListener('menuaction', () => {
  console.log('menuaction');
});
card.sendActionsForControlEvents(['menuaction']);
```

**效果**：控制台输出 `menuaction`。**未在模拟器验证。**

## 对应的 iOS API

`UIControlEventMenuActionTriggered`。原生用 `addTarget:action:forControlEvents:` 登记，这里用 [`addEventListener()`](addeventlistener.md)。

## 参见

- [`UIControl`](../ui-control.md)

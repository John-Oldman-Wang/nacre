---
type: reference
native: UIControlEventPrimaryActionTriggered
---

# `UIControl`：`click` 事件

**`click`** 事件在用户完成了控件的主要操作时派发。对按钮来说就是一次点击。

## 语法

```
addEventListener('click', (event) => { })
```

## 事件对象

普通的 `Event`，除了 `type` 和 `target` 不带别的字段。没有触点位置：读 `location` 得到 `undefined`。`click` 不一定来自触摸，代码调用 `sendActionsForControlEvents()` 也会派发它。需要触点位置时监听 [`touchupinside`](touchupinside-event.md)。

不能取消：`cancelable` 是 `false`，`preventDefault()` 没有效果。

## 什么时候派发

- [`UIButton`](../ui-button.md) 在被点击时派发（实测）。手指按下后滑到外面再松开不算点击，不派发。**未在模拟器验证。**
- 直接创建的 [`UIControl`](../ui-control.md) 不派发（实测）。在它上面监听 `click`，回调不会执行，也不会报错。它用 [`touchupinside`](touchupinside-event.md)。
- 对按钮调用 `sendActionsForControlEvents(['touchupinside'])` 时，按钮的 `click` 也会派发（实测）。
- 按钮被点击时 `click` 和 `touchupinside` 都派发，**两者的先后未在模拟器验证**。两个选一个监听。
- 连点两下是两次点击，派发两次。**未在模拟器验证。**

## 示例

```js
const button = UIButton.buttonWithType('system');
button.setTitle('提交', { forState: ['normal'] });
button.addEventListener('click', () => {
  console.log('提交');
});
```

**效果**：用户点一次按钮，控制台输出一次 `提交`。

## 对应的 iOS API

`UIControlEventPrimaryActionTriggered`。原生用 `addTarget:action:forControlEvents:` 登记，这里用 [`addEventListener()`](addeventlistener.md)。

## 参见

- [做一个按钮](../../guides/buttons.md)
- [`touchupinside`](touchupinside-event.md)：需要触点位置时用它
- [回调的执行时机](../ui-control.md#回调的执行时机)

---
type: reference
native: UIBarButtonItem target/action
---

# `UIBarButtonItem`：`click` 事件

**`click`** 事件在用户点了这个导航条按钮时派发。

## 语法

```
item.addEventListener('click', (event) => { })
```

## 事件对象

`Event`。只有 `type` 和 `target` 两个字段，`target` 是这个按钮。

不能取消。

## 什么时候派发

- 用户点一次，派发一次。导航条右侧的按钮被点击时派发，在验收用例里用真实的点击验证过。
- 禁用（[`isEnabled`](../ui-bar-item/isenabled.md) 是 `false`）的按钮点了没有反应。**未在模拟器验证。**
- 回调不是在点击的那一刻同步执行，而是稍后执行，见[运行时怎么工作](../how-it-works.md)。
- 事件名和 [`UIButton`](../ui-button.md) 的点击事件相同。
- 监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。
- 按钮上的监听器不需要手动移除：页面离开导航栈并被回收时，它的按钮和监听器一起被回收。

## 示例

```js
const item = new UIBarButtonItem({ title: '完成' });
item.addEventListener('click', (ev) => {
  console.log(ev.type, ev.target === item);
});
```

**效果**：按钮放到导航条上后，用户点一次，输出 `click true`。

## 对应的 iOS API

`UIBarButtonItem` 的 `target` 和 `action`。这里不开放这两个属性，换成 `click` 事件。

## 参见

- [`UIBarButtonItem()`](constructor.md)

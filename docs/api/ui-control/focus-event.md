---
type: reference
native: UIControlEventEditingDidBegin
---

# `UIControl`：`focus` 事件

**`focus`** 事件在输入框开始编辑时派发：输入框得到焦点，键盘弹出。

## 语法

```
addEventListener('focus', (event) => { })
```

## 事件对象

普通的 `Event`，除了 `type` 和 `target` 不带别的字段。没有触点位置：读 `location` 得到 `undefined`。它是文字输入的事件，和触点无关。

不能取消：`cancelable` 是 `false`，`preventDefault()` 没有效果。

## 什么时候派发

- [`UITextField`](../ui-text-field.md) 派发。
- 用户点输入框时，`focus` 在手指按下时派发，不等松手（实测）。
- 代码让输入框开始编辑时也派发，见 [`UITextField`](../ui-text-field.md)。**未在模拟器验证。**
- 结束编辑时派发 [`blur`](blur-event.md)。

## 示例

```js
const field = new UITextField();
field.addEventListener('focus', () => {
  console.log('开始输入');
});
field.addEventListener('blur', () => {
  console.log('结束输入');
});
```

**效果**：用户点进输入框，输出 `开始输入`；离开输入框，输出 `结束输入`。

## 对应的 iOS API

`UIControlEventEditingDidBegin`。原生用 `addTarget:action:forControlEvents:` 登记，这里用 [`addEventListener()`](addeventlistener.md)。

## 参见

- [`blur`](blur-event.md)
- [`UITextField`](../ui-text-field.md)：输入框
- [`UITextView`](../ui-text-view.md)：多行输入
- [`UISearchBar`](../ui-search-bar.md)：搜索框

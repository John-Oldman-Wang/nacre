---
type: reference
native: UIControlEventEditingDidEndOnExit
---

# `UIControl`：`return` 事件

**`return`** 事件在用户按了键盘上的回车键之后派发。

## 语法

```
addEventListener('return', (event) => { })
```

## 事件对象

普通的 `Event`，除了 `type` 和 `target` 不带别的字段。没有触点位置：读 `location` 得到 `undefined`。它是文字输入的事件，和触点无关。

不能取消：`cancelable` 是 `false`，`preventDefault()` 没有效果。

## 什么时候派发

- [`UITextField`](../ui-text-field.md) 派发。
- 它在回车生效之后派发，不能取消。要在之前拦住，用输入框可以取消的 [`beforereturn`](../ui-text-field/beforereturn-event.md)。
- 回车之后输入框是否结束编辑，见 [`UITextField`](../ui-text-field.md)。

## 示例

```js
const field = new UITextField();
field.addEventListener('return', () => {
  console.log('提交：', field.text);
});
```

**效果**：用户在输入框里按回车，控制台输出输入框的文字。

## 对应的 iOS API

`UIControlEventEditingDidEndOnExit`。原生用 `addTarget:action:forControlEvents:` 登记，这里用 [`addEventListener()`](addeventlistener.md)。

## 参见

- [`UITextField`](../ui-text-field.md)：输入框
- [`UITextView`](../ui-text-view.md)：多行输入
- [`UISearchBar`](../ui-search-bar.md)：搜索框

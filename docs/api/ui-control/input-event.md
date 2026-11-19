---
type: reference
native: UIControlEventEditingChanged
---

# `UIControl`：`input` 事件

**`input`** 事件在输入框的文字被用户改了之后派发。

## 语法

```
addEventListener('input', (event) => { })
```

## 事件对象

普通的 `Event`，除了 `type` 和 `target` 不带别的字段。没有触点位置：读 `location` 得到 `undefined`。它是文字输入的事件，和触点无关。

不能取消：`cancelable` 是 `false`，`preventDefault()` 没有效果。

## 什么时候派发

- [`UITextField`](../ui-text-field.md) 派发。用户每输入或删除一个字符派发一次。**未在模拟器验证。**
- 回调里读 `text` 得到改过之后的文字。
- 要在文字改变之前拦住，用输入框可以取消的 [`beforeinput`](../ui-text-field/beforeinput-event.md)。

## 示例

```js
const field = new UITextField();
field.addEventListener('input', () => {
  console.log('现在的文字：', field.text);
});
```

**效果**：用户每输入或删除一个字符，控制台输出一次当前的文字。**未在模拟器验证。**

## 对应的 iOS API

`UIControlEventEditingChanged`。原生用 `addTarget:action:forControlEvents:` 登记，这里用 [`addEventListener()`](addeventlistener.md)。

## 参见

- [`UITextField`](../ui-text-field.md)：输入框
- [`UITextView`](../ui-text-view.md)：多行输入
- [`UISearchBar`](../ui-search-bar.md)：搜索框

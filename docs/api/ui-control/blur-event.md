---
type: reference
native: UIControlEventEditingDidEnd
---

# `UIControl`：`blur` 事件

**`blur`** 事件在输入框结束编辑时派发：输入框失去焦点。

## 语法

```
addEventListener('blur', (event) => { })
```

## 事件对象

普通的 `Event`，除了 `type` 和 `target` 不带别的字段。没有触点位置：读 `location` 得到 `undefined`。它是文字输入的事件，和触点无关。

不能取消：`cancelable` 是 `false`，`preventDefault()` 没有效果。

## 什么时候派发

- [`UITextField`](../ui-text-field.md) 派发。
- 用户点了别的输入框、代码让输入框结束编辑时派发。**各种结束方式未在模拟器逐一验证。**
- 开始编辑时派发的是 [`focus`](focus-event.md)。

## 示例

```js
const field = new UITextField();
field.addEventListener('blur', () => {
  console.log('输入完了：', field.text);
});
```

**效果**：输入框失去焦点时，控制台输出它的文字。

## 对应的 iOS API

`UIControlEventEditingDidEnd`。原生用 `addTarget:action:forControlEvents:` 登记，这里用 [`addEventListener()`](addeventlistener.md)。

## 参见

- [`focus`](focus-event.md)
- [`UITextField`](../ui-text-field.md)：输入框
- [`UITextView`](../ui-text-view.md)：多行输入
- [`UISearchBar`](../ui-search-bar.md)：搜索框

---
type: reference
native: UISearchBar.searchTextField
---

# `UISearchBar`：`searchTextField` 属性

**`searchTextField`** 属性是搜索框里的那个输入框，一个 [`UITextField`](../ui-text-field.md)。

## 值

[`UITextField`](../ui-text-field.md)。

- 只读。给它赋值抛 `TypeError`。
- 每次读到的是同一个对象。
- 它和搜索框共用同一份文字和同一份键盘设置：它的 `text` 和搜索框的 [`text`](text.md) 是同一份，`placeholder` 也是；九个键盘设置（`keyboardType`、`returnKeyType`……）写在哪一边，另一边读到的都是新的值。所以这些只写搜索框这一边就够了。
- 要用到它的，是搜索框自己没有的那些输入框成员，例如字体、文字颜色和清空按钮什么时候显示。
- 它的 `clearButtonMode` 默认是 `'always'`（有内容时右端一直有清空按钮），新建的 `UITextField` 是 `'never'`。
- 搜索框拿到焦点时，它的 `isFirstResponder` 也是 `true`。

> **注意**：监听文字变化用搜索框的 [`input`](input-event.md)。`searchTextField` 是控件，在它上面监听 `input` 也能收到用户的输入，但用户点清空按钮时它是否派发**未在模拟器验证**。

## 示例

```js
const search = new UISearchBar();
search.searchTextField.keyboardType = 'url';
console.log(search.keyboardType);
console.log(search.searchTextField.clearButtonMode);
```

**结果**：依次输出 `url`、`always`。

## 对应的 iOS API

`UISearchBar.searchTextField`。原生的类型是 `UISearchTextField`，这里按普通的 `UITextField` 提供，搜索标记和搜索建议见[还不能做的](../ui-search-bar.md#还不能做的)。

## 参见

- [`UITextField`](../ui-text-field.md)

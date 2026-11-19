---
type: reference
native: "-[UISearchBar setShowsCancelButton:animated:]"
---

# `UISearchBar`：`setShowsCancelButton()` 方法

**`setShowsCancelButton()`** 方法显示或隐藏取消按钮，可以带动画。

## 语法

```
setShowsCancelButton(showsCancelButton)
setShowsCancelButton(showsCancelButton, { animated })
```

### 参数

**`showsCancelButton`**

布尔。`true` 显示，`false` 隐藏。

**`options.animated`**

布尔，可以不传。`true` 时取消按钮滑入或滑出。不传或 `false` 时立刻变，等同于直接写 [`showsCancelButton`](showscancelbutton.md)。动画的样子**未在模拟器验证**。

### 返回值

无（`undefined`）。

带动画时，`showsCancelButton` 属性在调用返回时已经是新的值。

### 异常

无。

## 示例

```js
const search = new UISearchBar();
search.addEventListener('focus', () => {
  search.setShowsCancelButton(true, { animated: true });
});
search.addEventListener('blur', () => {
  search.setShowsCancelButton(false, { animated: true });
});
```

**效果**：点搜索框，右边滑出取消按钮；键盘收起时取消按钮滑走。**未在模拟器验证。**

## 对应的 iOS API

`-[UISearchBar setShowsCancelButton:animated:]`。`animated:` 写成 options 对象的 `animated`。

## 参见

- [`showsCancelButton`](showscancelbutton.md)

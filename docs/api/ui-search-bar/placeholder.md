---
type: reference
native: UISearchBar.placeholder
---

# `UISearchBar`：`placeholder` 属性

**`placeholder`** 属性是搜索框没有内容时显示的灰色文字。用户输入第一个字时它消失。

## 值

字符串，或者 `null`。

- 可读，可写。
- 默认值是 `null`。
- 和 [`searchTextField`](searchtextfield.md) 的 `placeholder` 是同一份。
- 没有变化事件：改它的只有 App 自己的代码。

### `null` 和空串

`null` 和空串 `''` 都表示「没有占位文字」，写哪一个都是清掉它。

清掉之后读回来的是 `null` 还是 `''`，取决于清掉它的那一次写的是哪一个。搜索框已经没有占位文字时，再写另一个不改变读回来的值。所以判断有没有占位文字，用 `!search.placeholder`，不要用 `=== null`。

## 示例

### 显示占位文字

```js
const search = new UISearchBar();
search.placeholder = '搜索城市';
```

**效果**：输入框里没有内容时，显示灰色的「搜索城市」。

### 清掉之后读回什么

```js
const search = new UISearchBar();
search.placeholder = '搜索城市';
search.placeholder = '';
console.log(search.placeholder === '');
search.placeholder = null;
console.log(search.placeholder === '');
```

**结果**：两次都输出 `true`。第二次写 `null` 时搜索框已经没有占位文字，读回来的还是 `''`。

## 对应的 iOS API

`UISearchBar.placeholder`。

## 参见

- [`prompt`](prompt.md)：没有这种 `null` 和空串的区别

---
type: reference
native: UISearchBar.scopeButtonTitles
---

# `UISearchBar`：`scopeButtonTitles` 属性

**`scopeButtonTitles`** 属性是范围按钮的标题，从左到右。范围按钮是输入框下面的一排分段按钮，用来切换搜索的范围。

## 值

字符串的数组。

- 可读，可写。
- 默认值是 `[]`。
- 每次读都得到一个新数组。改这个数组不影响搜索框；要改就整个重新赋值。
- 写 `null` 等于写空数组。
- 数组里不是字符串的元素被转成字符串。
- 只写标题不会显示这一排，还要 [`showsScopeBar`](showsscopebar.md) 是 `true`，并且至少要有两个标题。
- 换标题会影响 [`selectedScopeButtonIndex`](selectedscopebuttonindex.md)：换成只有一个标题时它变成 `0`，清空时它变成 `-1`，别的情况保持原来的值。
- 没有变化事件：改它的只有 App 自己的代码。

### 写错时

写了不是数组的值（数、字符串）：抛 `TypeError: scopeButtonTitles needs an array of strings or null`，原值不变。

## 示例

```js
const search = new UISearchBar();
search.scopeButtonTitles = ['全部', '我的', '共享'];
search.showsScopeBar = true;
console.log(search.scopeButtonTitles.length);
```

**效果**：输入框下面多出一排三个按钮，「全部」是选中的。控制台输出 `3`。

## 对应的 iOS API

`UISearchBar.scopeButtonTitles`。

## 参见

- [`showsScopeBar`](showsscopebar.md)
- [`selectedScopeButtonIndex`](selectedscopebuttonindex.md)

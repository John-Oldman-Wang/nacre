---
type: reference
native: UISearchBar.selectedScopeButtonIndex
---

# `UISearchBar`：`selectedScopeButtonIndex` 属性

**`selectedScopeButtonIndex`** 属性是选中的范围按钮的下标，从 0 数。

## 值

整数，没有单位。

- 可读，可写。
- 默认值是 `0`。
- 用户点了另一个范围按钮时，搜索框派发 [`scopechange`](scopechange-event.md)。用代码写它不派发。
- 写一个超出范围的值不报错，这个值被原样存下来：有三个按钮时写 `7`，读回来是 `7`。这时哪个按钮显示成选中**未在模拟器验证**。
- 换一组 [`scopeButtonTitles`](scopebuttontitles.md) 不会把它改回 0：下标是 `1` 时换成另外两个标题，下标还是 `1`。换成只有一个标题时，下标变成 `0`。
- 把标题清空（写 `[]`）之后，下标变成 `-1`。

所以用它去取 `scopeButtonTitles` 里的标题之前，先确认它在范围内。

### 写错时

- 写了转不成有限数的值：抛 `TypeError: selectedScopeButtonIndex must be a finite number, got undefined`，原值不变。
- `'1'` 这样的字符串按数处理，小数向零取整。

## 示例

```js
const search = new UISearchBar();
search.scopeButtonTitles = ['全部', '我的', '共享'];
search.showsScopeBar = true;
search.selectedScopeButtonIndex = 2;

const i = search.selectedScopeButtonIndex;
const titles = search.scopeButtonTitles;
console.log(i >= 0 && i < titles.length ? titles[i] : '没有选中');
```

**效果**：第三个范围按钮变成选中的，控制台输出 `共享`。不派发 `scopechange`。

## 对应的 iOS API

`UISearchBar.selectedScopeButtonIndex`。

## 参见

- [`scopechange`](scopechange-event.md) 事件

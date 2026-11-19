---
type: reference
native: UISearchBar.searchBarStyle
---

# `UISearchBar`：`searchBarStyle` 属性

**`searchBarStyle`** 属性决定搜索框有没有自己的背景。

## 值

字符串，下面三个之一：

| 取值 | 效果 |
| --- | --- |
| `'default'` | 现在等同于 `'prominent'` |
| `'prominent'` | 搜索框带自己的背景 |
| `'minimal'` | 没有背景，只有里面的输入框 |

- 可读，可写。
- 默认值是 `'default'`。
- 各取值在画面上的差别**未在模拟器验证**。
- 没有变化事件：改它的只有 App 自己的代码。

### 写错时

写入表里没有的值：不抛异常，控制台输出一条警告，原值不变。

```
[Nacre] searchBarStyle has no value "compact"; expected one of: default / prominent / minimal, ignored
```

## 示例

```js
const search = new UISearchBar();
search.searchBarStyle = 'minimal';
```

**效果**：搜索框自己的背景消失，只剩里面的输入框。**未在模拟器验证。**

## 对应的 iOS API

`UISearchBar.searchBarStyle`。`UISearchBarStyleMinimal` 写成 `'minimal'`，其余同理。

## 参见

- [`barStyle`](barstyle.md)

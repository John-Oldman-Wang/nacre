---
type: reference
native: UISearchBar.barTintColor
---

# `UISearchBar`：`barTintColor` 属性

**`barTintColor`** 属性是搜索框自己的底色。

## 值

[颜色](../ui-color.md)字符串，或者 `null`。

- 可读，可写。
- 默认值是 `null`，表示用系统的背景。
- 写 `null` 恢复成系统的背景。
- 没有变化事件：改它的只有 App 自己的代码。

### 写错时

写了不合法的颜色：不抛异常，控制台输出一条警告，原值不变，见[颜色](../ui-color.md#写错不抛打警告)。

## 示例

```js
const search = new UISearchBar();
search.barTintColor = '#F2F2F7';
```

**效果**：搜索框的底色变成浅灰。**未在模拟器验证。**

## 对应的 iOS API

`UISearchBar.barTintColor`。

## 参见

- [`tintColor`](tintcolor.md)
- [`searchBarStyle`](searchbarstyle.md)

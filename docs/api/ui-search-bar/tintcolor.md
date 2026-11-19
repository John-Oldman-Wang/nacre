---
type: reference
native: UISearchBar.tintColor
---

# `UISearchBar`：`tintColor` 属性

**`tintColor`** 属性是搜索框里光标和按钮的颜色。

## 值

[颜色](../ui-color.md)字符串。

- 可读，可写。
- 读出来永远有值。没设过时是从外层视图继承来的颜色。
- 写 `null` 恢复成继承来的颜色。
- 没有变化事件：改它的只有 App 自己的代码。

### 写错时

写了不合法的颜色：不抛异常，控制台输出一条警告，原值不变，见[颜色](../ui-color.md#写错不抛打警告)。

## 示例

```js
const search = new UISearchBar();
search.tintColor = 'systemOrange';
```

**效果**：光标、取消按钮变成橙色。**未在模拟器验证。**

## 对应的 iOS API

`UISearchBar.tintColor`。

## 参见

- [`barTintColor`](bartintcolor.md)

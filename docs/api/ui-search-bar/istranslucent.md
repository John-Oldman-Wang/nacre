---
type: reference
native: UISearchBar.translucent
---

# `UISearchBar`：`isTranslucent` 属性

**`isTranslucent`** 属性表示搜索框的背景是不是半透明的。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 背景半透明 |
| `false` | 背景不透明 |

- 可读，可写。
- 默认值是 `true`。
- 两个取值在画面上的差别**未在模拟器验证**。
- 写别的类型的值时按真假转成布尔：`0` 是 `false`，`'false'` 是 `true`。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const search = new UISearchBar();
search.isTranslucent = false;
console.log(search.isTranslucent);
```

**结果**：输出 `false`。

## 对应的 iOS API

`UISearchBar.translucent`（getter 是 `isTranslucent`）。

## 参见

- [`barTintColor`](bartintcolor.md)

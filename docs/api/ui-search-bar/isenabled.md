---
type: reference
native: UISearchBar.enabled
---

# `UISearchBar`：`isEnabled` 属性

**`isEnabled`** 属性表示搜索框能不能点、能不能输入。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 可以点、可以输入 |
| `false` | 搜索框不接收触摸：`isUserInteractionEnabled` 跟着变成 `false`，里面的输入框的 `isEnabled` 也变成 `false`。点它没有反应，键盘不弹出 |

- 可读，可写。
- 默认值是 `true`。
- 禁用时画面上的样子**未在模拟器验证**。
- 写别的类型的值时按真假转成布尔：`0` 是 `false`，`'false'` 是 `true`。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const search = new UISearchBar();
search.isEnabled = false;
console.log(search.isUserInteractionEnabled, search.searchTextField.isEnabled);
```

**结果**：输出 `false false`。点搜索框没有反应。写回 `true` 恢复。

## 对应的 iOS API

`UISearchBar.enabled`（getter 是 `isEnabled`）。

## 参见

- [`searchTextField`](searchtextfield.md)

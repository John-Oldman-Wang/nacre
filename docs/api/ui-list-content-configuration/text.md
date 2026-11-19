---
type: reference
native: UIListContentConfiguration.text
---

# `UIListContentConfiguration`：`text` 属性

**`text`** 属性是一行的主文字。

## 值

字符串，或者 `null`。

- 可读，可写。
- 默认值是 `null`。
- 写数字会转成字符串（实测）。写 `null` 清掉。
- 改它不影响已经写给单元格的那一份，要再赋值一次，见[内容配置是一份副本](../ui-list-content-configuration.md)。

## 示例

```js
const content = UIListContentConfiguration.subtitleCellConfiguration();
content.text = /** @type {any} */ (42);
console.log(content.text);
```

**结果**：输出 `42`，是字符串。

## 对应的 iOS API

`UIListContentConfiguration.text`。

## 参见

- [`secondaryText`](secondarytext.md)

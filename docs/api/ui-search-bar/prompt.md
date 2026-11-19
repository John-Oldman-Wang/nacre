---
type: reference
native: UISearchBar.prompt
---

# `UISearchBar`：`prompt` 属性

**`prompt`** 属性是显示在输入框上面的一行说明文字。

## 值

字符串，或者 `null`。

- 可读，可写。
- 默认值是 `null`，不显示这一行。
- 写 `''` 读回 `''`，写 `null` 读回 `null`。
- 有它时搜索框自己想要的高度从 64 pt 变成 98 pt。用 `frame` 定位时，改了它之后要再调一次 `sizeToFit()`，见[大小](../ui-search-bar.md#大小)。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const search = new UISearchBar();
search.prompt = '输入城市的中文名或拼音';
console.log(search.intrinsicContentSize.height);
```

**效果**：输入框上面多出一行小字。控制台输出 `98`。

## 对应的 iOS API

`UISearchBar.prompt`。

## 参见

- [`placeholder`](placeholder.md)

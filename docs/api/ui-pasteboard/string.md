---
type: reference
native: UIPasteboard.string
---

# `UIPasteboard`：`string` 属性

**`string`** 属性是剪贴板里的文字。读它取出内容，写它替换内容。

## 值

字符串或 `null`。

- 可读，可写。
- 剪贴板里没有文字时读到 `null`。剪贴板里只有图片时读到 `null`，**未在模拟器验证**。
- 写入一段文字，替换剪贴板里原有的内容。写入不需要用户同意，也没有系统提示。赋值的那一行执行完，文字已经在剪贴板里。
- 写 `null` 清空剪贴板：之后 `string` 读到 `null`，[`hasStrings`](hasstrings.md) 是 `false`。清空的是整个系统剪贴板，包括用户在别的 App 里复制的内容。
- 每次写入（包括写 `null`）[`changeCount`](changecount.md) 都变大，并派发 [`change`](change-event.md) 事件。别的 App 改了内容时没有事件，见 [`changeCount`](changecount.md)。

> **注意**：内容来自别的 App 时，读 `string` 会弹出系统提示，用户回应之前这一行不返回，整个界面不动。见[读取时的系统提示](../ui-pasteboard.md#读取时的系统提示)。只想知道有没有文字，读 [`hasStrings`](hasstrings.md)。

### 写错时

写的值不是字符串时按 `String()` 转换，比如写 `42` 得到 `'42'`。写 `undefined` 和写 `null` 一样是清空。写入不会抛异常。

## 示例

```js
const pasteboard = UIPasteboard.generalPasteboard;
pasteboard.string = '20261112-0042';
console.log(pasteboard.string);

pasteboard.string = null;
console.log(pasteboard.string, pasteboard.hasStrings);
```

**结果**：先输出 `20261112-0042`，清空之后输出 `null false`。

## 对应的 iOS API

`UIPasteboard.string`。

## 参见

- [复制和粘贴文字](../../guides/clipboard.md)：什么时候读才不惊扰用户
- [`hasStrings`](hasstrings.md)：只判断有没有文字

---
type: reference
native: NSAttributedString.string
---

# `NSAttributedString`：`string` 属性

**`string`** 属性是富文本里不带属性的文字。

## 值

字符串。

- 只读。给它赋值抛 `TypeError`。
- 附件的位置上是字符 `'￼'`（U+FFFC）。
- `NSAttributedString` 的内容不会变。`NSMutableAttributedString` 改了内容之后，读到的是改过的文字；没有变化通知，改动只来自 App 自己的代码。

## 示例

```js
const text = new NSMutableAttributedString('abc', { kern: 3 });
text.replaceCharactersInRange(new NSRange(1, 1), { withString: 'XYZ' });
console.log(text.string);
```

**结果**：控制台输出 `aXYZc`。

## 对应的 iOS API

`NSAttributedString.string`。

## 参见

- [`length`](length.md)

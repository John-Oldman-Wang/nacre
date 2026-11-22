---
type: reference
web: DOMException.message
---

# `DOMException`：`message` 属性

**`message`** 属性是一句说明，讲清这次出了什么错。

## 值

字符串。

- 只读。给它赋值抛 `TypeError`，值不变。
- 是构造时给的说明；构造时没给、给了 `undefined` 或 `null`，是空串。
- 运行时自己判断出来的错误，是一句英文，各个 API 的页面上有原文。
- 来自 iOS 系统的错误，是系统给的说明文字，语言跟着 App 的语言走（见[配置 App](../../guides/project-config.md)）。

`message` 是给人看的，写日志、给用户提示都可以用它。程序里判断出了什么错，看 [`name`](name.md)，不要比对 `message` 的文字。

## 示例

```js
try {
  atob('not base64!');
} catch (err) {
  if (err instanceof DOMException) {
    console.log(err.name, err.message.length > 0);
  }
}
```

**结果**：输出 `InvalidCharacterError true`。

## 参见

- [`name`](name.md)

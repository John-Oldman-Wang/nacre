---
type: reference
native: ErrorEvent.filename
---

# `ErrorEvent`：`filename` 属性

**`filename`** 属性是出错的脚本名。

## 值

字符串，例如 `'main.js'`。

- 只读。给它赋值抛 `TypeError`。
- 指向打包后的 `main.js`，不是打包前的源文件。要找到出错的代码，打开打包产物看 [`lineno`](lineno.md) 那一行。

## 示例

```js
application.addEventListener('error', (e) => {
  console.log('出错位置', e.filename, e.lineno);
  e.preventDefault();
});
throw new Error('坏了');
```

**结果**：输出 `出错位置 main.js` 加上 `throw` 那一行的行号。

## 参见

- [`lineno`](lineno.md)

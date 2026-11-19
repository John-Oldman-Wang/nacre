---
type: reference
native: ErrorEvent.lineno
---

# `ErrorEvent`：`lineno` 属性

**`lineno`** 属性是出错的行号。

## 值

数。

- 只读。给它赋值抛 `TypeError`。
- 是打包后的 `main.js` 里的行号，不是打包前的源文件里的。

## 示例

```js
application.addEventListener('error', (e) => {
  console.log(typeof e.lineno);
  e.preventDefault();
});
throw new Error('坏了');
```

**结果**：输出 `number`。

## 参见

- [`filename`](filename.md)

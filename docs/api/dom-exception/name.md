---
type: reference
web: DOMException.name
---

# `DOMException`：`name` 属性

**`name`** 属性是错误的分类名字，比如 `'AbortError'`、`'NotFoundError'`。判断出了什么错，看它。

## 值

字符串。

- 只读。给它赋值抛 `TypeError`，值不变。
- 是构造时给的名字；构造时没给是 `'Error'`。
- 运行时给出的错误，`name` 是 Web 标准里的名字，全部取值见[运行时给出的名字](../dom-exception.md#运行时给出的名字)。

## 示例

```js
const controller = new AbortController();
fetch('https://example.com/', { signal: controller.signal }).catch((err) => {
  if (err instanceof DOMException && err.name === 'AbortError') {
    console.log('请求被取消了');
  }
});
controller.abort();
```

**结果**：输出 `请求被取消了`。

## 参见

- [`code`](code.md)：这个名字对应的老数字码
- [`DOMException()`](constructor.md)

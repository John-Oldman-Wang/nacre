---
type: reference
native: PromiseRejectionEvent.reason
---

# `PromiseRejectionEvent`：`reason` 属性

**`reason`** 属性是拒绝的原因。

## 值

类型是 `unknown`。通常是 `Error` 对象，但可以是任何值，所以用之前要判断。

- 只读。给它赋值抛 `TypeError`。

## 示例

```js
application.addEventListener('unhandledrejection', (e) => {
  console.log('没处理的拒绝', String(e.reason));
  e.preventDefault();
});
Promise.reject(new Error('没人接的拒绝'));
```

**结果**：输出 `没处理的拒绝 Error: 没人接的拒绝`。

## 参见

- [`promise`](promise.md)

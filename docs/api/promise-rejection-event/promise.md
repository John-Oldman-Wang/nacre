---
type: reference
native: PromiseRejectionEvent.promise
---

# `PromiseRejectionEvent`：`promise` 属性

**`promise`** 属性是被拒绝的那个 Promise。

## 值

`Promise`，或者 `undefined`。

- 只读。给它赋值抛 `TypeError`。
- 运行时派发的事件里一定有值；自己构造事件而没传时是 `undefined`。

## 示例

```js
const rejected = Promise.reject(new Error('没人接'));
application.addEventListener('unhandledrejection', (e) => {
  console.log(e.promise === rejected);
  e.preventDefault();
});
```

**结果**：输出 `true`。**未在模拟器验证。**

## 参见

- [`reason`](reason.md)

---
type: reference
native: UIActivityViewControllerCompletionEvent.activityError
---

# `UIActivityViewControllerCompletionEvent`：`activityError` 属性

**`activityError`** 属性是动作失败时系统给的错误。

## 值

[`NSError`](../ns-error.md) 或 `null`。`message` 是系统给的说明，`domain` 和 `code` 是系统的错误域和错误码。没有出错是 `null`。

- 只读。给它赋值抛 `TypeError`。
- 用 [`new`](constructor.md) 创建时没给，是 `null`。

## 示例

```js
const sheet = new UIActivityViewController(['你好']);
sheet.addEventListener('complete', (e) => {
  if (e.activityError !== null) {
    console.log('分享出错了', e.activityError.domain, e.activityError.code);
  }
});
```

**效果**：选的动作失败时，输出错误域和错误码。**未在模拟器验证。**

## 对应的 iOS API

`completionWithItemsHandler` 的参数 `activityError`。

## 参见

- [`UIActivityViewControllerCompletionEvent`](../ui-activity-view-controller-completion-event.md)

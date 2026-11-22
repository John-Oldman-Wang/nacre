---
type: reference
native: UIActivityViewControllerCompletionEvent.completed
---

# `UIActivityViewControllerCompletionEvent`：`completed` 属性

**`completed`** 属性表示用户选的动作做完了没有。

## 值

布尔值。

- 只读。给它赋值抛 `TypeError`。
- `true`：动作执行完了，比如信息 App 的发送界面被用户点了发送。分享出去的东西到没到对方手里，App 不知道。
- `false`：没做，包括用户直接把面板关掉。
- 用 [`new`](constructor.md) 创建时没给，是 `false`。

## 示例

```js
const sheet = new UIActivityViewController(['你好']);
sheet.addEventListener('complete', (e) => {
  console.log(e.completed ? '分享完成' : '没有分享');
});
```

**效果**：面板结束时，按结果输出 `分享完成` 或 `没有分享`。**未在模拟器验证。**

## 对应的 iOS API

`completionWithItemsHandler` 的参数 `completed`。

## 参见

- [`UIActivityViewControllerCompletionEvent`](../ui-activity-view-controller-completion-event.md)

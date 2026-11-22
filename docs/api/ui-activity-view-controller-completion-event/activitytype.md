---
type: reference
native: UIActivityViewControllerCompletionEvent.activityType
---

# `UIActivityViewControllerCompletionEvent`：`activityType` 属性

**`activityType`** 属性是用户选的去处。

## 值

字符串或 `null`：

- 只读。给它赋值抛 `TypeError`。
- 系统自带的动作是[系统动作的名字](../ui-activity-view-controller.md#系统动作的名字)，比如 `'copyToPasteboard'`、`'message'`。
- 第三方扩展是它自己的标识符，一个带点的字符串。
- 没选任何动作就把面板关掉了，是 `null`。
- 用 [`new`](constructor.md) 创建时没给，是 `null`。

## 示例

```js
const sheet = new UIActivityViewController([new URL('https://example.com')]);
sheet.addEventListener('complete', (e) => {
  if (e.activityType === 'copyToPasteboard') {
    console.log('复制了链接');
  }
});
```

**效果**：用户在面板里点「拷贝」之后，输出 `复制了链接`。**未在模拟器验证。**

## 对应的 iOS API

`completionWithItemsHandler` 的参数 `activityType`。

## 参见

- [`UIActivityViewControllerCompletionEvent`](../ui-activity-view-controller-completion-event.md)

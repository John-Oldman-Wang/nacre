---
type: reference
native: UIActivityViewController.completionWithItemsHandler
---

# `UIActivityViewController`：`complete` 事件

**`complete`** 事件在分享面板结束时派发：用户选的动作做完了（或者失败了），或者用户没选就把面板关了。

## 语法

```
sheet.addEventListener('complete', (event) => { })
```

## 事件对象

类型是 `UIActivityViewControllerCompletionEvent`。监听回调的参数类型是 `Event`，要读下面三个字段，先转一下类型，写法见[示例](#示例)。

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `completed` | `boolean` | `true`：用户选的动作做完了。`false`：没做，包括用户直接把面板关掉 |
| `activityType` | `string \| null` | 用户选的去处：[系统动作的名字](../ui-activity-view-controller.md#系统动作的名字)，或者第三方扩展自己的标识符（一个带点的字符串）。没选就关掉了是 `null` |
| `activityError` | [`NSError`](../ns-error.md) `\| null` | 动作失败时系统给的错误。`name` 是 `'NSError'`，`message` 是系统给的说明，`domain` 和 `code` 是系统的错误域和错误码。没有错误是 `null` |

- `type` 是 `'complete'`，`target` 是这个面板。
- 不能取消，`preventDefault()` 不起作用。

## 什么时候派发

- 面板结束时派发，一个面板只派发一次。派发时面板已经自己关掉了，App 不需要再关。
- `completed` 是 `true` 只表示那个动作执行完了，比如信息 App 的发送界面被用户点了发送。分享出去的东西到没到对方手里，App 不知道。
- 用代码 [`dismissViewController()`](../ui-view-controller/dismissviewcontroller.md) 关掉面板时派不派发 `complete`，**未在模拟器验证**。要在用代码关掉之后做的事，直接写在那一句后面，不依赖这个事件。
- 不需要知道结果就不用监听。面板不依赖监听器工作。

这个事件的派发时机和事件对象的内容，都**未在模拟器验证**。

## 示例

```js
const sheet = new UIActivityViewController([new URL('https://example.com')]);
sheet.addEventListener('complete', (event) => {
  const result = /** @type {UIActivityViewControllerCompletionEvent} */ (event);
  if (result.activityError !== null) {
    console.log('分享出错了：' + result.activityError.message);
  } else if (result.completed) {
    console.log('分享完成，去处是 ' + result.activityType);
  }
});
```

**效果**（**未在模拟器验证**）

- 用户完成分享时输出去处的名字，比如 `分享完成，去处是 copyToPasteboard`。
- 动作失败时输出错误信息。
- 用户直接关掉面板时什么都不输出。

## 对应的 iOS API

`UIActivityViewController.completionWithItemsHandler`。回调的四个参数里，`activityType`、`completed`、`activityError` 是事件对象的同名字段；`returnedItems` 还没有提供。

## 参见

- [面板什么时候结束](../ui-activity-view-controller.md#面板什么时候结束)
- [`dismiss`](../ui-view-controller/dismiss-event.md)：继承自页面的关闭事件

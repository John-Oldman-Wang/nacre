---
type: reference
native: UIPasteboardChangedNotification
---

# `UIPasteboard`：`change` 事件

**`change`** 事件在这个 App 自己修改了剪贴板的内容时派发。别的 App 修改剪贴板时不派发。

## 语法

```
pasteboard.addEventListener('change', (event) => { })
```

## 事件对象

`Event`，除了 `type`、`target` 没有别的字段。新的内容从 [`string`](string.md) 读，计数从 [`changeCount`](changecount.md) 读。

不能取消。

## 什么时候派发

- 这个 App 写了 [`string`](string.md)，包括写 `null` 清空。
- **一次写入派发两次。** 真机上写入一次收到 2 次 `change`；模拟器上连续写入两次收到 4 次。所以不要用收到事件的次数来计数，要知道变了几次读 `changeCount`。回调里的操作要能重复执行。
- **回调不是在写入的那一行同步执行，而是稍后执行。** 连续写两次时，四次回调里读到的 `changeCount` 是同一个值：回调执行时两次写入都已经完成。
- **别的 App 修改剪贴板时不派发**（真机实测）。App 在后台期间内容有没有变，回到前台后比较 `changeCount`。
- 只有添加了监听器才会派发。用 `removeEventListener()` 移除。
- 监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

## 示例

```js
const pasteboard = UIPasteboard.generalPasteboard;
pasteboard.addEventListener('change', () => {
  console.log('变了，现在的计数是 ' + pasteboard.changeCount);
});

pasteboard.string = '新的内容';
```

**效果**：输出两行 `变了，现在的计数是 …`，两行里的数相同。

## 对应的 iOS API

`UIPasteboardChangedNotification`。

## 参见

- [`changeCount`](changecount.md)：别的 App 改了内容时怎么得知

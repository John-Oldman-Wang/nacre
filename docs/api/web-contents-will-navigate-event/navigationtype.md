---
type: reference
native: WebContentsWillNavigateEvent.navigationType
---

# `WebContentsWillNavigateEvent`：`navigationType` 属性

**`navigationType`** 属性说明这次跳转是怎么引起的。

## 值

字符串，下面之一：

- 只读。给它赋值抛 `TypeError`。
- `'linkActivated'`：点了链接。
- `'formSubmitted'`：提交了表单。
- `'backForward'`：网页的脚本后退或前进。
- `'reload'`：网页的脚本刷新。
- `'formResubmitted'`：重新提交表单（**未在模拟器验证**）。
- `'other'`：其余的，最常见的是脚本改 `location`。
- 用 [`new`](constructor.md) 创建时没给，是 `'other'`。

## 示例

```js
const contents = new WebView().webContents;
contents.addEventListener('will-navigate', (e) => {
  if (e.navigationType === 'linkActivated') {
    console.log('用户点了链接', e.url);
  }
});
```

**效果**：用户在网页里点链接时，输出 `用户点了链接` 和地址。

## 对应的 iOS API

`navigationAction.navigationType`。

## 参见

- [`WebContentsWillNavigateEvent`](../web-contents-will-navigate-event.md)

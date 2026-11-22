---
type: reference
native: "UITextViewDelegate textView:primaryActionForTextItem:defaultAction:"
---

# `UITextView`：`linkclick` 事件

**`linkclick`** 事件在用户点了多行输入里富文本的一个链接时派发。监听器里调 `preventDefault()`，系统不打开这个链接，App 可以自己处理，比如在 App 里的页面打开。

富文本里的链接是带 `link` 属性的那一段文字，见[富文本](../ns-attributed-string.md)。

## 语法

```
input.addEventListener('linkclick', (event) => { })
```

## 事件对象

[`UITextViewLinkClickEvent`](../ui-text-view-link-click-event.md)。`type` 是 `'linkclick'`，`target` 是这块多行输入。可以取消（实测）。

另外带两个只读字段（实测）：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| [`url`](../ui-text-view-link-click-event/url.md) | 字符串 | 链接的地址 |
| [`range`](../ui-text-view-link-click-event/range.md) | [`NSRange`](../ns-range.md) | 链接在文字里的那一段。`location` 是起点，`length` 是长度，单位都是 UTF-16 码元，和 JS 字符串的下标一致 |

## 什么时候派发

- 用户点富文本里的链接时派发。按 Apple 的文档，[`isEditable`](iseditable.md) 是 `false`、[`isSelectable`](isselectable.md) 是 `true` 时链接才能点。真实的点按**未在真机验证**。
- 调了 `preventDefault()`：系统不打开这个链接。
- 没有调，或者没有监听器：系统照默认的做法打开链接，网址交给浏览器，别的协议交给对应的 App。
- 系统来问时监听器得到的字段、调不调 `preventDefault()` 交回给系统的结果，验收用例按系统的问法验过。
- 只对链接派发。富文本里的附件（比如插进文字里的图片）被点时不派发，照系统默认处理。
- [`dataDetectorTypes`](datadetectortypes.md) 识别出来的电话、网址被点时派不派发**未在真机验证**。
- 监听器是当场执行的。系统派发事件之后等监听器全部执行完，再决定做不做。
- 同一个事件有多个监听器时，只要有一个调了 `preventDefault()`，系统就不做。
- 监听器里抛出异常时，同一事件的其他监听器照常执行。异常在 [`application`](../application.md#没处理的异常不会让-app-退出) 上派发 `error`。抛异常不等于 `preventDefault()`。
- 最后一个监听器移除之后，系统不再派发这个事件，点链接照默认打开（实测）。
- 只在 `UITextView` 上有。在别的视图上监听不报错，它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发（实测）。

> **注意**：监听器执行期间系统在等。在监听器里只做判断，打开页面这类事放到判断之后做。

## 示例

```js
const terms = new UITextView();
terms.isEditable = false;
terms.attributedText = new NSAttributedString('阅读《用户协议》', { link: 'https://example.com/terms' });
terms.addEventListener('linkclick', (event) => {
  if (event.url.startsWith('https://example.com/')) {
    event.preventDefault();
    console.log('在 App 里打开 ' + event.url);
  }
});
```

**效果**：点这段文字，系统不切到浏览器，控制台输出 `在 App 里打开 https://example.com/terms`。别的网站的链接照常交给浏览器。**未在真机验证。**

## 对应的 iOS API

`UITextViewDelegate` 的 `textView:primaryActionForTextItem:defaultAction:`，`textItem` 的 `contentType` 是 `UITextItemContentTypeLink` 时派发。这里调 `event.preventDefault()` 对应返回 `nil`；不调对应返回 `defaultAction`。`textItem.link` 在 `event.url`，`textItem.range` 在 `event.range`。

## 参见

- [富文本](../ns-attributed-string.md)：怎么给一段文字加链接
- [`isEditable`](iseditable.md)
- [`NSRange`](../ns-range.md)

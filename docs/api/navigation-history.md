---
type: reference
native: WKBackForwardList
---

# `NavigationHistory`

**`NavigationHistory`** 表示一张网页的后退和前进：能不能后退、前进，以及后退、前进一页。

它从 [`webContents.navigationHistory`](web-contents/navigationhistory.md) 得到，一张网页只有一个。

**继承关系**：`NavigationHistory`（不继承 `EventTarget`，没有事件）

## 构造函数

不能用 `new` 创建：抛 `TypeError: Illegal constructor: NavigationHistory is created by the runtime, not by new`。从 [`webContents.navigationHistory`](web-contents/navigationhistory.md) 得到。

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`canGoBack()`](navigation-history/cangoback.md) | 能不能后退 |
| [`canGoForward()`](navigation-history/cangoforward.md) | 能不能前进 |
| [`goBack()`](navigation-history/goback.md) | 后退一页 |
| [`goForward()`](navigation-history/goforward.md) | 前进一页 |

能不能后退、前进在每次 [`did-navigate`](web-contents/did-navigate-event.md) 之后可能变化，在那个事件里重新读。

网页被销毁之后，四个方法都抛 `TypeError: Object has been destroyed`。

## 示例

```js
const contents = new WebView().webContents;
const history = contents.navigationHistory;
contents.addEventListener('did-navigate', () => {
  console.log('能后退', history.canGoBack(), '能前进', history.canGoForward());
});
await contents.loadURL('https://example.com/');
await contents.loadURL('https://example.com/about');
history.goBack();
```

**结果**：依次输出 `能后退 false 能前进 false`、`能后退 true 能前进 false`、`能后退 false 能前进 true`。

## 与 Electron 的对照

| Electron | 这里 | 差别 |
| --- | --- | --- |
| `contents.navigationHistory.canGoBack()` / `canGoForward()` | 相同 | |
| `contents.navigationHistory.goBack()` / `goForward()` | 相同 | |

## 对应的 iOS API

| ObjC（`WKWebView`） | JS |
| --- | --- |
| `webView.canGoBack` / `canGoForward` | `canGoBack()` / `canGoForward()` |
| `[webView goBack]` / `[webView goForward]` | `goBack()` / `goForward()` |

## 参见

- [`WebContents`](web-contents.md)：这个对象从它上面得到
- [后退、前进、刷新](../guides/web-pages.md#后退前进刷新)

---
type: reference
native: WKWebView.backForwardList
---

# `WebContents`：`navigationHistory` 属性

**`navigationHistory`** 属性是这张网页的后退和前进。

## 值

[`NavigationHistory`](../navigation-history.md)。

- 只读。给它赋值抛 `TypeError`。
- 每次读是同一个对象。

## 示例

```js
const contents = new WebView().webContents;
const history = contents.navigationHistory;
console.log(history === contents.navigationHistory, history.canGoBack());
```

**结果**：输出 `true false`。还没加载过网页，不能后退。

## 和 Electron 的差别

和 Electron 的 `contents.navigationHistory` 相同，只有 `canGoBack()`、`canGoForward()`、`goBack()`、`goForward()` 四个方法。对应的 iOS 原生成员是 `WKWebView` 的 `canGoBack`、`goBack` 这一组。

## 参见

- [`NavigationHistory`](../navigation-history.md)

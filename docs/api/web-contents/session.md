---
type: reference
native: WKWebViewConfiguration.websiteDataStore
---

# `WebContents`：`session` 属性

**`session`** 属性是这张网页的数据所在的存储分区。用它读写这张网页的 cookie、清掉网页留下的数据。

## 值

`Session`，见 [`session`](../session.md)。

- 只读。给它赋值抛 `TypeError`。
- 由建 `WebView` 时的 [`webPreferences.partition`](../web-view/constructor.md) 决定，之后不变。
- 同一个分区的网页拿到的是同一个对象，可以用 `===` 比较。

## 示例

```js
const a = new WebView({ webPreferences: { partition: 'persist:shop' } });
const b = new WebView({ webPreferences: { partition: 'persist:shop' } });
console.log(a.webContents.session === b.webContents.session);
console.log(a.webContents.session === session.fromPartition('persist:shop'));
```

**结果**：输出两行 `true`。

## 和 Electron 的差别

和 Electron 的 `contents.session` 相同。对应的 iOS 原生成员是 `WKWebViewConfiguration.websiteDataStore`。

## 参见

- [`session`](../session.md)：cookie 和清数据
- [存储分区](../web-view.md#存储分区)

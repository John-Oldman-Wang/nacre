---
type: reference
native: WKWebView
---

# `WebContents`：`destroyed` 事件

**`destroyed`** 事件在网页被 [`close()`](close.md) 销毁之后派发。

## 语法

```
contents.addEventListener('destroyed', (event) => {})
```

## 事件对象

`Event`，没有附加的字段。不可取消。

## 什么时候派发

调 `close()` 之后派发一次。`close()` 返回时 `isDestroyed()` 已经是 `true`，事件在那之后到。再调 `close()` 不会派发第二次。

## 示例

```js
const contents = new WebView().webContents;
contents.addEventListener('destroyed', () => console.log('销毁了'));
contents.close();
console.log(contents.isDestroyed());
```

**结果**：先输出 `true`，然后输出 `销毁了`。

## 和 Electron 的差别

和 Electron 的 `destroyed` 相同。

## 参见

- [`close()`](close.md)

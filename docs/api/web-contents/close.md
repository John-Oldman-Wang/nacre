---
type: reference
native: WKWebView
---

# `WebContents`：`close()` 方法

**`close()`** 方法销毁这张网页。网页的进程退出，它占的内存被释放。

## 语法

```
close()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

无。已经销毁的再调什么都不发生。

## 说明

- 调用之后 [`isDestroyed()`](isdestroyed.md) 立刻是 `true`，随后派发 [`destroyed`](destroyed-event.md)。
- 网页从屏幕上消失。`WebView` 还是一个视图，只是里面空了。不用了就和别的视图一样，从界面上移除。
- 之后除了 `close()` 和 `isDestroyed()`，其余方法都抛 `TypeError: Object has been destroyed`。
- 销毁时还在进行的 `loadURL`，它的 Promise 以 `AbortError` 拒绝。
- 网页那边还没答复的 `ipcRenderer.invoke` 请求全部被拒绝。
- 销毁不能撤销。要再显示网页，新建一个 `WebView`。

一张简单的网页在模拟器上实测占 60 MB 左右。不调 `close()` 时网页什么时候释放，见[内存和引用](../web-view.md#内存和引用)。

## 示例

```js
const web = new WebView();
const contents = web.webContents;
contents.addEventListener('destroyed', () => console.log('销毁了'));
contents.close();
console.log(contents.isDestroyed());
web.removeFromSuperview();
```

**结果**：先输出 `true`，然后输出 `销毁了`。

## 和 Electron 的差别

和 Electron 的 `contents.close()` 相同。对应的 iOS 原生写法是释放 `WKWebView`。

## 参见

- [`destroyed`](destroyed-event.md)
- [内存和引用](../web-view.md#内存和引用)

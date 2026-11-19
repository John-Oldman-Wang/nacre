---
type: reference
native: WKWebView
---

# `WebContents`：`isDestroyed()` 方法

**`isDestroyed()`** 方法返回这张网页是不是已经被 [`close()`](close.md) 销毁。

## 语法

```
isDestroyed()
```

### 参数

无。

### 返回值

布尔。

- `true`：已经销毁。之后除了 `close()` 和 `isDestroyed()`，其余方法都抛 `TypeError: Object has been destroyed`。
- `false`：还在。

变成 `true` 时派发 [`destroyed`](destroyed-event.md)。

### 异常

无。销毁之后也能调。

## 示例

```js
const contents = new WebView().webContents;
console.log(contents.isDestroyed());
contents.close();
console.log(contents.isDestroyed());
```

**结果**：依次输出 `false`、`true`。

## 和 Electron 的差别

和 Electron 的 `contents.isDestroyed()` 相同。

## 参见

- [`close()`](close.md)

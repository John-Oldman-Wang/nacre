---
type: reference
native: WKUserScript
---

# `contextBridge.exposeInMainWorld()` 方法

**`exposeInMainWorld()`** 方法把一个对象挂到网页的 `window` 上，名字由预加载脚本定。网页不能把这个名字换成别的对象。

## 语法

```
contextBridge.exposeInMainWorld(key, api)
```

### 参数

**`key`**

字符串，挂在 `window` 上的名字。

**`api`**

要挂上去的值，通常是一个对象，成员是几个方法。原样挂上去，不复制。

### 返回值

无（`undefined`）。

### 异常

**`Error`**

`window` 上已经有这个名字：`Cannot bind an API on top of an existing property on the window object`。

## 说明

- 挂上去的名字不可写、不可删：网页里 `window.app = 1` 不生效，`window.app` 还是原来的对象。
- 名字固定了，对象的成员没有：网页能修改、替换 `api` 的成员。
- 预加载脚本在网页自己的任何脚本之前执行，所以网页的第一段脚本执行时这个名字就已经在了。
- 换了网页，预加载脚本重新执行一遍，名字重新挂上。

提供的方法越少越好，每个方法只做一件事：提供 `share(id)` 这样的具体方法，不要提供「执行任意命令」「读任意键」这样的通用方法。

## 示例

```javascript
// JS/web/preload.js
contextBridge.exposeInMainWorld('app', {
  version: '1.0',
  share: (id) => ipcRenderer.send('share', id),
});
```

**效果**：网页里 `app.version` 是 `'1.0'`，`app.share(42)` 给 App 发一条 `share` 消息。网页执行 `window.app = 1` 之后 `typeof window.app` 还是 `'object'`。

## 和 Electron 的差别

和 Electron 的 `contextBridge.exposeInMainWorld(key, api)` 写法相同。Electron 在隔离的环境之间复制 `api`；这里不隔离，`api` 原样挂上去，网页能改它的成员。

## 参见

- [`ipcRenderer`](../ipc-renderer.md)

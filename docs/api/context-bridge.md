---
type: reference
native: WKUserScript
---

# `contextBridge`

**`contextBridge`** 表示预加载脚本往网页上挂东西的入口：把预加载脚本写的一组方法挂到网页的 `window` 上，网页的脚本就能调用它们。

它只在[预加载脚本](web-view.md#预加载脚本)里能用，和 [`ipcRenderer`](ipc-renderer.md) 一样是预加载脚本里直接能用的名字，不是网页的全局，App 的 `main.js` 里也没有。

预加载脚本和网页的脚本在同一个环境里执行，没有隔离：直接往 `window` 上赋值，网页同样看得到。用 `contextBridge` 挂的区别是网页不能把这个名字换成别的对象。

## 函数

| 方法 | 说明 |
| --- | --- |
| [`exposeInMainWorld()`](context-bridge/exposeinmainworld.md) | 把一个对象挂到网页的 `window` 上，网页改不掉这个名字 |

## 示例

预加载脚本 `JS/web/preload.js`：

```javascript
contextBridge.exposeInMainWorld('app', {
  share: (id) => ipcRenderer.send('share', id),
});
```

网页里：

```html
<button onclick="app.share(42)">分享</button>
```

**效果**：网页里 `typeof app` 是 `'object'`，网页自己的第一段脚本执行时它就已经在了。点按钮时 App 收到 `share` 消息。

## 与 Electron 的对照

| Electron | 这里 | 差别 |
| --- | --- | --- |
| `contextBridge.exposeInMainWorld(key, api)` | 相同 | 是预加载脚本里直接能用的名字。不隔离：`api` 原样挂上去，网页能改它的成员 |
| `contextBridge.exposeInIsolatedWorld` 等 | 没有 | |

## 对应的 iOS API

没有直接对应的原生成员。挂上去的是一个普通的 `window` 属性，由在文档开始时注入的 `WKUserScript` 写上。

## 还不能做的

| 想做的事 | 对应的能力 |
| --- | --- |
| 让预加载脚本和网页的脚本互相隔离 | Electron 的 `contextIsolation`；`WKContentWorld` |

## 参见

- [`ipcRenderer`](ipc-renderer.md)
- [预加载脚本](web-view.md#预加载脚本)

---
type: reference
native: UIOpenURLContext
status: partial
---

# `OpenURLEvent`

**`OpenURLEvent`** 表示一次「本 App 被一条链接打开」。它是 [`application`](application.md) 上 [`openurl`](application/openurl-event.md) 事件的事件对象，带着那条链接的地址、交给了哪个场景、从哪个 App 来。

两种来源都是它：自定义协议（`myapp://…`）和通用链接（`https://…`）。

**继承关系**：[`Event`](event.md) → `OpenURLEvent`

## 构造函数

[`OpenURLEvent()`](open-url-event/constructor.md)

自己构造一个，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发到 `application` 上，在测试里模拟一次打开。`url` 和 `scene` 必填。

## 实例属性

还继承 [`Event`](event.md) 的属性。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`url`](open-url-event/url.md) <small>只读</small> | 系统给的完整地址，原样 |
| [`scene`](open-url-event/scene.md) <small>只读</small> | 系统把这个地址交给了哪个场景 |
| [`sourceApplication`](open-url-event/sourceapplication.md) <small>只读</small> | 来源 App 的包名 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`application`](application.md) | [`openurl`](application/openurl-event.md) |

不能取消：`cancelable` 是 `false`，`preventDefault()` 不起作用。

## 示例

```js
application.addEventListener('openurl', (e) => {
  console.log(e instanceof OpenURLEvent, e.url);
});
```

**效果**（**未在模拟器验证**）：App 被 `myapp://orders/42` 打开时输出 `true myapp://orders/42`。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `UIOpenURLContext.URL`、`NSUserActivity.webpageURL` | `e.url` |
| `UIOpenURLContext.options.sourceApplication` | `e.sourceApplication` |

## 参见

- [`openurl`](application/openurl-event.md)
- [处理打开 App 的链接](../guides/open-links.md)

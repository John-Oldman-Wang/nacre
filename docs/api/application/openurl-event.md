---
type: reference
native: "-[UISceneDelegate scene:openURLContexts:]"
---

# `Application`：`openurl` 事件

**`openurl`** 事件在别的 App 或一条链接打开了本 App 时派发。

## 语法

```
application.addEventListener('openurl', (event) => { })
```

## 事件对象

[`OpenURLEvent`](../open-url-event.md)：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `url` | 字符串 | 系统给的完整地址，原样 |
| `scene` | [`UIWindowScene`](../ui-window-scene.md) | 系统把这个地址交给了哪个场景 |
| `sourceApplication` | 字符串或 `null` | 来源 App 的包名。系统不提供时是 `null` |

`target` 是 `application`。运行时派发的 `openurl`，`cancelable` 是 `false`。

## 什么时候派发

能打开 App 的链接有两种：

- **自定义协议**：`myapp://orders/42` 这样的地址。协议名（`myapp`）在 `nacre.config.json` 的 `ios.urlSchemes` 里声明，声明之后系统才把这种地址交给本 App。没声明的协议系统不会交给本 App，也就没有事件。
- **通用链接**：普通的 `https://` 地址。要在项目里声明关联的域名，并在那个域名的网站上放一份文件；系统核对通过后，才把这个域名下的链接交给本 App。

两种各自怎么配，见[配置 App](../../guides/project-config.md#声明自定义协议)。到了 JS 这边两种都是 `openurl`，按 `url` 的开头区分。

- **App 没在运行时也收得到。** 用户点链接时 App 还没启动，系统先启动 App；运行时在那个场景的 [`sceneconnect`](sceneconnect-event.md) 之后派发 `openurl`。所以监听器要在 `main.js` 的顶层注册。事件不会补发，也没有别的方法可以查「App 是被哪条链接启动的」。
- App 已经在运行时（在前台，或者在后台还没被系统结束），只派发 `openurl`，不派发 `sceneconnect`。
- 系统一次交来几个地址时，每个地址派发一次。
- 本 App 自己调 [`openURL()`](openurl.md) 往外打开别的 App，不派发这个事件。
- 回调稍后执行，见[运行时怎么工作](../how-it-works.md#事件)。

这一节的行为**未在模拟器验证**；监听器的注册、事件对象的字段和构造在验收用例里有断言。

> **注意**：地址是外部输入。任何 App、任何网页都可以拼出一条 `myapp://` 开头的地址来打开本 App，运行时不检查地址的内容。转账、改设置、登录这类操作不能只凭地址里的参数就执行，见指南[处理打开 App 的链接](../../guides/open-links.md)。

## 示例

```js
application.addEventListener('openurl', (e) => {
  const url = new URL(e.url);
  console.log('被打开', url.protocol, url.hostname, url.pathname, url.searchParams.get('ref'));
});
```

**效果**（**未在模拟器验证**）：别的 App 或网页打开 `myapp://orders/42?ref=mail` 时，App 切到前台，控制台输出 `被打开 myapp: orders /42 mail`。

在模拟器上不需要另一个 App 就能试，在终端里执行：

```bash
xcrun simctl openurl booted 'myapp://orders/42?ref=mail'
```

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `scene:openURLContexts:` | `openurl` |
| `scene:continueUserActivity:`，活动类型是 `NSUserActivityTypeBrowsingWeb` | `openurl` |
| `scene:willConnectToSession:options:` 里 `connectionOptions` 的 `URLContexts` 和 `userActivities` | 同一个 `openurl`，在 `sceneconnect` 之后派发 |
| `UIOpenURLContext.URL`、`NSUserActivity.webpageURL` | `e.url` |
| `UIOpenURLContext.options.sourceApplication` | `e.sourceApplication` |

## 参见

- [处理打开 App 的链接](../../guides/open-links.md)
- [`OpenURLEvent`](../open-url-event.md)
- [配置 App](../../guides/project-config.md#声明自定义协议)
- [`URL`](../url.md)：拆开地址

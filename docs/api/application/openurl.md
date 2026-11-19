---
type: reference
native: "-[UIApplication openURL:options:completionHandler:]"
---

# `Application`：`openURL()` 方法

**`openURL()`** 方法把一个 URL 交给系统打开：网址由浏览器打开，`tel:` 由电话打开，其他 App 注册过的协议由那个 App 打开。

## 语法

```
openURL(url)
```

### 参数

**`url`**

字符串。不是字符串的值会先转成字符串。

### 返回值

`Promise<boolean>`。

- `true`：系统打开了它。合法 URL 兑现为 `true` 验证过。
- `false`：URL 不合法，或者没有 App 能处理它。这时 App 不会被切走。

### 异常

无。不抛错，Promise 也不会被拒绝。失败只通过 `false` 表示。

## 说明

- 本 App 自己调 `openURL()` 往外打开别的 App，不派发 [`openurl`](openurl-event.md)。
- 打开之前先问系统能不能打开（`canOpenURL:`）不提供：直接调 `openURL()`，按兑现的值判断。
- 场景上有同名的方法 [`UIWindowScene.openURL()`](../ui-window-scene/openurl.md)。

## 示例

```js
application.openURL('https://example.com').then((ok) => {
  console.log('打开成功了吗', ok);
});
```

**效果**：系统切到浏览器并打开这个网址，控制台输出 `打开成功了吗 true`。**切到浏览器这一步未在模拟器验证。**

```js
application.openURL('nacre-nonexistent-scheme://test').then((ok) => {
  console.log(ok);
});
application.openURL('这不是一个合法 URL::::').then((ok) => {
  console.log(ok);
});
```

**结果**：两次都输出 `false`。第一个是没有 App 能处理这个协议，第二个是 URL 本身不合法。App 不会被切走。

## 对应的 iOS API

`-[UIApplication openURL:options:completionHandler:]`。`options` 还没有提供；`completionHandler` 换成返回的 Promise。

## 参见

- [`openurl`](openurl-event.md)：别的 App 打开本 App

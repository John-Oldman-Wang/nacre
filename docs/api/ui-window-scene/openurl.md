---
type: reference
native: "-[UIScene openURL:options:completionHandler:]"
---

# `UIWindowScene`：`openURL()` 方法

**`openURL()`** 方法让系统打开一个 URL：跳到 Safari、拨号、跳到别的 App。

## 语法

```
openURL(url)
```

### 参数

**`url`**

字符串。传入的值会先转成字符串。

### 返回值

`Promise<boolean>`。系统打开成功时兑现为 `true`。以下情况兑现为 `false`：

- `url` 不是合法的 URL。
- 没有 App 能处理这个 URL，或者系统拒绝打开。**这一条的兑现值未在模拟器验证。**

### 异常

无。不抛错，Promise 也不会被拒绝。

## 说明

[`application.openURL()`](../application/openurl.md) 是 App 级的同名方法，两个都可以用。

验收用例里运行过的是一个没有 App 能处理的地址（`nacre-nonexistent-scheme://test`）：Promise 正常兑现，不抛错，App 留在前台。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  e.scene.openURL('https://example.com').then((ok) => {
    console.log('打开结果:', ok);
  });
});
```

**效果**：系统用 Safari 打开这个网址，App 进入后台，控制台输出 `打开结果: true`。**未在模拟器验证。**

## 对应的 iOS API

`-[UIScene openURL:options:completionHandler:]`。`options` 还没有提供；`completionHandler` 换成返回的 Promise。

## 参见

- [`application.openURL()`](../application/openurl.md)

---
type: reference
native: UIOpenURLContext.URL
---

# `OpenURLEvent`：`url` 属性

**`url`** 属性是系统给的完整地址，原样，例如 `'myapp://orders/42?ref=mail'`。

## 值

字符串。

- 只读。给它赋值抛 `TypeError`。
- 运行时不解析它，要拆开用 [`new URL(e.url)`](../url.md)。
- 自定义协议以协议名开头，通用链接以 `https://` 开头。
- 地址是外部输入，任何 App、任何网页都可以拼出来，不能直接相信。

## 示例

```js
application.addEventListener('openurl', (e) => {
  const url = new URL(e.url);
  console.log(url.hostname, url.pathname);
});
```

**效果**（**未在模拟器验证**）：被 `myapp://orders/42` 打开时输出 `orders /42`。

## 对应的 iOS API

`UIOpenURLContext.URL`、`NSUserActivity.webpageURL`。

## 参见

- [`URL`](../url.md)

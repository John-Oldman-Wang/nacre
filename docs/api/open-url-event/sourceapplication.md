---
type: reference
native: UIOpenURLContext.options.sourceApplication
---

# `OpenURLEvent`：`sourceApplication` 属性

**`sourceApplication`** 属性是来源 App 的包名。

## 值

字符串，或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 系统不提供时是 `null`：通用链接一律是 `null`；自定义协议只有来源 App 和本 App 属于同一个开发者团队时才有值。这一条来自 Apple 的文档，**未在模拟器验证**。
- 自己构造事件而没传时是 `null`。

## 示例

```js
application.addEventListener('openurl', (e) => {
  console.log('来自', e.sourceApplication ?? '未知的 App');
});
```

**效果**（**未在模拟器验证**）：通用链接打开时输出 `来自 未知的 App`。

## 对应的 iOS API

`UIOpenURLContext.options.sourceApplication`。

## 参见

- [`url`](url.md)

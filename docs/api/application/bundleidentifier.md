---
type: reference
native: NSBundle.mainBundle.bundleIdentifier
---

# `Application`：`bundleIdentifier` 属性

**`bundleIdentifier`** 属性是 App 的包名：App 在系统里的唯一标识，写法像倒过来的域名。

## 值

字符串，比如 `'com.example.shop'`。

- 只读。给它赋值抛 `TypeError`。
- 值来自项目 [`nacre.config.json`](../../guides/project-config.md) 里的 `bundleId`。等于 `info.CFBundleIdentifier`。
- 运行期间不变，所以没有变化事件。

## 示例

```js
console.log(application.bundleIdentifier);
```

**结果**：包名是 `com.example.shop` 的 App 输出 `com.example.shop`。

## 对应的 iOS API

`NSBundle.mainBundle.bundleIdentifier`。

## 参见

- [`info`](info.md)

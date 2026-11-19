---
type: reference
native: NSBundle.infoDictionary
---

# `NSBundle`：`infoDictionary` 属性

**`infoDictionary`** 属性是包的 Info.plist，转成 JS 对象。

## 值

对象或 `null`。

- 只读。给它赋值抛 `TypeError`。
- 每次读给一个新对象，改它不影响包。
- 日期和二进制数据这类 JS 对象表示不了的值会先转换。
- App 的包更常用 [`application.info`](../application/info.md)，内容相同。

## 示例

```js
const info = NSBundle.mainBundle.infoDictionary;
console.log(info !== null && info.CFBundleIdentifier);
```

**结果**：输出 App 的包名。

## 对应的 iOS API

`NSBundle.infoDictionary`。

## 参见

- [`NSBundle`](../ns-bundle.md)
- [`objectForInfoDictionaryKey()`](objectforinfodictionarykey.md)

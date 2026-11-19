---
type: reference
native: UIDevice.systemName
---

# `UIDevice`：`systemName` 属性

**`systemName`** 属性是操作系统的名字。

## 值

字符串。iPhone 上是 `'iOS'`。

- 只读。给它赋值抛 `TypeError`，原值不变。
- App 运行期间不变，所以没有变化通知。

## 示例

```js
console.log(UIDevice.currentDevice.systemName);
```

**结果**：在 iPhone 上输出 `iOS`。

## 对应的 iOS API

`UIDevice.systemName`。

## 参见

- [`systemVersion`](systemversion.md)：系统的版本

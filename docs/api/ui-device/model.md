---
type: reference
native: UIDevice.model
---

# `UIDevice`：`model` 属性

**`model`** 属性是设备的种类。

## 值

字符串。iPhone 上是 `'iPhone'`，模拟器上也是。

- 只读。给它赋值抛 `TypeError`，原值不变。
- App 运行期间不变，所以没有变化通知。
- 它不是具体的型号：分不出 iPhone 14 和 iPhone Air。具体的型号现在读不到。

## 示例

```js
console.log(UIDevice.currentDevice.model);
```

**结果**：在 iPhone 和 iPhone 模拟器上都输出 `iPhone`。

## 对应的 iOS API

`UIDevice.model`。

## 参见

- [`localizedModel`](localizedmodel.md)：按系统语言翻译后的写法
- [`userInterfaceIdiom`](userinterfaceidiom.md)：界面的类型

---
type: reference
native: UIDevice.localizedModel
---

# `UIDevice`：`localizedModel` 属性

**`localizedModel`** 属性是 [`model`](model.md) 按系统语言翻译后的写法。

## 值

字符串。

- 只读。给它赋值抛 `TypeError`，原值不变。
- 系统语言是英文时实测是 `'iPhone'`。其他语言下的值**未在模拟器验证**。
- 系统语言在 App 运行期间改变时这个值会不会跟着变**未在模拟器验证**；运行时不派发它的变化通知。

## 示例

```js
console.log(UIDevice.currentDevice.localizedModel);
```

**结果**：系统语言是英文时输出 `iPhone`。

## 对应的 iOS API

`UIDevice.localizedModel`。

## 参见

- [`model`](model.md)

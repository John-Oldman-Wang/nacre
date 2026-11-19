---
type: reference
native: UIDevice.name
---

# `UIDevice`：`name` 属性

**`name`** 属性是设备的名字。它读不到用户在「设置」里给设备起的名字。

## 值

字符串。

- 只读。给它赋值抛 `TypeError`，原值不变。
- 真机（iPhone 14）上实测是 `'iPhone'`，和 [`model`](model.md) 相同。
- 模拟器上实测是模拟器的名字，比如 `'iPhone Air'`。
- App 运行期间不变，所以没有变化通知。

所以不要拿 `name` 显示「某某的 iPhone」，也不要用它判断机型。

## 示例

```js
console.log(UIDevice.currentDevice.name);
```

**结果**：真机上输出 `iPhone`；在名为 iPhone Air 的模拟器上输出 `iPhone Air`。

## 对应的 iOS API

`UIDevice.name`。读到用户起的名字需要 Apple 单独批准的权限，运行时没有提供。

## 参见

- [`model`](model.md)

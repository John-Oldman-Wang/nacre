---
type: reference
native: UIView.restorationIdentifier
---

# `UIView`：`restorationIdentifier` 属性

**`restorationIdentifier`** 属性是系统保存和恢复界面状态时用来认出这个视图的名字。

## 值

字符串，或者 `null`。

- 可读，可写。
- 默认值**未在模拟器验证**，按 Apple 的文档是 `null`。
- 写入 `null` 或 `undefined` 得到 `null`，其他值转成字符串。
- 读出来的类型、写回原值读到的不变，在验收用例里核对过。
- 系统的状态恢复在 Nacre 里没有接入，设了它之后有没有效果**未在模拟器验证**。

## 示例

```js
const view = new UIView();
view.restorationIdentifier = 'profile-header';
console.log(view.restorationIdentifier);
```

**结果**：输出 `profile-header`。**未在模拟器验证。**

## 对应的 iOS API

`UIView.restorationIdentifier`。

## 参见

- [`UIView`](../ui-view.md)

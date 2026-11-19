---
type: reference
native: UIView.focusGroupIdentifier
---

# `UIView`：`focusGroupIdentifier` 属性

**`focusGroupIdentifier`** 属性是视图所属的焦点分组的名字。用键盘在界面上移动焦点时，同一个分组里的元素放在一起切换。

## 值

字符串，或者 `null`。

- 可读，可写。
- 默认值**未在模拟器验证**。
- 写入 `null` 或 `undefined` 得到 `null`，其他值转成字符串。
- 读出来的类型、写回原值读到的不变，在验收用例里核对过。效果**未在模拟器验证**。

## 示例

```js
const toolbar = new UIView();
toolbar.focusGroupIdentifier = 'toolbar';
console.log(toolbar.focusGroupIdentifier);
```

**结果**：输出 `toolbar`。**未在模拟器验证。**

## 对应的 iOS API

`UIView.focusGroupIdentifier`。

## 参见

- [`canBecomeFocused`](canbecomefocused.md)

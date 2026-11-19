---
type: reference
native: UIView.canBecomeFocused
---

# `UIView`：`canBecomeFocused` 属性

**`canBecomeFocused`** 属性表示这个视图能不能得到焦点。焦点是用键盘或遥控器在界面上移动时，当前选中的那一个元素。

## 值

布尔。`true`：能得到焦点。`false`：不能。

- 只读。给它赋值抛 `TypeError`。
- 读出来的类型在验收用例里核对过。具体取值和什么时候变化**未在模拟器验证**。

## 示例

```js
const view = new UIView();
console.log(typeof view.canBecomeFocused);
```

**结果**：输出 `boolean`。

## 对应的 iOS API

`UIView.canBecomeFocused`。ObjC 里子类覆写它来决定能不能得到焦点，这里只能读。

## 参见

- [`isFocused`](isfocused.md)
- [`focusGroupIdentifier`](focusgroupidentifier.md)

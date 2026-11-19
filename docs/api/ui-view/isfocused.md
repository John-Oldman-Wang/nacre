---
type: reference
native: UIView.focused
---

# `UIView`：`isFocused` 属性

**`isFocused`** 属性表示这个视图此刻是否得到了焦点。

## 值

布尔。`true`：此刻有焦点。`false`：没有。

- 只读。给它赋值抛 `TypeError`。
- 读出来的类型在验收用例里核对过。具体取值和什么时候变化**未在模拟器验证**。

## 示例

```js
const view = new UIView();
console.log(view.isFocused);
```

**结果**：新建的视图输出 `false`。**未在模拟器验证。**

## 对应的 iOS API

`UIView.focused`，ObjC 的读取名是 `isFocused`。

## 参见

- [`canBecomeFocused`](canbecomefocused.md)

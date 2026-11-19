---
type: reference
native: UITextField.leftView
---

# `UITextField`：`leftView` 属性

**`leftView`** 属性是显示在框里左端的视图，比如一个图标。什么时候显示由 [`leftViewMode`](leftviewmode.md) 决定。

## 值

[`UIView`](../ui-view.md)，或者 `null`。

- 可读，可写。
- 写进去读回来是同一个对象（实测）。
- 这个属性是按 iOS 的头文件补上的。验收用例验证过它读得出来、类型对、写回原值读到的不变；默认值和各取值的效果**未在模拟器验证**，用法照 Apple 的文档。
- 没有变化事件：改它的只有 App 自己的代码。

### 写错时

写了不是视图的值：抛 `TypeError`（实测）。

## 示例

```js
const field = new UITextField();
const icon = new UIImageView();
icon.image = UIImage.systemImageNamed('magnifyingglass');
field.leftView = icon;
field.leftViewMode = 'always';
console.log(field.leftView === icon);
```

**效果**：输入框左端一直显示一个放大镜。控制台输出 `true`。图标的位置**未在模拟器验证**。

## 对应的 iOS API

`UITextField.leftView`。

## 参见

- [`leftViewMode`](leftviewmode.md)
- [`leftViewRectForBounds()`](leftviewrectforbounds.md)

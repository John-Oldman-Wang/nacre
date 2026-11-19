---
type: reference
native: UIView.tintColor
---

# `UIView`：`tintColor` 属性

**`tintColor`** 属性是视图的强调色：系统按钮的文字、模板图片、开关这类控件用它着色。子视图没有自己设时继承父视图的。

## 值

[颜色](../ui-color.md)字符串，或者 `null`。

- 可读，可写。
- 写入时接受颜色字符串，也接受 `UIColor` 对象。写颜色名，原样读回（实测）。
- 写 `null` 表示不自己设，用父视图的。新建视图读出来的默认值**未在模拟器验证**。
- 子类（[`UIButton`](../ui-button.md)、[`UITextField`](../ui-text-field.md) 等）上一样能用（实测）。
- 子视图继承父视图的强调色**未在模拟器验证**。

### 写错时

写入不合法的颜色：不抛异常，控制台输出一条警告，颜色保持原值。

## 示例

```js
const parent = new UIView();
const child = UIButton.buttonWithType('system');
child.setTitle('提交', { forState: ['normal'] });
parent.addSubview(child);

parent.tintColor = 'systemRed';
console.log(parent.tintColor);
```

**效果**：`child` 的文字显示成红色（**未在模拟器验证**）。控制台输出 `systemRed`。

## 对应的 iOS API

`UIView.tintColor`。

## 参见

- [`tintAdjustmentMode`](tintadjustmentmode.md)
- [颜色](../ui-color.md)

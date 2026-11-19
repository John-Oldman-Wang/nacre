---
type: reference
native: UIColorWell.selectedColor
---

# `UIColorWell`：`selectedColor` 属性

**`selectedColor`** 属性是取色控件选中的颜色。控件和取色面板都显示这个颜色。

## 值

[颜色](../ui-color.md)字符串，或者 `null`。

- 可读，可写。
- 默认值是 `null`：没有选中的颜色。
- 合法写入的颜色原样读回：写 `'#ff0000'` 读回 `'#ff0000'`，写 `'systemBlue'` 读回 `'systemBlue'`。
- 写 `null` 去掉选中的颜色，读回 `null`。
- 写进去的颜色在点开的取色面板上显示为当前颜色（在模拟器上看过）。
- 代码写这个属性不派发 [`change`](../ui-control/change-event.md)。
- 用户在面板里选了颜色之后，这个属性变成用户选的颜色，并派发 `change`。**未在模拟器验证。** 用户选的颜色读出来是什么形式的字符串，也**未在模拟器验证**。

### 写错时

写入不合法的颜色：不抛异常，控制台输出一条警告，颜色保持原来的值，见[颜色](../ui-color.md#写错不抛打警告)。

## 示例

```js
const well = new UIColorWell();
well.selectedColor = 'systemOrange';
console.log(well.selectedColor);
well.addEventListener('change', () => {
  console.log('用户选了', well.selectedColor);
});
```

**结果**：先输出 `systemOrange`。用户在面板里选了颜色之后输出 `用户选了` 和颜色，**未在模拟器验证**。

## 对应的 iOS API

`UIColorWell.selectedColor`。ObjC 里是 `UIColor` 对象，这里是颜色字符串。

## 参见

- [`change` 事件](../ui-control/change-event.md)
- [颜色](../ui-color.md)：颜色字符串的写法

---
type: reference
native: UIColorWell.maximumLinearExposure
---

# `UIColorWell`：`maximumLinearExposure` 属性

**`maximumLinearExposure`** 属性是取色面板上能选的颜色的最大线性曝光值。它用于高动态范围（HDR）颜色，HDR 颜色可以比普通的白色更亮。

## 值

数，没有单位。

- 可读，可写。
- 默认值是 `0`（在模拟器上量的）。
- 各个取值对取色面板的效果**未在模拟器验证**。具体含义见 Apple 的文档。
- 写入的值按 `Number()` 转换：写 `'4'` 得到 4。
- 没有变化事件。只有 App 自己的代码会改它。

### 写错时

写入转不成有限数的值（`'abc'`、`undefined`、`NaN`）抛 `TypeError`，原值不变：

```
TypeError: maximumLinearExposure must be a finite number, got "abc"
```

## 示例

```js
const well = new UIColorWell();
well.maximumLinearExposure = 2;
console.log(well.maximumLinearExposure);
```

**结果**：输出 `2`。取色面板上的变化**未在模拟器验证**。

## 对应的 iOS API

`UIColorWell.maximumLinearExposure`。

## 参见

- [`selectedColor`](selectedcolor.md)

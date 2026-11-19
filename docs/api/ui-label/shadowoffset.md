---
type: reference
native: UILabel.shadowOffset
---

# `UILabel`：`shadowOffset` 属性

**`shadowOffset`** 属性是文字阴影相对文字的偏移。

## 值

[`CGSize`](../structs.md)，单位 [pt](../units.md)。

- 可读，可写。
- `width` 是向右的偏移，`height` 是向下的偏移。负数表示向左、向上。
- 默认值是 `(0, -1)`，即向上 1 pt（**未在模拟器验证**）。
- 写入时可以给 `CGSize`，也可以给 `{ width, height }`。
- 读出来的 `CGSize` 是只读的。要改偏移，赋一个新的值，见[结构体](../structs.md)。
- 只有 [`shadowColor`](shadowcolor.md) 不是 `null` 时才看得到阴影。

### 写错时

**`TypeError`**

- 给的不是对象：`shadowOffset needs an object with all of: width, height`。
- 缺字段，或字段不是有限的数：`shadowOffset is missing height, or it is not a finite number`。

## 示例

```js
const label = new UILabel();
label.shadowColor = 'rgba(0,0,0,.25)';
label.shadowOffset = { width: 1, height: 2 };
console.log(label.shadowOffset.width, label.shadowOffset.height);
```

**效果**：阴影在文字右边 1 pt、下面 2 pt。控制台输出 `1 2`。阴影在屏幕上的样子**未在模拟器验证**。

## 对应的 iOS API

`UILabel.shadowOffset`。`CGSizeMake(0, -1)` 写成 `new CGSize(0, -1)`。

## 参见

- [`shadowColor`](shadowcolor.md)
- [结构体](../structs.md)

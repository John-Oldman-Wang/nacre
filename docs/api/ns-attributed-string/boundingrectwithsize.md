---
type: reference
native: "-[NSAttributedString boundingRectWithSize:options:context:]"
---

# `NSAttributedString`：`boundingRectWithSize()` 方法

**`boundingRectWithSize()`** 方法返回这段富文本限定在一个大小里排时需要多大。量多行文字的高度用它。

## 语法

```
boundingRectWithSize(size, [{ options }])
```

### 参数

**`size`**

限定的大小，[`CGSize`](../structs.md) 或 `{ width, height }`，单位 [pt](../units.md)。某个方向不限就给一个很大的数，比如 `Number.MAX_VALUE`。

**`options.options`**

可选。选项名的数组，不给等于空数组：

| 取值 | 效果 |
| --- | --- |
| `'usesLineFragmentOrigin'` | 按多行排。量多行文字必须带它，不带时按一行算 |
| `'usesFontLeading'` | 行高算上字体自带的行间距 |
| `'usesDeviceMetrics'` | 按字形实际画出来的范围算，而不是排版用的范围 |
| `'truncatesLastVisibleLine'` | 放不下时最后一行按截断算 |

### 返回值

[`CGRect`](../structs.md)，单位 pt。结果带小数，用作视图的大小时向上取整。

### 异常

**`TypeError`**

- `size` 缺字段。
- `options` 不是数组：`boundingRectWithSize options must be an array of option names, got …`。
- 选项名不认识。

## 示例

```js
const text = new NSAttributedString('一段比较长的文字，一行放不下的时候会折行。', {
  font: UIFont.systemFontOfSize(17),
});
const wrapped = text.boundingRectWithSize(
  new CGSize(200, Number.MAX_VALUE),
  { options: ['usesLineFragmentOrigin'] },
);
console.log(Math.ceil(wrapped.height));
```

**结果**：控制台输出限宽 200 pt 时需要的高度，单位 pt。具体数值**未在模拟器验证**。

## 对应的 iOS API

`-[NSAttributedString boundingRectWithSize:options:context:]`。`context` 没有提供。`CGFLOAT_MAX` 写成 `Number.MAX_VALUE`；`NSStringDrawingUsesLineFragmentOrigin` 写成 `'usesLineFragmentOrigin'`。

## 参见

- [`size()`](size.md)

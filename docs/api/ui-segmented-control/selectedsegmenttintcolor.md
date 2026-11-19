---
type: reference
native: UISegmentedControl.selectedSegmentTintColor
---

# `UISegmentedControl`：`selectedSegmentTintColor` 属性

**`selectedSegmentTintColor`** 属性是选中的那一段底下那块的颜色。

## 值

颜色字符串，或者 `null`。

- 可读，可写。
- 默认值是 `null`：系统默认的颜色。
- 写入颜色字符串（`'#007aff'`、`'systemBlue'`）或 `UIColor` 对象；写入的字符串原样读回。
- 写 `null` 回到系统默认的颜色。
- 颜色在屏幕上的效果**未在模拟器验证**。

### 写错时

写入认不出的颜色：不抛异常，控制台输出一条警告，属性保持原来的值。颜色的写法见[颜色](../ui-color.md)。

## 示例

```js
const seg = new UISegmentedControl(['日', '周']);
seg.selectedSegmentIndex = 0;
seg.selectedSegmentTintColor = '#007aff';
console.log(seg.selectedSegmentTintColor);
```

**结果**：输出 `#007aff`。选中的那一段底下是蓝色。**颜色的样子未在模拟器验证。**

## 对应的 iOS API

`UISegmentedControl.selectedSegmentTintColor`，原生的类型是 `UIColor`。

## 参见

- [颜色](../ui-color.md)

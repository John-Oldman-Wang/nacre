---
type: reference
native: UIImage.scale
---

# `UIImage`：`scale` 属性

**`scale`** 属性是图片的倍率：一个点对应几个像素。

## 值

数，没有单位。

- `imageNamed()` 取到的图，按系统选中的文件决定：选了 `@3x` 的文件是 3。
- `imageWithData()` 取到的图，不传 `scale` 时是 1。
- 像素数等于 [`size`](size.md) 乘以 `scale`。

- 只读。给它赋值抛 `TypeError`。
- 图片不可变，这个值不会变，所以没有变化通知。

## 示例

```js
const dot = UIImage.imageNamed('JS/assets/dot');
if (dot) {
  console.log(dot.scale);
  console.log(dot.size.width * dot.scale);
}
```

**结果**：在 @3x 屏幕的设备上依次输出 `3`、`30`。`3` 表示系统选了 `dot@3x.png`。

## 对应的 iOS API

`UIImage.scale`。

## 参见

- [`size`](size.md)

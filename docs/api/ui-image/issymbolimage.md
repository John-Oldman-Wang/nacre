---
type: reference
native: UIImage.symbolImage
---

# `UIImage`：`isSymbolImage` 属性

**`isSymbolImage`** 属性表示这张图是不是 SF Symbols 图标。

## 值

布尔。

- `true`：这张图是 SF Symbols 图标，由 [`systemImageNamed()`](systemimagenamed.md) 取得。
- `false`：普通图片。

- 只读。给它赋值抛 `TypeError`。
- 图片不可变，这个值不会变，所以没有变化通知。

## 示例

```js
const star = UIImage.systemImageNamed('star.fill');
if (star) {
  console.log(star.isSymbolImage);
}
```

**结果**：控制台输出 `true`。

## 对应的 iOS API

`UIImage.symbolImage`。

## 参见

- [`systemImageNamed()`](systemimagenamed.md)

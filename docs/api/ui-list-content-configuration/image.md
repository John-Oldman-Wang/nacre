---
type: reference
native: UIListContentConfiguration.image
---

# `UIListContentConfiguration`：`image` 属性

**`image`** 属性是文字左边的图片。

## 值

[`UIImage`](../ui-image.md)，或者 `null`。

- 可读，可写。
- 默认值是 `null`。
- 写 `null` 清掉（实测）。

### 写错时

写了不是 `UIImage` 的对象（比如一个视图）：抛 `TypeError`（实测）。

## 示例

```js
const content = UIListContentConfiguration.subtitleCellConfiguration();
content.image = UIImage.systemImageNamed('star');
content.text = '收藏';
```

**效果**：「收藏」左边显示一个星形图标。

## 对应的 iOS API

`UIListContentConfiguration.image`。

## 参见

- [`UIImage`](../ui-image.md)

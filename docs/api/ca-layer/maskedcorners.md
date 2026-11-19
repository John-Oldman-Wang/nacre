---
type: reference
native: CALayer.maskedCorners
---

# `CALayer`：`maskedCorners` 属性

**`maskedCorners`** 属性列出哪几个角是圆角。

## 值

角名的数组：

| 角名 | 哪个角 |
| --- | --- |
| `'minXMinY'` | 左上 |
| `'maxXMinY'` | 右上 |
| `'minXMaxY'` | 左下 |
| `'maxXMaxY'` | 右下 |

名字里的 `minX` 是左边，`maxX` 是右边，`minY` 是上边，`maxY` 是下边，因为 y 轴朝下。

- 可读，可写。
- 默认值是四个角都有。
- 空数组表示四个角都是直角。
- 读出来的数组按上表的顺序排列。

### 写错时

- 数组里有写错的角名时不抛异常：整次赋值不生效，属性保持原来的值，控制台输出一条警告。数组里写对的角名不会被单独应用：

  ```
  [Nacre] maskedCorners has no value "topLeft"; expected one of: minXMinY / maxXMinY / minXMaxY / maxXMaxY, ignored
  ```

- 给的不是数组抛 `TypeError`：`maskedCorners needs an array of names; expected any of: …`。

## 示例

```js
const layer = new CALayer();
layer.cornerRadius = 16;
layer.maskedCorners = ['maxXMinY', 'minXMinY'];
console.log(layer.maskedCorners.join(','));
```

**效果**：左上角和右上角是圆角，下面两个角是直角。控制台输出 `minXMinY,maxXMinY`。

## 对应的 iOS API

`CALayer.maskedCorners`。位掩码 `kCALayerMinXMinYCorner | kCALayerMaxXMinYCorner` 写成 `['minXMinY', 'maxXMinY']`。

## 参见

- [`cornerRadius`](cornerradius.md)
- [枚举](../enums.md)

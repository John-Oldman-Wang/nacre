---
type: reference
native: UIImage.imageOrientation
---

# `UIImage`：`imageOrientation` 属性

**`imageOrientation`** 属性是图片存储时的方向标记。相机拍的照片常常按横向存储，再用这个标记说明显示时怎么转正。

## 值

字符串，下面几个之一：

| 取值 | 含义 |
| --- | --- |
| `'up'` | 不需要旋转。验收用例里从 App 包取到的 PNG 是这个值 |
| `'down'` | 存储的像素旋转了 180° |
| `'left'` | 存储的像素逆时针旋转了 90° |
| `'right'` | 存储的像素顺时针旋转了 90° |
| `'upMirrored'`、`'downMirrored'`、`'leftMirrored'`、`'rightMirrored'` | 在对应方向的基础上再做一次镜像翻转 |

除 `'up'` 以外的取值**未在模拟器验证**。显示图片时系统自动按这个标记转正，一般不需要读它。

- 只读。给它赋值抛 `TypeError`。
- 图片不可变，这个值不会变，所以没有变化通知。

## 示例

```js
const dot = UIImage.imageNamed('JS/assets/dot');
if (dot) {
  console.log(dot.imageOrientation);
}
```

**结果**：控制台输出 `up`。

## 对应的 iOS API

`UIImage.imageOrientation`。

## 参见

- [`size`](size.md)：已经转正的宽高

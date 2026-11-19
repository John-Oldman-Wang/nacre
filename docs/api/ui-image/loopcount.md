---
type: reference
native: UIImage.loopCount
---

# `UIImage`：`loopCount` 属性

**`loopCount`** 属性是动图一共播放几遍。

## 值

数，个数，没有单位，或者 `null`。

- 一直循环是 `Infinity`。
- 静态图是 `null`。
- 可以直接赋给图层动画的 `repeatCount`，见 [`CAAnimation`](../ca-animation.md)。

- 只读。给它赋值抛 `TypeError`。
- 图片不可变，这个值不会变，所以没有变化通知。

## 示例

```js
const loading = UIImage.imageNamed('JS/assets/anim.gif');
if (loading) {
  console.log(loading.loopCount);
}
```

**结果**：`anim.gif` 一直循环时，控制台输出 `Infinity`。

## 对应的 iOS API

`UIImage.loopCount`。

## 参见

- [`duration`](duration.md)
- [动图](../ui-image.md#动图)

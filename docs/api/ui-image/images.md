---
type: reference
native: UIImage.images
---

# `UIImage`：`images` 属性

**`images`** 属性是动图的每一帧，按播放的顺序排列。

## 值

`UIImage` 的数组，或者 `null`。

- 每一帧是一张静态图，`size` 和 `scale` 与整张图相同，可以单独显示。
- 静态图是 `null`。判断一张图是不是动图，就看它是不是 `null`。
- 解码后超过 64 MB 的动图也是 `null`，见[动图占多少内存](../ui-image.md#动图占多少内存)。

- 只读。给它赋值抛 `TypeError`。
- 图片不可变，这个值不会变，所以没有变化通知。

## 示例

```js
const loading = UIImage.imageNamed('JS/assets/anim.gif');
if (loading) {
  console.log(loading.images === null ? 0 : loading.images.length);
}
```

**结果**：`anim.gif` 是 4 帧时，控制台输出 `4`。

## 对应的 iOS API

`UIImage.images`。

## 参见

- [`frameDurations`](framedurations.md)
- [动图](../ui-image.md#动图)

---
type: reference
native: UIImage.frameDurations
---

# `UIImage`：`frameDurations` 属性

**`frameDurations`** 属性是动图每一帧显示的时长。

## 值

数的数组，单位是秒，或者 `null`。

- 个数和 [`images`](images.md) 相同。
- 文件里过短的时长读出来是 0.1：实测文件里写 0.01 秒和 0.005 秒的帧都读成 0.1。
- 静态图是 `null`。

- 只读。给它赋值抛 `TypeError`。
- 图片不可变，这个值不会变，所以没有变化通知。

## 示例

```js
const loading = UIImage.imageNamed('JS/assets/anim.gif');
if (loading && loading.frameDurations) {
  console.log(loading.frameDurations.join(','));
}
```

**结果**：`anim.gif` 是 4 帧、每帧 0.1 秒时，控制台输出 `0.1,0.1,0.1,0.1`。

## 对应的 iOS API

`UIImage.frameDurations`。

## 参见

- [`images`](images.md)、[`duration`](duration.md)

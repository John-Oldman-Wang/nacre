---
type: reference
native: UIImage.duration
---

# `UIImage`：`duration` 属性

**`duration`** 属性是动图播放一遍的时长。

## 值

数，单位是秒。静态图是 0。

等于 [`frameDurations`](framedurations.md) 里所有时长的和。**「等于和」未在模拟器验证。**

- 只读。给它赋值抛 `TypeError`。
- 图片不可变，这个值不会变，所以没有变化通知。

## 示例

```js
const loading = UIImage.imageNamed('JS/assets/anim.gif');
if (loading) {
  console.log(loading.duration.toFixed(1));
}
```

**结果**：`anim.gif` 是 4 帧、每帧 0.1 秒时，控制台输出 `0.4`。

## 对应的 iOS API

`UIImage.duration`。

## 参见

- [`frameDurations`](framedurations.md)、[`loopCount`](loopcount.md)
- [动图](../ui-image.md#动图)
